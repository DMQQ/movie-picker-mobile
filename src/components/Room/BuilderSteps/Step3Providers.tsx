import { useEffect, useState, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Switch, Button } from "react-native-paper";
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
  const selectedProviders = useAppSelector((state) => state.builder.providers);
  const { clearPreferences, preferences: savedProviders, savePreferences } = useBuilderPreferences();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && savedProviders?.providers && savedProviders.providers.length > 0) {
      dispatch(setProviders(savedProviders.providers));
      setRememberProviders(true);
      hasInitialized.current = true;
    } else if (!hasInitialized.current && savedProviders !== null) {
      hasInitialized.current = true;
    }
  }, [dispatch, savedProviders]);

  useEffect(() => {
    if (hasInitialized.current && rememberProviders && selectedProviders.length > 0) {
      savePreferences({ providers: selectedProviders });
    }
  }, [rememberProviders, selectedProviders, savePreferences]);

  const hasSavedProviders = savedProviders && savedProviders.providers.length > 0;

  const onToggleRememberProviders = (remember: boolean) => {
    setRememberProviders(remember);
    if (!remember) {
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
      <View style={styles.rememberContainer}>
        <View style={styles.rememberContent}>
          <Text style={styles.rememberLabel}>{t("room.builder.step3.remember")}</Text>
          {hasSavedProviders && <Text style={styles.rememberSubtext}>{t("room.builder.step3.saved")}</Text>}
        </View>
        <Switch value={rememberProviders} onValueChange={onToggleRememberProviders} />
      </View>

      {hasSavedProviders && (
        <Button mode="text" onPress={onClearSavedProviders} style={styles.clearButton} compact>
          {t("room.builder.step3.clear")}
        </Button>
      )}

      {/* Provider List */}
      <ProviderList
        providers={providers || []}
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
    paddingTop: 20,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  rememberContent: {
    flex: 1,
  },
  rememberLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  rememberSubtext: {
    color: "#999",
    fontSize: 12,
    marginTop: 4,
  },
  clearButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
});

export default Step3Providers;
