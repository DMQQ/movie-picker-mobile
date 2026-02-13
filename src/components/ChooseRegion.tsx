import { AsyncStorage } from "expo-sqlite/kv-store";
import { useFocusEffect } from "@react-navigation/native";
import { reloadAsync } from "expo-updates";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { List, Searchbar, Text } from "react-native-paper";
import useTranslation from "../service/useTranslation";

const regions = [
  // North America
  { code: "US", name: "United States", language: "en-US", timezone: "America/New_York" },
  { code: "CA", name: "Canada", language: "en-CA", timezone: "America/Toronto" },
  { code: "MX", name: "Mexico", language: "es-MX", timezone: "America/Mexico_City" },

  // Europe
  { code: "GB", name: "United Kingdom", language: "en-GB", timezone: "Europe/London" },
  { code: "DE", name: "Germany", language: "de-DE", timezone: "Europe/Berlin" },
  { code: "FR", name: "France", language: "fr-FR", timezone: "Europe/Paris" },
  { code: "ES", name: "Spain", language: "es-ES", timezone: "Europe/Madrid" },
  { code: "IT", name: "Italy", language: "it-IT", timezone: "Europe/Rome" },
  { code: "NL", name: "Netherlands", language: "nl-NL", timezone: "Europe/Amsterdam" },
  { code: "PL", name: "Poland", language: "pl-PL", timezone: "Europe/Warsaw" },
  { code: "SE", name: "Sweden", language: "sv-SE", timezone: "Europe/Stockholm" },
  { code: "NO", name: "Norway", language: "no-NO", timezone: "Europe/Oslo" },
  { code: "DK", name: "Denmark", language: "da-DK", timezone: "Europe/Copenhagen" },
  { code: "FI", name: "Finland", language: "fi-FI", timezone: "Europe/Helsinki" },
  { code: "PT", name: "Portugal", language: "pt-PT", timezone: "Europe/Lisbon" },
  { code: "IE", name: "Ireland", language: "en-IE", timezone: "Europe/Dublin" },
  { code: "CH", name: "Switzerland", language: "de-CH", timezone: "Europe/Zurich" },
  { code: "AT", name: "Austria", language: "de-AT", timezone: "Europe/Vienna" },
  { code: "BE", name: "Belgium", language: "nl-BE", timezone: "Europe/Brussels" },
  { code: "GR", name: "Greece", language: "el-GR", timezone: "Europe/Athens" },

  // Asia Pacific
  { code: "AU", name: "Australia", language: "en-AU", timezone: "Australia/Sydney" },
  { code: "NZ", name: "New Zealand", language: "en-NZ", timezone: "Pacific/Auckland" },
  { code: "JP", name: "Japan", language: "ja-JP", timezone: "Asia/Tokyo" },
  { code: "KR", name: "South Korea", language: "ko-KR", timezone: "Asia/Seoul" },
  { code: "CN", name: "China", language: "zh-CN", timezone: "Asia/Shanghai" },
  { code: "HK", name: "Hong Kong", language: "zh-HK", timezone: "Asia/Hong_Kong" },
  { code: "SG", name: "Singapore", language: "en-SG", timezone: "Asia/Singapore" },
  { code: "TW", name: "Taiwan", language: "zh-TW", timezone: "Asia/Taipei" },
  { code: "IN", name: "India", language: "hi-IN", timezone: "Asia/Kolkata" },
  { code: "TH", name: "Thailand", language: "th-TH", timezone: "Asia/Bangkok" },
  { code: "MY", name: "Malaysia", language: "ms-MY", timezone: "Asia/Kuala_Lumpur" },
  { code: "PH", name: "Philippines", language: "fil-PH", timezone: "Asia/Manila" },

  // Latin America
  { code: "BR", name: "Brazil", language: "pt-BR", timezone: "America/Sao_Paulo" },
  { code: "AR", name: "Argentina", language: "es-AR", timezone: "America/Argentina/Buenos_Aires" },
  { code: "CO", name: "Colombia", language: "es-CO", timezone: "America/Bogota" },
  { code: "CL", name: "Chile", language: "es-CL", timezone: "America/Santiago" },
  { code: "PE", name: "Peru", language: "es-PE", timezone: "America/Lima" },

  // Middle East & Africa
  { code: "AE", name: "United Arab Emirates", language: "ar-AE", timezone: "Asia/Dubai" },
  { code: "SA", name: "Saudi Arabia", language: "ar-SA", timezone: "Asia/Riyadh" },
  { code: "EG", name: "Egypt", language: "ar-EG", timezone: "Africa/Cairo" },
  { code: "ZA", name: "South Africa", language: "en-ZA", timezone: "Africa/Johannesburg" },
  { code: "IL", name: "Israel", language: "he-IL", timezone: "Asia/Jerusalem" },
  { code: "TR", name: "Turkey", language: "tr-TR", timezone: "Europe/Istanbul" },

  // Russia & CIS
  { code: "RU", name: "Russia", language: "ru-RU", timezone: "Europe/Moscow" },
  { code: "UA", name: "Ukraine", language: "uk-UA", timezone: "Europe/Kiev" },
];

