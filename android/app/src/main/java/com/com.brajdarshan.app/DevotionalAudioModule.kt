package com.brajdarshan.app

import android.media.AudioAttributes
import android.media.MediaPlayer
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

            currentTrackId = id
            currentTrackTitle = title
            currentTrackArtist = artist
            currentTrackUrl = url
            isPaused = false

            mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .build()
                )
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
            val player = mediaPlayer
            if (player != null && player.isPlaying) {
                player.pause()
                isPaused = true
                stopProgressUpdates()
                val map = Arguments.createMap().apply {
                    putString("state", "paused")
                    putString("trackId", currentTrackId)
                    putInt("position", player.currentPosition)
                }
                sendEvent("onPlaybackStateChange", map)
                promise.resolve(map)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.reject("PAUSE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun resume(promise: Promise) {
        try {
            val player = mediaPlayer
            if (player != null && !player.isPlaying) {
                player.start()
                isPaused = false
                startProgressUpdates()
                val map = Arguments.createMap().apply {
                    putString("state", "playing")
                    putString("trackId", currentTrackId)
                    putInt("position", player.currentPosition)
                }
                sendEvent("onPlaybackStateChange", map)
                promise.resolve(map)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.reject("RESUME_ERROR", e.message, e)
        }
    }

    private fun stopInternal() {
        stopProgressUpdates()
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
