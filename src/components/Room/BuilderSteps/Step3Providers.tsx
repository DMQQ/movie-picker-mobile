import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Switch, Button } from "react-native-paper";
import { useGetAllProvidersQuery } from "../../../redux/movie/movieApi";
import ProviderList from "../ProviderList";
import useTranslation from "../../../service/useTranslation";

interface Step3ProvidersProps {
  selectedProviders: number[];
  onUpdateProviders: (providers: number[]) => void;
  savedProviders: number[] | null;
  onToggleRememberProviders: (remember: boolean) => void;
  onClearSavedProviders: () => void;
  rememberProviders: boolean;
}

const Step3Providers: React.FC<Step3ProvidersProps> = ({
  selectedProviders,
  onUpdateProviders,
  savedProviders,
  onToggleRememberProviders,
  onClearSavedProviders,
  rememberProviders,
}) => {
  const { data: providers, isLoading } = useGetAllProvidersQuery({});
  const t = useTranslation();

  const hasSavedProviders = savedProviders && savedProviders.length > 0;

  return (
    <View style={styles.container}>
      {/* Remember Providers Toggle */}
      <View style={styles.rememberContainer}>
        <View style={styles.rememberContent}>
          <Text style={styles.rememberLabel}>{t("room.builder.step3.remember")}</Text>
          {hasSavedProviders && <Text style={styles.rememberSubtext}>{t("room.builder.step3.saved")}</Text>}
        </View>
        <Switch value={rememberProviders} onValueChange={onToggleRememberProviders} />
      </View>

      {/* Clear Saved Preferences Button */}
      {hasSavedProviders && (
        <Button mode="text" onPress={onClearSavedProviders} style={styles.clearButton} compact>
          {t("room.builder.step3.clear")}
        </Button>
      )}

      {/* Provider List */}
      <ProviderList
        providers={providers || []}
        selectedProviders={selectedProviders}
        onToggleProvider={onUpdateProviders}
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
