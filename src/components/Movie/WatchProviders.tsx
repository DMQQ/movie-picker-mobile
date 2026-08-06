import { memo, useCallback, useMemo } from "react";
import { Platform, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "react-native-paper";
import { colors, fontWeight, fontSize, radius, spacing, typography } from "../../constants/design";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useTranslation from "../../service/useTranslation";
import FrostedGlass from "../FrostedGlass";
import Thumbnail from "../Thumbnail";
import PlatformBlurView from "../PlatformBlurView";

interface WatchProvidersProps {
  providers: {
    flatrate?: Provider[];
    rent?: Provider[];
    buy?: Provider[];
    free?: Provider[];
    ads?: Provider[];
    link?: string;
  };
  hideLabel?: boolean;
  style?: StyleProp<ViewStyle>;
}

interface Provider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

interface ProviderWithTypes {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
  types: string[];
}

const WatchProviders = memo(({ providers, hideLabel = false, style }: WatchProvidersProps) => {
  const providersList = useMemo(() => {
    const providersMap = new Map<number, ProviderWithTypes>();

    Object.entries(providers).forEach(([type, providerList]) => {
      if (type === "link") return;

      if (Array.isArray(providerList))
        providerList?.forEach((provider) => {
          if (provider.logo_path) {
            const existing = providersMap.get(provider.provider_id);
            if (existing) {
              existing.types.push(type);
              if (provider.display_priority < existing.display_priority) {
                existing.display_priority = provider.display_priority;
              }
            } else {
              providersMap.set(provider.provider_id, {
                ...provider,
                types: [type],
              });
            }
          }
        });
    });

    return Array.from(providersMap.values()).sort((a, b) => a.display_priority - b.display_priority);
  }, [providers]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "flatrate":
        return { name: "television-play", color: "#2E7D32" };
      case "rent":
      case "buy":
        return { name: "cart", color: "#E65100" };
      case "free":
        return { name: "star", color: "#F57F17" };
      case "ads":
        return { name: "television", color: "#6A1B9A" };
      default:
        return { name: "play-circle-outline", color: "#424242" };
    }
  };

  const t = useTranslation();

  const icons = useCallback((provider: ProviderWithTypes) => {
    const uniqueIcons = provider.types.reduce((acc: Array<{ type: string; iconInfo: any }>, type) => {
      const iconInfo = getTypeIcon(type);
      const exists = acc.some((item) => item.iconInfo.name === iconInfo.name && item.iconInfo.color === iconInfo.color);
      if (!exists) {
        acc.push({ type, iconInfo });
      }
      return acc;
    }, []);

    return uniqueIcons.slice(0, 4).map((item, index) => (
      <View key={item.type} style={[styles.iconBadge, { backgroundColor: item.iconInfo.color }, index > 0 && styles.iconMargin]}>
        {/* @ts-ignore */}
        <MaterialCommunityIcons name={item.iconInfo.name as any} size={10} color="white" />
      </View>
    ));
  }, []);

  if (providersList.length === 0) return null;

  return (
    <View style={[styles.container, style]}>
      {!hideLabel && <Text style={styles.title}>Streaming</Text>}

      <PlatformBlurView style={styles.frostedGlass} container={styles.frostedGlassContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {providersList.map((provider) => (
            <View key={provider.provider_id} style={styles.providerContainer}>
              <View style={styles.thumbnailWrapper}>
                <Thumbnail container={styles.thumbnail} path={provider.logo_path} />

                <View style={styles.iconsContainer}>
                  {icons(provider)}
                  {provider.types.length > 4 && (
                    <View style={[styles.iconBadge, styles.overflowBadge, styles.iconMargin]}>
                      <Text style={styles.overflowText}>+{provider.types.length - 4}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </PlatformBlurView>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: "#2E7D32" }]}>
              {/* @ts-ignore */}
              <MaterialCommunityIcons name="television-play" size={10} color="white" />
            </View>
            <Text style={styles.legendText}>{t("global.provider_legend.subscription")}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: "#E65100" }]}>
              {/* @ts-ignore */}
              <MaterialCommunityIcons name="cart" size={10} color="white" />
            </View>
            <Text style={styles.legendText}>{t("global.provider_legend.rent_buy")}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: "#F57F17" }]}>
              {/* @ts-ignore */}
              <MaterialCommunityIcons name="star" size={10} color="white" />
            </View>
            <Text style={styles.legendText}>{t("global.provider_legend.free")}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: "#6A1B9A" }]}>
              {/* @ts-ignore */}
              <MaterialCommunityIcons name="television" size={10} color="white" />
            </View>
            <Text style={styles.legendText}>{t("global.provider_legend.ads")}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.attribution}>{t("global.justwatch")}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xxl + 6,
  },
  title: {
    fontSize: typography.bebasSize.section,
    fontFamily: "Bebas",
    lineHeight: 35,
  },
  frostedGlass: {
    marginTop: spacing.screen,
    padding: spacing.sm + 2,
    paddingHorizontal: spacing.screen,
    borderRadius: radius.md + 3,
    ...Platform.select({
      android: {
        backgroundColor: colors.surface + "cc",
        borderWidth: 2,
        borderColor: "#343434ff",
        borderRadius: radius.md + 3,
      },
    }),
  },
  frostedGlassContainer: {
    height: 95,
  },
  scrollContent: {
    paddingVertical: spacing.xs + 1,
  },
  providerContainer: {
    marginRight: spacing.screen,
    alignItems: "center",
  },
  thumbnailWrapper: {
    position: "relative",
    marginTop: spacing.xs + 1,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: radius.xs + 3.5,
  },
  iconsContainer: {
    position: "absolute",
    top: -8,
    right: -8,
    flexDirection: "row",
    alignItems: "center",
  },
  iconBadge: {
    borderRadius: radius.sm,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  iconMargin: {
    marginLeft: spacing.xs - 2,
  },
  overflowBadge: {
    backgroundColor: "#666",
  },
  overflowText: {
    color: "white",
    fontSize: fontSize.xs - 2,
    fontWeight: fontWeight.bold,
  },
  attribution: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    fontSize: fontSize.sm - 1,
    marginTop: spacing.xs - 2.5,
  },
  legendContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    marginHorizontal: spacing.xs - 2,
  },
  legendIcon: {
    borderRadius: radius.sm,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginRight: spacing.xs + 2,
  },
  legendText: {
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.8)",
    fontWeight: fontWeight.medium,
  },
});

export default WatchProviders;
