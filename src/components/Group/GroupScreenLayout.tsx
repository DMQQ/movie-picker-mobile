import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafeIOSContainer from "../SafeIOSContainer";
import PageHeading from "../PageHeading";
import TilesList from "../Overview/TilesList";
import GroupSkeleton from "./GroupSkeleton";
import { spacing } from "../../constants/design";

interface GroupScreenLayoutProps {
  title: string;
  data: any[];
  renderItemFooter?: (item: any) => ReactNode;
  onLongItemPress?: (item: any) => void;
  subheader?: ReactNode;
  useMovieType?: boolean;
  isLoading?: boolean;
  showHeading?: boolean;
  showRightIconButton?: boolean;
  rightIconName?: string;
  onRightIconPress?: () => void;
  children?: ReactNode;
}

export default function GroupScreenLayout({
  title,
  data,
  renderItemFooter,
  onLongItemPress,
  subheader,
  useMovieType,
  isLoading,
  showHeading = true,
  showRightIconButton,
  rightIconName,
  onRightIconPress,
  children,
}: GroupScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeIOSContainer style={styles.container}>
      {showHeading && (
        <PageHeading
          title={title}
          styles={Platform.OS === "android" ? { marginTop: insets.top } : undefined}
          showRightIconButton={showRightIconButton}
          rightIconName={rightIconName}
          onRightIconPress={onRightIconPress}
        />
      )}
      <View style={[styles.content, Platform.OS === "android" && styles.androidOffset]}>
        {isLoading ? (
          <GroupSkeleton />
        ) : (
          <TilesList
            contentContainerStyle={styles.listPadding}
            data={data}
            label=""
            useMovieType={useMovieType}
            subheader={subheader}
            renderItemFooter={renderItemFooter}
            onLongItemPress={onLongItemPress}
          />
        )}
      </View>
      {children}
    </SafeIOSContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  content: { flex: 1, paddingHorizontal: spacing.screen },
  androidOffset: { marginTop: spacing.xxl + 6 },
  listPadding: { paddingTop: spacing.xl * 4 },
});
