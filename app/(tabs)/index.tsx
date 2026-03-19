import MusicPlayer from "@/components/MusicPlayer";
import { SIZES } from "@/constants/theme";
import { getTodaysMusic } from "@/services/musicService";
import { AudioTrack } from "@/types/music";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const [music, setMusic] = useState<AudioTrack | null>(null);

  useEffect(() => {
    const fetchMusic = async () => {
      const todaysMusic = await getTodaysMusic();
      setMusic(todaysMusic);
    };
    fetchMusic();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>PagePick</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString()}의 영감
        </Text>
      </View>

      <ScrollView
        style={styles.contentScrollView}
        contentContainerStyle={styles.contentScrollViewContainer}
      />

      {music && <MusicPlayer track={music} onTrackChange={setMusic} />}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => router.push("/camera")}
          activeOpacity={0.8}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="camera" size={SIZES.h1} color="#007AFF" />
          </View>
          <View style={styles.btnTextContainer}>
            <Text style={styles.mainButtonTitle}>문장 수집하기</Text>
            <Text style={styles.mainButtonDesc}>카메라로 책을 스캔하세요</Text>
          </View>
          <Ionicons name="chevron-forward" size={SIZES.h2} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    paddingTop: SIZES.padding * 2.5,
  },
  header: {
    marginBottom: SIZES.padding * 1.5,
    paddingHorizontal: SIZES.padding,
  },
  logoText: {
    fontSize: SIZES.h1,
    fontWeight: "900",
    color: "#333",
    letterSpacing: -0.5,
  },
  dateText: { fontSize: SIZES.body4, color: "#888", marginTop: SIZES.base / 2 },
  contentScrollView: {
    flex: 1,
  },
  contentScrollViewContainer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  actionContainer: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 1.5,
    backgroundColor: "#F7F8FA",
  },
  mainButton: {
    backgroundColor: "#007AFF",
    borderRadius: SIZES.radius * 1.5,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding + SIZES.base,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  iconCircle: {
    width: SIZES.padding * 2.2,
    height: SIZES.padding * 2.2,
    borderRadius: SIZES.padding * 1.1,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.base * 2,
  },
  btnTextContainer: { flex: 1 },
  mainButtonTitle: {
    color: "white",
    fontSize: SIZES.h3,
    fontWeight: "bold",
    marginBottom: SIZES.base / 2,
  },
  mainButtonDesc: {
    color: "rgba(255,255,255,0.8)",
    fontSize: SIZES.body4 - 1,
  },
});
