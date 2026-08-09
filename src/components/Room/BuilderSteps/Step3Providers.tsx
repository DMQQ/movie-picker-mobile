import { useEffect, useState, useRef, useMemo } from "react";
import Text from "../../Text";
import TouchableRipple from "../../TouchableRipple";
import { View, StyleSheet, TextInput } from "react-native";

import Button from "../../Button";
import { colors, fontWeight, fontSize, radius, spacing } from "../../../constants/design";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGetAllProvidersQuery } from "../../../redux/movie/movieApi";
import ProviderList from "../ProviderList";
import useTranslation from "../../../service/useTranslation";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { useBuilderPreferences } from "../../../hooks/useBuilderPreferences";
import { setProviders } from "../../../redux/roomBuilder/roomBuilderSlice";

const Step3Providers = () => {
  const dispatch = useAppDispatch();
  const { data: providers, isLoading } = useGetAllProvidersQuery({});
  const t = useTranslation();
  const [rememberProviders, setRememberProviders] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectedProviders = useAppSelector((state) => state.builder.providers);
  const {
    clearPreferences,
    preferences: savedProviders,
    savePreferences,
  } = useBuilderPreferences();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (
      !hasInitialized.current &&
      savedProviders?.providers &&
      savedProviders.providers.length > 0
    ) {
      dispatch(setProviders(savedProviders.providers));
      setRememberProviders(true);
      hasInitialized.current = true;
    } else if (!hasInitialized.current && savedProviders !== null) {
      hasInitialized.current = true;
    }
  }, [dispatch, savedProviders]);

  useEffect(() => {
    if (
      hasInitialized.current &&
      rememberProviders &&
      selectedProviders.length > 0
    ) {
      savePreferences({ providers: selectedProviders });
    }
  }, [rememberProviders, selectedProviders, savePreferences]);

  const hasSavedProviders =
    savedProviders && savedProviders.providers.length > 0;

  const filteredProviders = useMemo(() => {
    if (!providers) return [];
    if (!searchQuery.trim()) return providers;
    const q = searchQuery.toLowerCase();
    return providers.filter((p) => p.provider_name.toLowerCase().includes(q));
  }, [providers, searchQuery]);

  const onToggleRememberProviders = () => {
    const next = !rememberProviders;
    setRememberProviders(next);
    if (!next) {
      clearPreferences();
    } else if (selectedProviders.length > 0) {
      savePreferences({ providers: selectedProviders });
    }
  };

  const onClearSavedProviders = async () => {
    await clearPreferences();
    setRememberProviders(false);
  };

  const onToggleProvider = (providerId: number[]) => {
    dispatch(setProviders(providerId));
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="search-web"
          size={20}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={t("room.builder.step3.search")}
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableRipple
            onPress={() => setSearchQuery("")}
            style={styles.clearSearch}
            borderless
          >
            <MaterialCommunityIcons name="close" size={18} color="#888" />
          </TouchableRipple>
        )}
      </View>

      {/* Save preferences row */}
      <TouchableRipple
        onPress={onToggleRememberProviders}
        style={styles.rememberContainer}
        borderless={false}
      >
        <View style={styles.rememberInner}>
          <View
            style={[
              styles.rememberIconWrap,
              rememberProviders && styles.rememberIconWrapActive,
            ]}
          >
            <MaterialCommunityIcons
              name={rememberProviders ? "bookmark" : "bookmark-outline"}
              size={18}
              color={rememberProviders ? colors.text : "#888"}
            />
          </View>
          <View style={styles.rememberContent}>
            <Text style={styles.rememberLabel}>
              {t("room.builder.step3.remember")}
            </Text>
            {hasSavedProviders && (
              <Text style={styles.rememberSubtext}>
                {t("room.builder.step3.saved")}
              </Text>
            )}
          </View>
          <View style={[styles.pill, rememberProviders && styles.pillActive]}>
            <Text
              style={[
                styles.pillText,
                rememberProviders && styles.pillTextActive,
              ]}
            >
              {rememberProviders ? "ON" : "OFF"}
            </Text>
          </View>
        </View>
      </TouchableRipple>

      {hasSavedProviders && (
        <Button
          mode="text"
          onPress={onClearSavedProviders}
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
        selectedProviders={selectedProviders}
        onToggleProvider={onToggleProvider}
        isCategorySelected={true}
        vertical
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm + 2,
    height: 46,
    borderWidth: 1,
    borderColor: colors.overlay,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md + 1,
    height: "100%",
  },
  clearSearch: {
    padding: spacing.xs,
    borderRadius: radius.md,
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

export default Step3Providers;
