import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import audioService from '../services/audioService';
import audioTracks from '../data/audioTracks.json';

const AudioContext = createContext();

export function AudioProvider({ children }) {
  const [tracks] = useState(audioTracks);
  const [currentTrack, setCurrentTrack] = useState(audioTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(audioTracks[0].approxSeconds * 1000);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState(false);

  // Subscribe to native playback state & progress
  useEffect(() => {
    const unsubState = audioService.subscribeState((event) => {
      if (event.state === 'playing') {
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
          // Auto advance to next track
          audioService.playNext().catch(() => {});
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

  const nextTrack = async () => {
    const res = await audioService.playNext();
    const curr = audioService.getCurrentTrack();
    if (curr) {
      setCurrentTrack(curr);
      setIsMiniPlayerVisible(true);
      if (curr.approxSeconds) setDuration(curr.approxSeconds * 1000);
    }
    return res;
  };

  const previousTrack = async () => {
    const res = await audioService.playPrevious();
    const curr = audioService.getCurrentTrack();
    if (curr) {
      setCurrentTrack(curr);
      setIsMiniPlayerVisible(true);
      if (curr.approxSeconds) setDuration(curr.approxSeconds * 1000);
    }
    return res;
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
