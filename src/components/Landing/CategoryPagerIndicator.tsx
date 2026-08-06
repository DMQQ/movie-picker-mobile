import {
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
  FlatList,
  Platform,
} from "react-native";
import { Text } from "react-native-paper";
import { colors, fontSize, radius, spacing } from "../../constants/design";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PlatformBlurView from "../PlatformBlurView";

interface CategoryPagerIndicatorProps {
  chipCategories: Array<{
    id: string;
    label: string;
    image?: string;
    icon?: string;
    logo_path?: string;
  }>;
  selectedChip: string;
  onChipPress: (chipId: string) => void;
}

function CategoryPagerIndicator({
  chipCategories,
  selectedChip,
  onChipPress,
}: CategoryPagerIndicatorProps) {
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const selectedIndex = chipCategories.findIndex(
      (category) => category.id === selectedChip,
    );
    if (selectedIndex !== -1 && flatListRef.current) {
      flatListRef.current?.scrollToIndex({
        index: selectedIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [selectedChip, chipCategories]);

  const renderCategory = useCallback(
    ({ item: category }: { item: any; index: number }) => (
      <PlatformBlurView
        interactive
        style={[
          { borderRadius: radius.md },
          Platform.OS === "android" && {
            backgroundColor: colors.surface,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onChipPress?.(category.id);
          }}
          style={[
            styles.chipButton,
            selectedChip === category.id && styles.selectedChip,
          ]}
        >
          {(category.logo_path && category.logo_path !== "") ||
          category.image ? (
            <Image
              resizeMode="contain"
              source={{
                uri: `https://image.tmdb.org/t/p/w92${category.logo_path || category.image}`,
              }}
              style={styles.chipImage}
            />
          ) : category.icon && category.icon !== "" ? (
            <Ionicons
              name={category.icon as any}
              size={32}
              color={
                selectedChip === category.id
                  ? colors.primary
                  : colors.onSurface
              }
            />
          ) : (
            <Text style={{ fontSize: fontSize.xs }}>{category.label}</Text>
          )}
        </TouchableOpacity>
      </PlatformBlurView>
    ),
    [onChipPress, selectedChip],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        ref={flatListRef}
        data={chipCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
        onScrollToIndexFailed={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 15,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  scrollContainer: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  chipButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    borderRadius: radius.md,
  },
  selectedChip: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  chipImage: {
    width: "100%",
    height: "100%",
    borderRadius: radius.sm + 1,
  },
});

export default CategoryPagerIndicator;
