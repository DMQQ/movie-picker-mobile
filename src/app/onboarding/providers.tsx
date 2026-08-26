import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";
import Text from "../../components/Text";
import Touch from "../../components/Touch";
import PrimaryButton from "../../components/PrimaryButton";
import SearchField from "../../components/SearchField";
import ProviderList from "../../components/Room/ProviderList";
import useTranslation from "../../service/useTranslation";
import { useBuilderPreferences } from "../../hooks/useBuilderPreferences";
import { useGetAllProvidersQuery } from "../../redux/movie/movieApi";
import { colors, spacing, radius, fontSize, fontWeight, withAlpha } from "../../constants/design";
import { posthog } from "../../constants/posthog";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ProvidersScreen() {
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const { quickStart } = useLocalSearchParams<{ quickStart?: string }>();

  const { data: providers, isLoading } = useGetAllProvidersQuery({});
  const { savePreferences } = useBuilderPreferences();

  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProviders = useMemo(() => {
    if (!providers) return [];
    if (!searchQuery.trim()) return providers;
    const q = searchQuery.toLowerCase();
    return providers.filter((p) => p.provider_name.toLowerCase().includes(q));
  }, [providers, searchQuery]);

  const handleToggle = useCallback((providerIds: number[]) => {
    setSelectedProviders(providerIds);
  }, []);

  const handleContinue = useCallback(async () => {
    if (selectedProviders.length > 0) {
      await savePreferences({ providers: selectedProviders });
    }
    posthog?.capture("onboarding_providers_done", {
      provider_count: selectedProviders.length,
    });
    finish();
  }, [selectedProviders, savePreferences]);

  const finish = useCallback(() => {
    router.replace("/(tabs)" as any);
    if (quickStart === "true") {
      router.push({ pathname: "/room/qr-code", params: { quickStart: "true" } } as any);
    }
  }, [quickStart]);

  const handleSkip = useCallback(() => {
    posthog?.capture("onboarding_providers_skipped");
    finish();
  }, [finish]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.lg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Touch onPress={handleBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={withAlpha(colors.text, 0.7)} />
        </Touch>
        <View style={styles.stepDots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>
        <Touch onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>{t("onboarding.providers.skip")}</Text>
        </Touch>
      </View>

      {/* Title */}
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{t("onboarding.providers.title")}</Text>
        <Text style={styles.subtitle}>{t("onboarding.providers.subtitle")}</Text>
      </View>

      <SearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t("onboarding.providers.searchPlaceholder")}
        returnKeyType="search"
        style={styles.search}
      />

      <ProviderList
        providers={filteredProviders}
        selectedProviders={selectedProviders}
        onToggleProvider={handleToggle}
        isCategorySelected
        vertical
        isLoading={isLoading}
      />

      <View style={styles.footer}>
        {selectedProviders.length > 0 && (
          <Text style={styles.selectedCount}>
            {selectedProviders.length} {t("onboarding.features.providers.selected")}
          </Text>
        )}
        <PrimaryButton onPress={handleContinue} style={styles.continueBtn}>
          {t("onboarding.providers.continue")}
        </PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  backBtn: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  stepDots: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: withAlpha(colors.text, 0.2),
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 20,
  },
  skipBtn: {
    paddingVertical: spacing.xs,
    paddingRight: 0,
  },
  skipText: {
    fontSize: fontSize.md,
    color: withAlpha(colors.text, 0.4),
  },
  titleBlock: {
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  title: {
    fontFamily: "Bebas",
    fontSize: 36,
    color: colors.text,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: withAlpha(colors.text, 0.5),
    lineHeight: 20,
  },
  search: {
    marginBottom: spacing.md,
  },
  footer: {
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  selectedCount: {
    textAlign: "center",
    fontSize: fontSize.sm,
    color: withAlpha(colors.text, 0.4),
  },
  continueBtn: {
    borderRadius: radius.pill,
  },
});
