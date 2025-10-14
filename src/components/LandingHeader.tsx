import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { IconButton, MD2DarkTheme, Text } from "react-native-paper";
import Animated, { Extrapolation, FadeInUp, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetChipCategoriesQuery } from "../redux/movie/movieApi";
import { useAppSelector } from "../redux/store";
import useTranslation from "../service/useTranslation";
import PlatformBlurView from "./PlatformBlurView";
import { LinearGradient } from "expo-linear-gradient";

interface LandingHeaderProps {
  selectedChip?: string;
  onChipPress?: (chip: string) => void;

  scrollY?: SharedValue<number>;
}

const LandingHeader = ({ selectedChip = "all", onChipPress, scrollY }: LandingHeaderProps) => {
  const navigation = useNavigation<any>();

  const { data: chipCategories = [] } = useGetChipCategoriesQuery();

  const insets = useSafeAreaInsets();

  const chipsAnimatedStyle = useAnimatedStyle(() => {
    const opacity = scrollY ? interpolate(scrollY.value, [0, 60], [1, 0], Extrapolation.CLAMP) : 1;
    const translateY = scrollY ? interpolate(scrollY.value, [0, 60], [0, -20], Extrapolation.CLAMP) : 0;
    const height = scrollY ? interpolate(scrollY.value, [0, 60], [50, 0], Extrapolation.CLAMP) : 40;
    const marginLeft = scrollY ? interpolate(scrollY.value, [0, 60], [0, 20], Extrapolation.CLAMP) : 0;
    const marginRight = scrollY ? interpolate(scrollY.value, [0, 60], [0, 20], Extrapolation.CLAMP) : 0;

    return {
      opacity,
      height,
      marginLeft,
      marginRight,
      overflow: "hidden" as const,
      transform: [{ translateY }],
    };
  });

  const nickname = useAppSelector((state) => state.room.nickname);
  const t = useTranslation();

  return (
    <>
      <LinearGradient
        colors={["#000", "rgba(0,0,0,0.6)", "transparent"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 150, zIndex: 90 }}
        pointerEvents="none"
      />
      <Animated.View style={[styles.container]} entering={FadeInUp}>
        <View style={{ flex: 1, padding: 15, paddingTop: insets.top }}>
          <Animated.View>
            <Animated.View style={[styles.mainHeader]}>
              <Text style={styles.helloText}>
                {t("global.hello")} {nickname}!
              </Text>

              <PlatformBlurView style={[styles.buttonsContainer, { borderRadius: 100, overflow: "hidden" }]}>
                <IconButton
                  icon="cog"
                  size={25}
                  iconColor="#fff"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

                    navigation.navigate("Settings");
                  }}
                  style={styles.iconButton}
                />

                <IconButton
                  icon="magnify"
                  size={30}
                  iconColor="#fff"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

                    navigation.navigate("Search");
                  }}
                  style={styles.iconButton}
                />
              </PlatformBlurView>
            </Animated.View>

            {/* Chip buttons */}
            <Animated.View style={chipsAnimatedStyle}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
                {chipCategories.map((category, index) => (
                  <Animated.View key={category.id} entering={FadeInUp.delay(50 * (index + 1))}>
                    <PlatformBlurView style={styles.chipWrapper}>
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

                          onChipPress?.(category.id);
                        }}
                        style={[
                          styles.chip,
                          selectedChip === category.id && {
                            backgroundColor: MD2DarkTheme.colors.primary,
                          },
                        ]}
                      >
                        <Text style={[styles.chipText, selectedChip === category.id && styles.chipTextActive]}>{category.label}</Text>
                      </TouchableOpacity>
                    </PlatformBlurView>
                  </Animated.View>
                ))}
              </ScrollView>
            </Animated.View>
          </Animated.View>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: Platform.OS === "android" ? "#000" : "transparent",
  },
  mainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  helloContainer: {
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  helloText: {
    fontSize: 30,
    color: "#fff",
    fontFamily: "Bebas",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 5,
  },
  buttonBlur: {
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  iconButton: {
    margin: 0,
    width: 40,
    height: 45,
  },
  chipsContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  chipWrapper: {
    marginRight: 10,
    borderRadius: 100,
    overflow: "hidden",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipActive: {},
  chipText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default LandingHeader;
