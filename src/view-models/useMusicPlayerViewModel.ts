import { useState, useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';

export const useMusicPlayerViewModel = () => {
  const [url, setUrl] = useState<string | null>(null);
  const [loop, setLoop] = useState(false);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'duckOthers',
    });
  }, []);

  const player = useAudioPlayer(url);
  const status = useAudioPlayerStatus(player);

  // 루프 상태를 플레이어에 반영
  useEffect(() => {
    player.loop = loop;
  }, [player, loop]);

  const playMusic = (newUrl: string) => {
    if (url !== newUrl) {
      setUrl(newUrl);
    }
  };

  const togglePlayPause = () => {
    if (status.playing) {
      player.pause();
    } else {
      // 곡이 끝까지 재생된 상태에서 재생 버튼을 누르면 처음부터
      if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration)) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  const toggleLoop = () => {
    setLoop((prev) => !prev);
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
    loop,
    playMusic,
    togglePlayPause,
    toggleLoop,
    seekTo,
    skipBackward,
    skipForward,
  };
};
