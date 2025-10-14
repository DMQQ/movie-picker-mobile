import { useNavigation } from "@react-navigation/native";
import { GlassView } from "expo-glass-effect";
import * as Haptic from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PlatformBlurView from "./PlatformBlurView";
import { AntDesign, Ionicons } from "@expo/vector-icons";

export default function PageHeading({
  title,
  onPress,
  showBackButton = true,
  useSafeArea = true,
  showGradientBackground = true,
  gradientHeight = 150,

  children,
}: PropsWithChildren<{
  title: string;
  onPress?: () => void;
  showBackButton?: boolean;

  showGradientBackground?: boolean;
  gradientHeight?: number;
  useSafeArea?: boolean;
}>) {
  const navigation = useNavigation();

  const insets = useSafeAreaInsets();
  return (
    <>
      {showGradientBackground && (
        <LinearGradient
          colors={["#000", "rgba(0,0,0,0.6)", "transparent"]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: gradientHeight, zIndex: 10 }}
          pointerEvents="none"
        />
      )}
      <View style={[styles.headerTop, { marginTop: useSafeArea ? insets.top : 0 }]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", width: "100%" }}>
          {showBackButton && (
            <Pressable
              style={styles.backButton}
              onPress={() => {
                typeof onPress !== "undefined" ? onPress() : navigation.goBack();

                if (Platform.OS === "ios") {
                  Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <PlatformBlurView
                isInteractive
                style={[
                  Platform.OS === "android" && {
                    backgroundColor: "rgba(0,0,0,0.5)",
                  },
                  { padding: 10, borderRadius: 1000 },
                ]}
              >
                <Ionicons name="chevron-back" size={25} color={"#fff"} />
              </PlatformBlurView>
            </Pressable>
          )}

          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        {children}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerTop: {
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: "Bebas",
    fontSize: 32,
    color: "#fff",
    flex: 1,
    textAlign: "center",
    paddingTop: 10,
  },
  backButton: {
    marginRight: 8,
    position: "absolute",
    left: 15,
    zIndex: 1,
    top: Platform.OS === "android" ? 10 : 5,
    borderRadius: 1000,
  },
});
