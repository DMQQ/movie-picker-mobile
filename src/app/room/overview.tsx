import React, { useState, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";
import { colors, fontWeight } from "../../constants/design";
import PagerView from "react-native-pager-view";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { router } from "expo-router";
import useTranslation from "../../service/useTranslation";
import MatchesScreen from "../../screens/Overview/Matches";
import LikesScreen from "../../screens/Overview/Likes";

const TRACK_HEIGHT = 40;
const TRACK_PADDING = 3;
const PILL_HEIGHT = TRACK_HEIGHT - TRACK_PADDING * 2;
const PILL_RADIUS = PILL_HEIGHT / 2;

export default function RoomOverview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pillWidth, setPillWidth] = useState(0);
  const theme = useTheme();
  const t = useTranslation();
  const pagerRef = useRef<PagerView>(null);
  const pillX = useSharedValue(0);

  const tabs = [
    { key: "matches", title: t("overview.matches") as string },
    { key: "likes", title: t("overview.likes") as string },
  ];

  const slidePill = (index: number) => {
    pillX.value = withSpring(index * pillWidth, {
      damping: 22,
      stiffness: 220,
    });
  };

  const onPageSelected = (e: any) => {
    const index = e.nativeEvent.position;
    setActiveIndex(index);
    slidePill(index);
  };

  const onTabPress = (index: number) => {
    setActiveIndex(index);
    pagerRef.current?.setPage(index);
    slidePill(index);
  };

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <IconButton
          icon="chevron-left"
          onPress={() => router.back()}
          size={28}
          iconColor="#fff"
        />

        <View
          style={styles.track}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            const pw = (w - TRACK_PADDING * 2) / tabs.length;
            setPillWidth(pw);
          }}
        >
          <Animated.View
            style={[
              styles.pill,
              { width: pillWidth, backgroundColor: theme.colors.primary },
              pillStyle,
            ]}
          />
          {tabs.map((tab, index) => (
            <Pressable
              key={tab.key}
              style={styles.tab}
              onPress={() => onTabPress(index)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeIndex === index && styles.tabLabelActive,
                ]}
              >
                {tab.title}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={onPageSelected}
      >
        <View key="matches" style={styles.page}>
          <MatchesScreen />
        </View>
        <View key="likes" style={styles.page}>
          <LikesScreen />
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    height: 56,
  },
  track: {
    flex: 1,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: "#1c1c1c",
    flexDirection: "row",
    padding: TRACK_PADDING,
    overflow: "hidden",
  },
  pill: {
    position: "absolute",
    left: TRACK_PADDING,
    top: TRACK_PADDING,
    height: PILL_HEIGHT,
    borderRadius: PILL_RADIUS,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: fontWeight.medium,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: "#000",
    fontWeight: fontWeight.bold,
  },
  headerSpacer: {
    width: 48,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    paddingBottom: 15,
  },
});