interface ChooseRegionProps {
  onBack?: () => void;
  onRegionSelect?: (region: (typeof regions)[number]) => void;
  showAsSelector?: boolean;
}

const ChooseRegion = ({ onBack, onRegionSelect, showAsSelector = false }: ChooseRegionProps) => {
  const t = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);

  const loadSelectedRegion = useCallback(async () => {
    const regionalization = await AsyncStorage.getItem("regionalization");

    if (regionalization) {
      const headers = JSON.parse(regionalization) as Record<string, string>;
      const region = regions.find((region) => region.code === headers["x-user-region"]);

      if (region) {
        setSelectedRegion(region);
      }
    }
  }, []);

  useEffect(() => {
    loadSelectedRegion();
  }, [loadSelectedRegion]);

  useFocusEffect(
    useCallback(() => {
      loadSelectedRegion();
    }, [loadSelectedRegion])
  );

  const onSettingsChange = async (settings: any) => {
    try {
      await AsyncStorage.setItem("regionalization", JSON.stringify(settings));

      await reloadAsync();
    } catch (error) {
      console.error("Failed to save settings", error);
    }
  };

  const handleRegionSelect = (region: (typeof regions)[number]) => {
    setSelectedRegion(region);

    if (onRegionSelect) {
      onRegionSelect(region);
      return;
    }

    const headers = {} as Record<string, string>;
    headers["x-user-region"] = region.code;
    headers["x-user-watch-provider"] = region.code;
    headers["x-user-watch-region"] = region.code;
    headers["x-user-timezone"] = region.timezone;

    onSettingsChange(headers);
  };

  const filteredRegions = regions.filter(
    (region) =>
      region.name.toLowerCase().includes(searchQuery.toLowerCase()) || region.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showAsSelector) {
    return (
      <View style={styles.selectorContainer}>
        <View style={styles.selectorContent}>
          <Searchbar placeholder={t("settings.search-regions")} onChangeText={setSearchQuery} value={searchQuery} style={styles.searchbar} />

          <ScrollView style={styles.regionList}>
            {filteredRegions.map((region) => (
              <List.Item
                key={region.code}
                title={region.name}
                description={`${region.language} • ${region.timezone}`}
                onPress={() => handleRegionSelect(region)}
                left={(props) => <List.Icon {...props} icon="map-marker" />}
                right={(props) => selectedRegion.code === region.code && <List.Icon {...props} icon="check" />}
                style={styles.regionItem}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("settings.region-language-settings")}</Text>

      <List.Item
        title={t("settings.selected-region")}
        description={`${selectedRegion.name} (${selectedRegion.code})`}
        left={(props) => <List.Icon {...props} icon="map-marker" />}
        onPress={() => onBack && onBack()}
        style={styles.listItem}
        right={(props) => <List.Icon {...props} icon="pencil" />}
      />

      <List.Item
        title={t("settings.timezone")}
        description={selectedRegion.timezone}
        left={(props) => <List.Icon {...props} icon="clock-outline" />}
        style={styles.listItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    borderRadius: 8,
  },
  title: {
    marginBottom: 15,
    color: "white",
    fontFamily: "Bebas",
    fontSize: 25,
  },
  listItem: {
    paddingVertical: 8,
  },
  selectorContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    backgroundColor: "transparent",
    elevation: 0,
  },
  headerTitle: {
    color: "white",
    fontFamily: "Bebas",
    fontSize: 20,
  },
  selectorContent: {
    flex: 1,
    padding: 15,
  },
  searchbar: {
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  regionList: {
    flex: 1,
  },
  regionItem: {
    paddingVertical: 8,
  },
});

export default ChooseRegion;
