package com.brajdarshan.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.Locale

class DevotionalAudioModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), TextToSpeech.OnInitListener {

    private var mediaPlayer: MediaPlayer? = null
    private var textToSpeech: TextToSpeech? = null
    private var isTtsReady: Boolean = false
    private var currentTrackId: String = ""
    private var currentTrackTitle: String = ""
    private var currentTrackArtist: String = ""
    private var currentTrackUrl: String = ""
    private var isPaused: Boolean = false

    private val progressHandler = Handler(Looper.getMainLooper())
    private var progressRunnable: Runnable? = null

    // Audio focus: pause for phone calls, alarms and other apps; resume after a
    // short interruption (such as a call) ends; duck under navigation prompts.
    private val audioManager =
        reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private var focusRequest: AudioFocusRequest? = null
    private var resumeOnFocusGain = false
    private var noisyReceiverRegistered = false

    private val mediaAttributes: AudioAttributes = AudioAttributes.Builder()
        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
        .setUsage(AudioAttributes.USAGE_MEDIA)
        .build()

    private val focusListener = AudioManager.OnAudioFocusChangeListener { change ->
        progressHandler.post { handleFocusChange(change) }
    }

    // Headphones unplugged or Bluetooth disconnected: pause instead of switching to the speaker.
    private val noisyReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == AudioManager.ACTION_AUDIO_BECOMING_NOISY) {
                progressHandler.post {
                    resumeOnFocusGain = false
                    pauseInternal()
                }
            }
        }
    }

    init {
        try {
            textToSpeech = TextToSpeech(reactContext, this)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun getName(): String = "DevotionalAudio"

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            try {
                val result = textToSpeech?.setLanguage(Locale("hi", "IN"))
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    textToSpeech?.setLanguage(Locale.ENGLISH)
                }
                textToSpeech?.setSpeechRate(0.88f)
                textToSpeech?.setPitch(1.0f)
                isTtsReady = true
            } catch (e: Exception) {
                isTtsReady = false
            }
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        try {
            if (reactContext.hasActiveReactInstance()) {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(eventName, params)
            }
        } catch (e: Exception) {
            // Ignore if context is tearing down
        }
    }

    private fun startProgressUpdates() {
        stopProgressUpdates()
        progressRunnable = object : Runnable {
            override fun run() {
                try {
                    val player = mediaPlayer
                    if (player != null && player.isPlaying) {
                        val params = Arguments.createMap().apply {
                            putInt("position", player.currentPosition)
                            putInt("duration", player.duration)
                            putString("trackId", currentTrackId)
                        }
                        sendEvent("onPlaybackProgress", params)
                        progressHandler.postDelayed(this, 500)
                    }
                } catch (e: Exception) {
                    // Ignored
                }
            }
        }
        progressRunnable?.let { progressHandler.post(it) }
    }

    private fun stopProgressUpdates() {
        progressRunnable?.let { progressHandler.removeCallbacks(it) }
        progressRunnable = null
    }

    private fun requestFocus(): Boolean {
        val result = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                .setAudioAttributes(mediaAttributes)
                .setOnAudioFocusChangeListener(focusListener, progressHandler)
                .build()
            focusRequest = request
            audioManager.requestAudioFocus(request)
        } else {
            @Suppress("DEPRECATION")
            audioManager.requestAudioFocus(
                focusListener,
                AudioManager.STREAM_MUSIC,
                AudioManager.AUDIOFOCUS_GAIN
            )
        }
        return result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED
    }

    private fun abandonFocus() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                focusRequest?.let { audioManager.abandonAudioFocusRequest(it) }
            } else {
                @Suppress("DEPRECATION")
                audioManager.abandonAudioFocus(focusListener)
            }
        } catch (e: Exception) {
            // Ignore
        }
    }

    private fun registerNoisyReceiver() {
        if (noisyReceiverRegistered) return
        try {
            val filter = IntentFilter(AudioManager.ACTION_AUDIO_BECOMING_NOISY)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                reactContext.registerReceiver(noisyReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
            } else {
                reactContext.registerReceiver(noisyReceiver, filter)
            }
            noisyReceiverRegistered = true
        } catch (e: Exception) {
            // Ignore
        }
    }

    private fun unregisterNoisyReceiver() {
        if (!noisyReceiverRegistered) return
        try {
            reactContext.unregisterReceiver(noisyReceiver)
        } catch (e: Exception) {
            // Ignore
        }
        noisyReceiverRegistered = false
    }

    private fun handleFocusChange(change: Int) {
        val player = mediaPlayer ?: return
        try {
            when (change) {
                AudioManager.AUDIOFOCUS_LOSS -> {
                    resumeOnFocusGain = false
                    pauseInternal()
                    abandonFocus()
                }
                AudioManager.AUDIOFOCUS_LOSS_TRANSIENT -> {
                    if (player.isPlaying) {
                        resumeOnFocusGain = true
                        pauseInternal()
                    }
                }
                AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK -> player.setVolume(0.2f, 0.2f)
                AudioManager.AUDIOFOCUS_GAIN -> {
                    player.setVolume(1f, 1f)
                    if (resumeOnFocusGain && isPaused) {
                        resumeOnFocusGain = false
                        resumeInternal()
                    }
                }
            }
        } catch (e: Exception) {
            // Ignore
        }
    }

    private fun pauseInternal(): WritableMap? {
        val player = mediaPlayer ?: return null
        if (!player.isPlaying) return null
        player.pause()
        isPaused = true
        stopProgressUpdates()
        val map = Arguments.createMap().apply {
            putString("state", "paused")
            putString("trackId", currentTrackId)
            putInt("position", player.currentPosition)
        }
        sendEvent("onPlaybackStateChange", map)
        return map
    }

    private fun resumeInternal(): WritableMap? {
        val player = mediaPlayer ?: return null
        if (player.isPlaying) return null
        player.start()
        isPaused = false
        registerNoisyReceiver()
        startProgressUpdates()
        val map = Arguments.createMap().apply {
            putString("state", "playing")
            putString("trackId", currentTrackId)
            putInt("position", player.currentPosition)
        }
        sendEvent("onPlaybackStateChange", map)
        return map
    }

    @ReactMethod
    fun playTrack(trackData: ReadableMap, promise: Promise) {
        try {
            val url = if (trackData.hasKey("audioUrl")) trackData.getString("audioUrl") ?: "" else ""
            val id = if (trackData.hasKey("id")) trackData.getString("id") ?: "" else ""
            val title = if (trackData.hasKey("title")) trackData.getString("title") ?: "" else ""
            val artist = if (trackData.hasKey("artist")) trackData.getString("artist") ?: "" else ""

            if (url.isEmpty()) {
                promise.reject("INVALID_URL", "Audio URL is empty")
                return
            }

            stopInternal()

            if (!requestFocus()) {
                promise.reject("AUDIO_FOCUS_DENIED", "Audio is in use by another app or a phone call")
                return
            }
            registerNoisyReceiver()

            currentTrackId = id
            currentTrackTitle = title
            currentTrackArtist = artist
            currentTrackUrl = url
            isPaused = false

            mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(mediaAttributes)
                setDataSource(url)
                setOnPreparedListener { mp ->
                    mp.start()
                    startProgressUpdates()
                    val map = Arguments.createMap().apply {
                        putString("state", "playing")
                        putString("trackId", currentTrackId)
                        putString("title", currentTrackTitle)
                        putInt("duration", mp.duration)
                    }
                    sendEvent("onPlaybackStateChange", map)
                    promise.resolve(map)
                }
                setOnCompletionListener {
                    stopProgressUpdates()
                    val map = Arguments.createMap().apply {
                        putString("state", "ended")
                        putString("trackId", currentTrackId)
                    }
                    sendEvent("onPlaybackStateChange", map)
                }
                setOnErrorListener { _, what, extra ->
                    stopProgressUpdates()
                    val map = Arguments.createMap().apply {
                        putString("state", "error")
                        putInt("what", what)
                        putInt("extra", extra)
                    }
                    sendEvent("onPlaybackStateChange", map)
                    true
                }
                prepareAsync()
            }
        } catch (e: Exception) {
            promise.reject("PLAYBACK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun pause(promise: Promise) {
        try {
            resumeOnFocusGain = false
            promise.resolve(pauseInternal())
        } catch (e: Exception) {
            promise.reject("PAUSE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun resume(promise: Promise) {
        try {
            if (mediaPlayer != null && !requestFocus()) {
                promise.reject("AUDIO_FOCUS_DENIED", "Audio is in use by another app or a phone call")
                return
            }
            promise.resolve(resumeInternal())
        } catch (e: Exception) {
            promise.reject("RESUME_ERROR", e.message, e)
        }
    }

    private fun stopInternal() {
        stopProgressUpdates()
        resumeOnFocusGain = false
        unregisterNoisyReceiver()
        abandonFocus()
        mediaPlayer?.let {
            try {
                if (it.isPlaying) {
                    it.stop()
                }
                it.reset()
                it.release()
            } catch (e: Exception) {
                // Ignore
            }
        }
        mediaPlayer = null
        isPaused = false
    }

    @ReactMethod
    fun stop(promise: Promise) {
        try {
            stopInternal()
            val map = Arguments.createMap().apply {
                putString("state", "stopped")
                putString("trackId", currentTrackId)
            }
            sendEvent("onPlaybackStateChange", map)
            currentTrackId = ""
            currentTrackTitle = ""
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("STOP_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun seekTo(positionMs: Double, promise: Promise) {
        try {
            val player = mediaPlayer
            if (player != null) {
                player.seekTo(positionMs.toInt())
                val map = Arguments.createMap().apply {
                    putInt("position", player.currentPosition)
                    putInt("duration", player.duration)
                }
                promise.resolve(map)
            } else {
                promise.reject("NOT_READY", "Player is not initialized")
            }
        } catch (e: Exception) {
            promise.reject("SEEK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getStatus(promise: Promise) {
        try {
            val player = mediaPlayer
            val isPlaying = player?.isPlaying ?: false
            val pos = player?.currentPosition ?: 0
            val dur = player?.duration ?: 0
            val map = Arguments.createMap().apply {
                putBoolean("isPlaying", isPlaying)
                putBoolean("isPaused", isPaused)
                putInt("position", pos)
                putInt("duration", dur)
                putString("trackId", currentTrackId)
                putString("title", currentTrackTitle)
                putString("artist", currentTrackArtist)
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("STATUS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun speakDevotionalChant(text: String, promise: Promise) {
        try {
            if (isTtsReady && textToSpeech != null) {
                textToSpeech?.stop()
                textToSpeech?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "devotional_chant")
                val map = Arguments.createMap().apply {
                    putBoolean("success", true)
                    putString("text", text)
                }
                promise.resolve(map)
            } else {
                promise.reject("TTS_NOT_READY", "Text-to-speech engine is not initialized yet")
            }
        } catch (e: Exception) {
            promise.reject("TTS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for React Native NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Double) {
        // Required for React Native NativeEventEmitter
    }

    override fun invalidate() {
        super.invalidate()
        stopInternal()
        try {
            textToSpeech?.stop()
            textToSpeech?.shutdown()
        } catch (e: Exception) {
            // Ignore
        }
    }
}
