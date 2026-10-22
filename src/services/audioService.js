import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import audioTracks from '../data/audioTracks.json';

const { DevotionalAudio } = NativeModules;

// Safely initialize event emitter
const audioEmitter =
  Platform.OS === 'android' && DevotionalAudio
    ? new NativeEventEmitter(DevotionalAudio)
    : null;

class AudioService {
  constructor() {
    this.tracks = audioTracks;
    this.currentIndex = 0;
    this.isLooping = false;
    this.stateListeners = new Set();
    this.progressListeners = new Set();

    this._setupNativeListeners();
  }

  _setupNativeListeners() {
    if (!audioEmitter) return;

    this.stateSub = audioEmitter.addListener('onPlaybackStateChange', (event) => {
      this.stateListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (e) {
          console.warn('Error in audio state listener:', e);
        }
      });
    });

    this.progressSub = audioEmitter.addListener('onPlaybackProgress', (event) => {
      this.progressListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (e) {
          console.warn('Error in audio progress listener:', e);
        }
      });
    });
  }

  subscribeState(callback) {
    this.stateListeners.add(callback);
    return () => this.stateListeners.delete(callback);
  }

  subscribeProgress(callback) {
    this.progressListeners.add(callback);
    return () => this.progressListeners.delete(callback);
  }

  getTracks() {
    return this.tracks;
  }

  getCurrentTrack() {
    return this.tracks[this.currentIndex] || this.tracks[0];
  }

  async playTrack(track, index = null) {
    if (index !== null) {
      this.currentIndex = index;
    } else {
      const foundIdx = this.tracks.findIndex((t) => t.id === track.id);
      if (foundIdx !== -1) {
        this.currentIndex = foundIdx;
      }
    }

    if (DevotionalAudio && DevotionalAudio.playTrack) {
      try {
        return await DevotionalAudio.playTrack({
          id: track.id,
          title: track.titleHindi || track.titleEn,
          artist: track.deity || 'ब्रज धाम',
          audioUrl: track.audioUrl,
        });
      } catch (err) {
        console.warn('DevotionalAudio play error:', err);
        return null;
      }
    }
    return null;
  }

  async pause() {
    if (DevotionalAudio && DevotionalAudio.pause) {
      try {
        return await DevotionalAudio.pause();
      } catch (err) {
        console.warn('DevotionalAudio pause error:', err);
      }
    }
    return null;
  }

  async resume() {
    if (DevotionalAudio && DevotionalAudio.resume) {
      try {
        return await DevotionalAudio.resume();
      } catch (err) {
        console.warn('DevotionalAudio resume error:', err);
      }
    }
    return null;
  }

  async stop() {
    if (DevotionalAudio && DevotionalAudio.stop) {
      try {
        return await DevotionalAudio.stop();
      } catch (err) {
        console.warn('DevotionalAudio stop error:', err);
      }
    }
    return null;
  }

  async seekTo(positionMs) {
    if (DevotionalAudio && DevotionalAudio.seekTo) {
      try {
        return await DevotionalAudio.seekTo(positionMs);
      } catch (err) {
        console.warn('DevotionalAudio seekTo error:', err);
      }
    }
    return null;
  }

  async playNext() {
    if (this.tracks.length === 0) return null;
    let nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.tracks.length) {
      nextIndex = 0;
    }
    this.currentIndex = nextIndex;
    return this.playTrack(this.tracks[nextIndex], nextIndex);
  }

  async playPrevious() {
    if (this.tracks.length === 0) return null;
    let prevIndex = this.currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.tracks.length - 1;
    }
    this.currentIndex = prevIndex;
    return this.playTrack(this.tracks[prevIndex], prevIndex);
  }

  async speakChant(chant = 'राधे राधे') {
    if (DevotionalAudio && DevotionalAudio.speakDevotionalChant) {
      try {
        return await DevotionalAudio.speakDevotionalChant(chant);
      } catch (err) {
        console.warn('DevotionalAudio speakDevotionalChant error:', err);
      }
    }
    return null;
  }
}

export const audioService = new AudioService();
export default audioService;
