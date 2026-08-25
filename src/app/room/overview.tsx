import React, { useState, useRef } from "react";
import IconButton from "../../components/IconButton";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing } from "../../constants/design";
import PagerView from "react-native-pager-view";
import { router } from "expo-router";
import useTranslation from "../../service/useTranslation";
import MatchesScreen from "../../screens/Overview/Matches";
import LikesScreen from "../../screens/Overview/Likes";
import SegmentedControl from "../../components/SegmentedControl";

export default function RoomOverview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const t = useTranslation();
  const pagerRef = useRef<PagerView>(null);

  const tabs = [
    { value: "matches", label: t("overview.matches") as string },
    { value: "likes", label: t("overview.likes") as string },
  ];

  const onPageSelected = (e: any) => {
    setActiveIndex(e.nativeEvent.position);
  };

  const handleTabChange = (value: string) => {
    const index = tabs.findIndex((t) => t.value === value);
    setActiveIndex(index);
    pagerRef.current?.setPage(index);
  };

  return (
    <View style={[styles.root]}>
      <View style={styles.header}>
        <IconButton
          icon="chevron-left"
          onPress={() => router.back()}
          size={28}
          iconColor={colors.text}
        />

        <SegmentedControl
          options={tabs}
          value={tabs[activeIndex].value}
          onChange={handleTabChange}
          duration={140}
          style={styles.control}
        />

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
    backgroundColor: colors.appBackground,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    height: 56,
  },
  control: {
    flex: 1,
  },
  headerSpacer: {
    width: 48,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});
