import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "./Text";
import Touch from "./Touch";
import useTranslation from "../service/useTranslation";
import { colors, fontSize, fontWeight, radius, spacing, withAlpha } from "../constants/design";
import NewBadge from "./NewBadge";

interface CustomMoviesBannerProps {
  selected: boolean;
  moviesCount?: number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function CustomMoviesBanner({ selected, moviesCount = 0, onPress, style }: CustomMoviesBannerProps) {
  const t = useTranslation();
  const hasCustom = selected && moviesCount > 0;

  return (
    <NewBadge featureKey="custom-movies">
      <Touch scaleTo={0.97} onPress={onPress} style={[styles.banner, selected && styles.bannerSelected, style]}>
        <View style={[styles.icon, selected && styles.iconSelected]}>
          <MaterialCommunityIcons name="movie-filter" size={20} color={selected ? colors.primary : colors.placeholder} />
        </View>
        <View style={styles.text}>
          <Text style={[styles.title, selected && styles.titleSelected]}>{t("customMoviesBanner.title")}</Text>
          <Text style={styles.subtitle}>
            {hasCustom ? t("customMoviesBanner.selected", { count: moviesCount }) : t("customMoviesBanner.empty")}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={selected ? colors.primary : colors.placeholder} />
      </Touch>
   </NewBadge>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  bannerSelected: {
    backgroundColor: withAlpha(colors.primary, 0.1),
    borderColor: withAlpha(colors.primary, 0.35),
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.input,
    alignItems: "center",
    justifyContent: "center",
  },
  iconSelected: {
    backgroundColor: withAlpha(colors.primary, 0.15),
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    fontFamily:'Bebas'
  },
  titleSelected: {
    color: colors.primary,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
  },
});
