
import React, { useEffect, useRef, useState } from "react";
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
import { getAllMusic } from "@/services/musicService";
import { SIZES } from "@/constants/theme";
import BottomSheet from "@/components/BottomSheet";

interface MusicPlayerProps {
  track: AudioTrack;
  onTrackChange: (track: AudioTrack) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const MusicPlayer: React.FC<MusicPlayerProps> = ({ track, onTrackChange }) => {
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
  const [isPlaylistVisible, setIsPlaylistVisible] = useState(false);
  const [playlist, setPlaylist] = useState<AudioTrack[]>([]);

  useEffect(() => {
    if (track?.url) {
      playMusic(track.url);
    }
  }, [track]);

  const openPlaylist = async () => {
    if (playlist.length === 0) {
      const tracks = await getAllMusic();
      setPlaylist(tracks);
    }
    setIsPlaylistVisible(true);
  };

  const selectTrack = (selected: AudioTrack) => {
    setIsPlaylistVisible(false);
    onTrackChange(selected);
  };

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

        <TouchableOpacity
          style={styles.listButton}
          onPress={openPlaylist}
        >
          <Ionicons name="list" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <BottomSheet
        isVisible={isPlaylistVisible}
        onClose={() => setIsPlaylistVisible(false)}
      >
        <Text style={styles.sheetTitle}>Playlist</Text>
        {playlist.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.playlistItem,
              item.id === track.id && styles.playlistItemActive,
            ]}
            onPress={() => selectTrack(item)}
          >
            <View style={styles.playlistItemText}>
              <Text
                style={[
                  styles.playlistItemTitle,
                  item.id === track.id && styles.playlistItemTitleActive,
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text style={styles.playlistItemArtist} numberOfLines={1}>
                {item.artist}
              </Text>
            </View>
            {item.id === track.id && (
              <Ionicons name="musical-note" size={18} color="#007AFF" />
            )}
          </TouchableOpacity>
        ))}
      </BottomSheet>
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
  listButton: {
    position: "absolute",
    right: SIZES.base,
  },
  sheetTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: "#333",
    marginBottom: SIZES.padding,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.base * 1.5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  playlistItemActive: {
    backgroundColor: "#F0F7FF",
    marginHorizontal: -SIZES.padding,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  playlistItemText: {
    flex: 1,
  },
  playlistItemTitle: {
    fontSize: SIZES.body3,
    fontWeight: "600",
    color: "#333",
  },
  playlistItemTitleActive: {
    color: "#007AFF",
  },
  playlistItemArtist: {
    fontSize: SIZES.body4,
    color: "#999",
    marginTop: 2,
  },
});

export default MusicPlayer;
