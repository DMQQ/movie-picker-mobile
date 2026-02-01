import React, { useState, useRef } from "react";
import { View, TouchableOpacity } from "react-native";
import { Text, useTheme, IconButton } from "react-native-paper";
import PagerView from "react-native-pager-view";
import useTranslation from "../../service/useTranslation";
import MatchesScreen from "../Overview/Matches";
import LikesScreen from "../Overview/Likes";
import { router } from "expo-router";

export default function RoomOverview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const theme = useTheme();
  const t = useTranslation();
  const pagerRef = useRef<PagerView>(null);

  const tabs = [
    { key: "matches", title: t("overview.matches"), component: MatchesScreen },
    { key: "likes", title: t("overview.likes"), component: LikesScreen },
  ];

  const onPageSelected = (event: any) => {
    const index = event.nativeEvent.position;
    setActiveIndex(index);
  };

  const onTabPress = (index: number) => {
    setActiveIndex(index);
    pagerRef.current?.setPage(index);
  };

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
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12 }}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.key}
              style={{
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                backgroundColor: activeIndex === index ? theme.colors.primary : theme.colors.surface,
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderWidth: activeIndex === index ? 0 : 1,
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
              onPress={() => onTabPress(index)}
            >
              <Text
                style={{
                  color: activeIndex === index ? "#000" : "rgba(255, 255, 255, 0.8)",
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
      <PagerView ref={pagerRef} style={{ flex: 1 }} initialPage={0} onPageSelected={onPageSelected}>
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
