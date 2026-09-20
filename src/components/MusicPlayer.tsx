import BottomSheet from "@/components/BottomSheet";
import { SIZES } from "@/constants/theme";
import { getAllMusic } from "@/services/musicService";
import { AudioTrack } from "@/types/music";
import { useMusicPlayerViewModel } from "@/view-models/useMusicPlayerViewModel";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
    loop,
    playMusic,
    togglePlayPause,
    toggleLoop,
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
  }, [track, playMusic]);

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
        <View style={styles.musicIcon}>
          <Ionicons name="musical-note" size={17} color="#375A4E" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {track.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {track.artist}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.playlistButton}
          onPress={openPlaylist}
          accessibilityRole="button"
          accessibilityLabel="음악 목록 열기"
        >
          <Ionicons name="list" size={19} color="#557A68" />
        </TouchableOpacity>
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
              style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
            />
          </View>
        </TouchableOpacity>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.loopButton} onPress={toggleLoop}>
          <Ionicons
            name="repeat"
            size={22}
            color={loop ? "#375A4E" : "#9AA79F"}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={skipBackward} disabled={!isLoaded}>
          <Ionicons
            name="play-back"
            size={24}
            color={isLoaded ? "#557A68" : "#B8C1BA"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlayPause}
          disabled={!isLoaded}
        >
          {isBuffering && !isPlaying ? (
            <ActivityIndicator size="small" color="#FFFDFC" />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={28}
              color="#FFFDFC"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={skipForward} disabled={!isLoaded}>
          <Ionicons
            name="play-forward"
            size={24}
            color={isLoaded ? "#557A68" : "#B8C1BA"}
          />
        </TouchableOpacity>

      </View>

      <BottomSheet
        isVisible={isPlaylistVisible}
        onClose={() => setIsPlaylistVisible(false)}
      >
        <Text style={styles.sheetTitle}>음악 플레이리스트</Text>
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
              <Ionicons name="musical-note" size={18} color="#375A4E" />
            )}
          </TouchableOpacity>
        ))}
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFDFC",
    padding: SIZES.padding * 0.85,
    borderRadius: SIZES.radius * 1.35,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
    borderWidth: 1,
    borderColor: "#E4E8E0",
    shadowColor: "#3A493F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.base / 2,
  },
  musicIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F0E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.base,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "#24332D",
    fontSize: SIZES.body3,
    fontWeight: "bold",
  },
  artist: {
    color: "#78857E",
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
    backgroundColor: "#E6EDE6",
    borderRadius: 1.5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#557A68",
    borderRadius: 1.5,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  timeText: {
    color: "#87958C",
    fontSize: SIZES.body4 - 2,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
    marginTop: SIZES.base / 2,
    paddingBottom: 2,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#375A4E",
    justifyContent: "center",
    alignItems: "center",
  },
  loopButton: {
    padding: SIZES.base / 2,
    position: "absolute",
    left: SIZES.base / 2,
  },
  playlistButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F4F0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SIZES.base,
  },
  sheetTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: "#24332D",
    marginBottom: SIZES.padding,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.base * 1.5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E9E3",
  },
  playlistItemActive: {
    backgroundColor: "#E8F0E9",
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
    color: "#24332D",
  },
  playlistItemTitleActive: {
    color: "#375A4E",
  },
  playlistItemArtist: {
    fontSize: SIZES.body4,
    color: "#78857E",
    marginTop: 2,
  },
});

export default MusicPlayer;
