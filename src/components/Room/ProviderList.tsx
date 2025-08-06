// src/screens/Room/RoomSetup/components/ProviderList.tsx

import { Image, ScrollView, StyleSheet, View } from "react-native";
import { MD2DarkTheme, TouchableRipple } from "react-native-paper";

type Provider = { provider_id: number; logo_path: string };

type ProviderListProps = {
  providers: Provider[];
  selectedProviders: number[];
  onToggleProvider: (providerId: number) => void; // This should handle adding/removing from the array
  isCategorySelected: boolean;
};

// A small, self-contained component for the provider icon
const ProviderIcon = ({ item, isSelected, onToggleProvider }: any) => (
  <View style={styles.providerContainer}>
    <TouchableRipple
      onPress={() => onToggleProvider(item.provider_id)}
      style={[styles.providerWrapper, isSelected && styles.selectedProvider]}
    >
      <Image source={{ uri: `https://image.tmdb.org/t/p/w300${item.logo_path}` }} style={styles.providerLogo} />
    </TouchableRipple>
  </View>
);

const ProviderList = ({
  providers = [],
  selectedProviders = [], // <<< FIX: Default to an empty array
  onToggleProvider,
  isCategorySelected,
}: ProviderListProps) => {
  // Group providers into columns of 2 for the two-row layout
  const providerColumns = [];
  for (let i = 0; i < providers.length; i += 2) {
    providerColumns.push(providers.slice(i, i + 2));
  }

  // The onToggleProvider function received from props should now handle the logic
  // of adding or removing an ID from the state array in your context.
  const handleToggle = (providerId: number) => {
    const newProviders = selectedProviders.includes(providerId)
      ? selectedProviders.filter((id) => id !== providerId)
      : [...selectedProviders, providerId];
    onToggleProvider(newProviders);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={isCategorySelected}>
        {providerColumns.map((column, index) => (
          <View key={`column-${index}`}>
            {column.map((item) => (
              <ProviderIcon
                key={item.provider_id}
                item={item}
                isSelected={selectedProviders.includes(item.provider_id)}
                onToggleProvider={handleToggle} // Use the new handler
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 128, // 2 rows of 54px + 10px margin-bottom
  },
  providerContainer: {
    marginRight: 15,
    marginBottom: 10,
  },
  providerWrapper: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#1a1a1a",
    width: 54,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedProvider: {
    borderColor: MD2DarkTheme.colors.primary,
  },
  providerLogo: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
});

export default ProviderList;
