import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { IconButton, Text } from "react-native-paper";
import Animated, { Extrapolation, FadeInUp, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppSelector } from "../redux/store";
import useTranslation from "../service/useTranslation";

interface LandingHeaderProps {
  selectedChip?: string;
  onChipPress?: (chip: string) => void;

  scrollY?: SharedValue<number>;
}

const LandingHeader = ({ selectedChip = "all", onChipPress, scrollY }: LandingHeaderProps) => {
  const navigation = useNavigation<any>();
  const t = useTranslation();

  const chipCategories = [
    { id: "all", label: t("landing.chips.all") },
    { id: "trending", label: t("landing.chips.trending") },
    { id: "movies", label: t("voter.types.movie") },
    { id: "series", label: t("voter.types.series") },
    { id: "new", label: t("landing.chips.new") },
  ];

  const insets = useSafeAreaInsets();

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const chipsHeight = scrollY ? interpolate(scrollY.value, [0, 60], [40, 0], Extrapolation.CLAMP) : 40;

    return {
      height: 55 + chipsHeight + insets.top,
    };
  });

  const mainHeaderAnimatedStyle = useAnimatedStyle(() => {
    const marginLeft = scrollY ? interpolate(scrollY.value, [0, 60], [0, 20], Extrapolation.CLAMP) : 0;
    const marginRight = scrollY ? interpolate(scrollY.value, [0, 60], [0, 20], Extrapolation.CLAMP) : 0;

    return {
      marginLeft,
      marginRight,
    };
  });

  const chipsAnimatedStyle = useAnimatedStyle(() => {
    const opacity = scrollY ? interpolate(scrollY.value, [0, 60], [1, 0], Extrapolation.CLAMP) : 1;
    const translateY = scrollY ? interpolate(scrollY.value, [0, 60], [0, -20], Extrapolation.CLAMP) : 0;
    const height = scrollY ? interpolate(scrollY.value, [0, 60], [40, 0], Extrapolation.CLAMP) : 40;
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

  return (
    <Animated.View style={[styles.container, headerAnimatedStyle]} entering={FadeInUp}>
      <BlurView style={{ flex: 1, padding: 15, paddingTop: insets.top }} intensity={60} tint="dark">
        <Animated.View>
          <Animated.View style={[styles.mainHeader, mainHeaderAnimatedStyle]}>
            <Text style={styles.helloText}>Hi {nickname}!</Text>

            <Animated.View style={[styles.buttonsContainer]}>
              <IconButton icon="cog" size={24} iconColor="#fff" onPress={() => navigation.navigate("Settings")} style={styles.iconButton} />

              <IconButton
                icon="magnify"
                size={30}
                iconColor="#fff"
                onPress={() => navigation.navigate("Search")}
                style={styles.iconButton}
              />
            </Animated.View>
          </Animated.View>

          {/* Chip buttons */}
          <Animated.View style={chipsAnimatedStyle}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
              {chipCategories.map((category, index) => (
                <Animated.View key={category.id} entering={FadeInUp.delay(50 * (index + 1))}>
                  <TouchableOpacity
                    onPress={() => onChipPress?.(category.id)}
                    style={[
                      styles.chipWrapper,
                      selectedChip === category.id && {
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    ]}
                  >
                    <BlurView style={[styles.chip]} intensity={selectedChip === category.id ? 15 : 5}>
                      <Text style={[styles.chipText, selectedChip === category.id && styles.chipTextActive]}>{category.label}</Text>
                    </BlurView>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
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
  },
  buttonBlur: {
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  iconButton: {
    margin: 0,
    width: 50,
    height: 50,
  },
  chipsContainer: {
    flexDirection: "row",
  },
  chipWrapper: {
    marginRight: 10,
    borderRadius: 100,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
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
