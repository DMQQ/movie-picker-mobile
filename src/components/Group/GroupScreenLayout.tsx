import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafeIOSContainer from "../SafeIOSContainer";
import PageHeading from "../PageHeading";
import TilesList from "../Overview/TilesList";
import GroupSkeleton from "./GroupSkeleton";
import { colors, spacing } from "../../constants/design";

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
  headingChildren?: ReactNode;
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
  headingChildren,
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
          rightIconName={rightIconName as any}
          onRightIconPress={onRightIconPress}
        >
          {headingChildren}
        </PageHeading>
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
        <LinearGradient
          colors={["rgba(10,10,15,0)", colors.appBackground]}
          style={styles.gradient}
          pointerEvents="none"
        />
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
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
});
