import { Platform, StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../../constants/design";
import { memo, useState } from "react";
import PlatformBlurView from "../PlatformBlurView";
import SegmentedControl from "../SegmentedControl";
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
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "");

  const renderContent = () => {
    switch (activeTab) {
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
      <PlatformBlurView style={styles.glassWrapper}>
        <SegmentedControl
          options={tabs.map((t) => ({ value: t.key, label: t.title }))}
          value={activeTab}
          onChange={setActiveTab}
          style={styles.segmented}
        />
      </PlatformBlurView>

      {renderContent()}
    </View>
  );
}

export default memo(MovieTabs);

const styles = StyleSheet.create({
  glassWrapper: {
    borderRadius: radius.modal,
    marginBottom: spacing.sm + 2,
    marginHorizontal: spacing.screen,
    padding: spacing.xs,
    ...Platform.select({
      android: {
        backgroundColor: colors.surface + "cc",
        borderWidth: 2,
        borderColor: "#343434ff",
      },
    }),
  },
  segmented: {
    backgroundColor: "transparent",
  },
});
