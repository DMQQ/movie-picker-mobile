import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TouchableRipple from "../TouchableRipple";
import SearchField from "../SearchField";
import Button from "../Button";
import Text from "../Text";
import ProviderList from "../Room/ProviderList";
import { useGetAllProvidersQuery } from "../../redux/movie/movieApi";
import useTranslation from "../../service/useTranslation";
import { colors, fontSize, fontWeight, radius, spacing } from "../../constants/design";
import { useBuilderPreferences } from "../../hooks/useBuilderPreferences";

interface Props {
  providers: number[];
  onChangeProviders: (providers: number[]) => void;
}

export default function ProviderSearchStep({ providers, onChangeProviders }: Props) {
  const t = useTranslation();
  const { data: allProviders, isLoading } = useGetAllProvidersQuery({});
  const [searchQuery, setSearchQuery] = useState("");
  const [rememberProviders, setRememberProviders] = useState(false);
  const { preferences: savedPrefs, savePreferences, clearPreferences } = useBuilderPreferences();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && savedPrefs !== null) {
      if (savedPrefs.providers.length > 0) {
        onChangeProviders(savedPrefs.providers);
        setRememberProviders(true);
      }
      hasInitialized.current = true;
    }
  }, [savedPrefs, onChangeProviders]);

  useEffect(() => {
    if (hasInitialized.current && rememberProviders && providers.length > 0) {
      savePreferences({ providers });
    }
  }, [rememberProviders, providers, savePreferences]);

  const hasSavedProviders = savedPrefs && savedPrefs.providers.length > 0;

  const onToggleRemember = () => {
    const next = !rememberProviders;
    setRememberProviders(next);
    if (!next) {
      clearPreferences();
    } else if (providers.length > 0) {
      savePreferences({ providers });
    }
  };

  const onClearSaved = async () => {
    await clearPreferences();
    setRememberProviders(false);
  };

  const filteredProviders = useMemo(() => {
    if (!allProviders) return [];
    if (!searchQuery.trim()) return allProviders;
    const q = searchQuery.toLowerCase();
    return allProviders.filter((p) => p.provider_name.toLowerCase().includes(q));
  }, [allProviders, searchQuery]);

  return (
    <View style={styles.container}>
      <SearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t("room.builder.step3.search") as string}
        returnKeyType="search"
        style={styles.searchContainer}
      />

      <TouchableRipple onPress={onToggleRemember} style={styles.rememberContainer} borderless={false}>
        <View style={styles.rememberInner}>
          <View style={[styles.rememberIconWrap, rememberProviders && styles.rememberIconWrapActive]}>
            <MaterialCommunityIcons
              name={rememberProviders ? "bookmark" : "bookmark-outline"}
              size={18}
              color={rememberProviders ? colors.text : "#888"}
            />
          </View>
          <View style={styles.rememberContent}>
            <Text style={styles.rememberLabel}>{t("room.builder.step3.remember")}</Text>
            {hasSavedProviders && <Text style={styles.rememberSubtext}>{t("room.builder.step3.saved")}</Text>}
          </View>
          <View style={[styles.pill, rememberProviders && styles.pillActive]}>
            <Text style={[styles.pillText, rememberProviders && styles.pillTextActive]}>
              {rememberProviders ? "ON" : "OFF"}
            </Text>
          </View>
        </View>
      </TouchableRipple>

      {hasSavedProviders && (
        <Button
          mode="text"
          onPress={onClearSaved}
          style={styles.clearButton}
          labelStyle={styles.clearButtonLabel}
          compact
          icon="delete-outline"
        >
          {t("room.builder.step3.clear")}
        </Button>
      )}

      <ProviderList
        providers={filteredProviders}
        selectedProviders={providers}
        onToggleProvider={onChangeProviders}
        isCategorySelected
        vertical
        isLoading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  searchContainer: {
    marginBottom: spacing.sm + 2,
  },
  rememberContainer: {
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  rememberInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.overlay,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  rememberIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  rememberIconWrapActive: {
    backgroundColor: colors.primary,
  },
  rememberContent: {
    flex: 1,
  },
  rememberLabel: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  rememberSubtext: {
    color: "#888",
    fontSize: fontSize.sm - 1,
    marginTop: spacing.xs - 2,
  },
  pill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.modal,
    backgroundColor: colors.overlay,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.primary + "33",
    borderColor: colors.primary,
  },
  pillText: {
    color: "#888",
    fontSize: fontSize.sm - 1,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  pillTextActive: {
    color: colors.primary,
  },
  clearButton: {
    alignSelf: "flex-start",
    marginBottom: spacing.md,
    marginLeft: -4,
  },
  clearButtonLabel: {
    color: "#888",
    fontSize: fontSize.sm,
  },
});
