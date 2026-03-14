import { useState } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

export const useMusicPlayerViewModel = () => {
  const [url, setUrl] = useState<string | null>(null);

  const player = useAudioPlayer(url);
  const status = useAudioPlayerStatus(player);

  const playMusic = (newUrl: string) => {
    if (url !== newUrl) {
      setUrl(newUrl);
    }
  };

  const togglePlayPause = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const seekTo = (seconds: number) => {
    const clamped = Math.max(0, Math.min(seconds, status.duration));
    player.seekTo(clamped);
  };

  const skipBackward = () => {
    seekTo(status.currentTime - 10);
  };

  const skipForward = () => {
    seekTo(status.currentTime + 10);
  };

  return {
    isPlaying: status.playing,
    isBuffering: status.isBuffering,
    isLoaded: status.isLoaded,
    currentTime: status.currentTime,
    duration: status.duration,
    playMusic,
    togglePlayPause,
    seekTo,
    skipBackward,
    skipForward,
  };
};
