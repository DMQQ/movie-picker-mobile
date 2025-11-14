import React, { useState } from "react";
import { View, Dimensions, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import PagerView from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import useTranslation from "../../service/useTranslation";
import MatchesScreen from "../../screens/Overview/Matches";
import LikesScreen from "../../screens/Overview/Likes";
import { router } from "expo-router";
import { IconButton } from "react-native-paper";

export default function RoomOverview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const theme = useTheme();
  const t = useTranslation();
  const screenWidth = Dimensions.get("window").width;

  const indicatorPosition = useSharedValue(0);

  const tabs = [
    { key: "matches", title: t("overview.matches"), component: MatchesScreen },
    { key: "likes", title: t("overview.likes"), component: LikesScreen },
  ];

  const tabWidth = screenWidth / tabs.length;

  const onPageSelected = (event: any) => {
    const index = event.nativeEvent.position;
    setActiveIndex(index);
    indicatorPosition.value = withSpring(index * tabWidth, {
      damping: 20,
      stiffness: 150,
    });
  };

  const onTabPress = (index: number) => {
    setActiveIndex(index);
    indicatorPosition.value = withSpring(index * tabWidth, {
      damping: 20,
      stiffness: 150,
    });
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Header with back button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 8,
          height: 56,
        }}
      >
        <IconButton icon="chevron-left" onPress={() => router.back()} size={28} iconColor="#fff" />

        {/* Tab Bar */}
        <View style={{ flex: 1, flexDirection: "row", position: "relative" }}>
          <Animated.View
            style={[
              {
                position: "absolute",
                bottom: 0,
                height: 2,
                backgroundColor: theme.colors.primary,
                width: tabWidth,
              },
              indicatorStyle,
            ]}
          />

          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.key}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: "center",
              }}
              onPress={() => onTabPress(index)}
            >
              <Text
                style={{
                  color: activeIndex === index ? theme.colors.primary : "rgba(255, 255, 255, 0.7)",
                  fontSize: 14,
                  fontWeight: activeIndex === index ? "600" : "400",
                }}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pager Content */}
      <PagerView style={{ flex: 1 }} initialPage={0} onPageSelected={onPageSelected}>
        <View key="matches" style={{ flex: 1 }}>
          <MatchesScreen />
        </View>
        <View key="likes" style={{ flex: 1 }}>
          <LikesScreen />
        </View>
      </PagerView>
    </View>
  );
}
