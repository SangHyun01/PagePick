
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  GestureResponderEvent,
  LayoutChangeEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AudioTrack } from "@/types/music";
import { useMusicPlayerViewModel } from "@/view-models/useMusicPlayerViewModel";
import { SIZES } from "@/constants/theme";

interface MusicPlayerProps {
  track: AudioTrack;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const MusicPlayer: React.FC<MusicPlayerProps> = ({ track }) => {
  const {
    isPlaying,
    isBuffering,
    isLoaded,
    currentTime,
    duration,
    playMusic,
    togglePlayPause,
    seekTo,
    skipBackward,
    skipForward,
  } = useMusicPlayerViewModel();

  const progressBarWidth = useRef(0);

  useEffect(() => {
    if (track?.url) {
      playMusic(track.url);
    }
  }, [track]);

  if (!track) {
    return null;
  }

  const progress = duration > 0 ? currentTime / duration : 0;

  const handleProgressBarLayout = (e: LayoutChangeEvent) => {
    progressBarWidth.current = e.nativeEvent.layout.width;
  };

  const handleProgressBarPress = (e: GestureResponderEvent) => {
    if (duration <= 0 || progressBarWidth.current <= 0) return;
    const x = e.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(x / progressBarWidth.current, 1));
    seekTo(ratio * duration);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {track.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {track.artist}
          </Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleProgressBarPress}
          onLayout={handleProgressBarLayout}
          style={styles.progressBarTouchable}
        >
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progress * 100}%` },
              ]}
            />
          </View>
        </TouchableOpacity>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={skipBackward} disabled={!isLoaded}>
          <Ionicons
            name="play-back"
            size={24}
            color={isLoaded ? "white" : "#666"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlayPause}
          disabled={!isLoaded}
        >
          {isBuffering && !isPlaying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={28}
              color="white"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={skipForward} disabled={!isLoaded}>
          <Ionicons
            name="play-forward"
            size={24}
            color={isLoaded ? "white" : "#666"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2C2C2E",
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.base,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "white",
    fontSize: SIZES.body3,
    fontWeight: "bold",
  },
  artist: {
    color: "#9A9A9A",
    fontSize: SIZES.body4,
  },
  progressSection: {
    marginTop: SIZES.base,
    paddingHorizontal: SIZES.base,
  },
  progressBarTouchable: {
    paddingVertical: 8,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: "#4A4A4A",
    borderRadius: 1.5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 1.5,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  timeText: {
    color: "#9A9A9A",
    fontSize: SIZES.body4 - 2,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    marginTop: SIZES.base,
    paddingBottom: 4,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4A4A4A",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MusicPlayer;
