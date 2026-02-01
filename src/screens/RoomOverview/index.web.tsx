import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Text, useTheme, IconButton } from "react-native-paper";
import useTranslation from "../../service/useTranslation";
import MatchesScreen from "../Overview/Matches";
import LikesScreen from "../Overview/Likes";
import { router } from "expo-router";

export default function RoomOverview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const theme = useTheme();
  const t = useTranslation();

  const tabs = [
    { key: "matches", title: t("overview.matches"), component: MatchesScreen },
    { key: "likes", title: t("overview.likes"), component: LikesScreen },
  ];

  const ActiveComponent = tabs[activeIndex].component;

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
              onPress={() => setActiveIndex(index)}
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

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        <ActiveComponent />
      </View>
    </View>
  );
}
