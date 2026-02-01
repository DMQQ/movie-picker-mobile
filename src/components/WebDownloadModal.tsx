import { useState, useEffect } from "react";
import { View, StyleSheet, Modal, Platform, Pressable, Linking } from "react-native";
import { Text, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

const APP_STORE_URL = "https://apps.apple.com/us/app/flickmate-movie-night-picker/id6741321848";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=pl.dmq.moviepicker";

const SHOW_DELAY_MS = 60 * 1000; // 1 minute

export default function WebDownloadModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  if (Platform.OS !== "web") return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Get the Full Experience</Text>
          <Text style={styles.subtitle}>
            This is a preview of the mobile app. Download Flickmate for the best experience with all features.
          </Text>

          <View style={styles.buttonsContainer}>
            <Pressable
              style={styles.storeButton}
              onPress={() => Linking.openURL(APP_STORE_URL)}
            >
              <Ionicons name="logo-apple" size={24} color="#fff" />
              <View style={styles.storeButtonText}>
                <Text style={styles.storeButtonLabel}>Download on the</Text>
                <Text style={styles.storeButtonTitle}>App Store</Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.storeButton}
              onPress={() => Linking.openURL(PLAY_STORE_URL)}
            >
              <Ionicons name="logo-google-playstore" size={24} color="#fff" />
              <View style={styles.storeButtonText}>
                <Text style={styles.storeButtonLabel}>Get it on</Text>
                <Text style={styles.storeButtonTitle}>Google Play</Text>
              </View>
            </Pressable>
          </View>

          <Button
            mode="text"
            onPress={() => setVisible(false)}
            textColor="rgba(255,255,255,0.6)"
            style={styles.continueButton}
          >
            Continue to web preview
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    padding: 32,
    maxWidth: 400,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  title: {
    fontSize: 28,
    fontFamily: "Bebas",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
  },
  storeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    gap: 12,
  },
  storeButtonText: {
    flex: 1,
  },
  storeButtonLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
  },
  storeButtonTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  continueButton: {
    marginTop: 20,
  },
});
