import { StyleSheet, View, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Text } from "react-native-paper";
import { colors, fontWeight, fontSize, radius, spacing } from "../../constants/design";
import { memo, useState } from "react";
import PlatformBlurView from "../PlatformBlurView";
import DetailsTab from "./tabs/DetailsTab";
import CastTab from "./tabs/CastTab";
import SimilarTab from "./tabs/SimilarTab";
import TrailersTab from "./tabs/TrailersTab";
import SeasonsTab from "./tabs/SeasonsTab";
import { Movie } from "../../../types";

interface MovieTabsProps {
  movie: Movie & Record<string, string>;
  type: string;
  providers: any[];
  tabs: { key: string; title: string }[];
  isTVShow: boolean;
  hasSimilar: boolean;
  hasTrailers: boolean;
  similarData?: { results: Movie[]; page: number; total_pages: number };
  trailersData?: any[];
  castData?: any;
}

function MovieTabs({ movie, type, providers, tabs, similarData, trailersData, castData }: MovieTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const renderContent = () => {
    const tabKey = tabs[activeTab]?.key;
    switch (tabKey) {
      case "details":
        return <DetailsTab movie={movie} providers={providers} />;
      case "cast":
        return <CastTab id={movie?.id} type={type as "movie" | "tv"} initialData={castData} />;
      case "similar":
        return <SimilarTab id={movie?.id} type={type as "movie" | "tv"} initialData={similarData} />;
      case "trailers":
        return <TrailersTab initialData={trailersData} />;
      case "seasons":
        return <SeasonsTab id={movie?.id} seasons={(movie?.seasons as any) || []} />;
      default:
        return null;
    }
  };

  return (
    <View>
      <PlatformBlurView style={styles.tabBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarScrollContainer}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === index && styles.activeTabButton]}
              onPress={() => setActiveTab(index)}
            >
              <Text style={[styles.tabLabel, activeTab === index && styles.activeTabLabel]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </PlatformBlurView>

      {renderContent()}
    </View>
  );
}

export default memo(MovieTabs);

const styles = StyleSheet.create({
  tabBarContainer: {
    borderRadius: radius.modal,
    marginBottom: spacing.sm + 2,
    marginHorizontal: spacing.screen,
    ...Platform.select({
      android: {
        backgroundColor: colors.surface + "cc",
        borderRadius: radius.modal,
        borderWidth: 2,
        borderColor: "#343434ff",
      },
    }),
  },
  tabBarScrollContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  tabButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md + 3,
  },
  activeTabButton: {
    backgroundColor: colors.primary + "aa",
  },
  tabLabel: {
    fontSize: fontSize.md + 1,
    fontWeight: fontWeight.semibold,
    color: "rgba(255,255,255,0.7)",
    textTransform: "capitalize",
  },
  activeTabLabel: {
    color: "#fff",
  },
});
