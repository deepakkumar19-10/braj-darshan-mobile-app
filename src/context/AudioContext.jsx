import React, { createContext, useContext, useState, useEffect } from 'react';
import audioService from '../services/audioService';
import audioTracks from '../data/audioTracks.json';

const AudioContext = createContext();

// The nearest other playable track after (1) or before (-1) the current one; null if none.
function findPlayable(direction) {
  const list = audioService.tracks || [];
  const n = list.length;
  for (let step = 1; step < n; step += 1) {
    const index = (((audioService.currentIndex + direction * step) % n) + n) % n;
    if (isTrackPlayable(list[index])) return { track: list[index], index };
  }
  return null;
}

export function isTrackPlayable(track) {
  return Boolean(track && track.audioUrl && track.licence);
}

export function AudioProvider({ children }) {
  const [tracks] = useState(audioTracks);
  const [currentTrack, setCurrentTrack] = useState(audioTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(audioTracks[0].approxSeconds * 1000);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState(false);
  // 'rights' = no licence recorded for the track; 'failed' = the stream could not start.
  const [playError, setPlayError] = useState(null);

  // Subscribe to native playback state & progress
  useEffect(() => {
    const unsubState = audioService.subscribeState((event) => {
      if (event.state === 'error') {
        setIsPlaying(false);
        setIsPaused(false);
        setPlayError('failed');
      } else if (event.state === 'playing') {
        setPlayError(null);
        setIsPlaying(true);
        setIsPaused(false);
        setIsMiniPlayerVisible(true);
        if (event.duration) setDuration(event.duration);
      } else if (event.state === 'paused') {
        setIsPlaying(false);
        setIsPaused(true);
      } else if (event.state === 'ended' || event.state === 'stopped') {
        setIsPlaying(false);
        setIsPaused(false);
        setPosition(0);
        if (event.state === 'ended') {
          // Auto advance, but only to another licensed track.
          const next = findPlayable(1);
          if (next) {
            setCurrentTrack(next.track);
            audioService.playTrack(next.track, next.index).catch(() => {});
          }
        }
      }
    });

    const unsubProgress = audioService.subscribeProgress((event) => {
      if (typeof event.position === 'number') {
        setPosition(event.position);
      }
      if (typeof event.duration === 'number' && event.duration > 0) {
        setDuration(event.duration);
      }
    });

    return () => {
      unsubState();
      unsubProgress();
    };
  }, []);

  const playTrack = async (track, index = null) => {
    setCurrentTrack(track);
    // Only tracks with a recorded licence are played (same rule as divyabraj.com).
    if (!isTrackPlayable(track)) {
      setPlayError('rights');
      setIsPlaying(false);
      return null;
    }
    setPlayError(null);
    setIsMiniPlayerVisible(true);
    setPosition(0);
    if (track.approxSeconds) {
      setDuration(track.approxSeconds * 1000);
    }
    return audioService.playTrack(track, index);
  };

  const pauseTrack = async () => {
    setIsPlaying(false);
    setIsPaused(true);
    return audioService.pause();
  };

  const resumeTrack = async () => {
    setIsPlaying(true);
    setIsPaused(false);
    return audioService.resume();
  };

  const stopTrack = async () => {
    setIsPlaying(false);
    setIsPaused(false);
    setPosition(0);
    return audioService.stop();
  };

  const seekTo = async (posMs) => {
    setPosition(posMs);
    return audioService.seekTo(posMs);
  };

  // Skips go through playTrack so the licence rule applies to them too.
  const nextTrack = async () => {
    const next = findPlayable(1);
    return next ? playTrack(next.track, next.index) : null;
  };

  const previousTrack = async () => {
    const prev = findPlayable(-1);
    return prev ? playTrack(prev.track, prev.index) : null;
  };

  const speakChant = async (chantText) => {
    return audioService.speakChant(chantText);
  };

  const closeMiniPlayer = () => {
    setIsMiniPlayerVisible(false);
    stopTrack();
  };

  return (
    <AudioContext.Provider
      value={{
        tracks,
        currentTrack,
        isPlaying,
        isPaused,
        position,
        duration,
        isMiniPlayerVisible,
        playTrack,
        pauseTrack,
        resumeTrack,
        stopTrack,
        seekTo,
        nextTrack,
        previousTrack,
        speakChant,
        playError,
        clearPlayError: () => setPlayError(null),
        setIsMiniPlayerVisible,
        closeMiniPlayer,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
