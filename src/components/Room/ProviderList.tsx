// src/screens/Room/RoomSetup/components/ProviderList.tsx

import { Image, ScrollView, StyleSheet, View } from "react-native";
import { MD2DarkTheme, TouchableRipple, Text } from "react-native-paper";
import SkeletonCard from "./SkeletonCard";
import { useMemo } from "react";

type Provider = { provider_id: number; logo_path: string; provider_name: string };

type ProviderListProps = {
  providers: Provider[];
  selectedProviders: number[];
  onToggleProvider: (providers: number[]) => void;
  isCategorySelected: boolean;
  vertical?: boolean;
  isLoading?: boolean;
};

// A small, self-contained component for the provider icon
const ProviderIcon = ({ item, isSelected, onToggleProvider, vertical }: any) => (
  <View style={vertical ? styles.providerContainerVertical : styles.providerContainer}>
    <TouchableRipple
      onPress={() => onToggleProvider(item.provider_id)}
      style={[vertical ? styles.providerWrapperVertical : styles.providerWrapper, isSelected && styles.selectedProvider]}
    >
      <>
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w300${item.logo_path}` }}
          style={vertical ? styles.providerLogoVertical : styles.providerLogo}
        />
        {vertical && item.provider_name && (
          <Text style={styles.providerName} numberOfLines={1}>
            {item.provider_name}
          </Text>
        )}
      </>
    </TouchableRipple>
  </View>
);

const ProviderList = ({
  providers = [],
  selectedProviders = [], // <<< FIX: Default to an empty array
  onToggleProvider,
  isCategorySelected,
  vertical = false,
  isLoading = false,
}: ProviderListProps) => {
  const handleToggle = (providerId: number) => {
    const newProviders = selectedProviders.includes(providerId)
      ? selectedProviders.filter((id) => id !== providerId)
      : [...selectedProviders, providerId];
    onToggleProvider(newProviders);
  };

  if (vertical) {
    const providerRows = [];
    for (let i = 0; i < providers.length; i += 3) {
      providerRows.push(providers.slice(i, i + 3));
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false} style={styles.containerVertical}>
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((rowIndex) => (
              <View key={`skeleton-row-${rowIndex}`} style={styles.providerRow}>
                {[1, 2, 3].map((item) => (
                  <SkeletonCard key={item} width={100} height={120} borderRadius={12} style={{ marginRight: 8 }} />
                ))}
              </View>
            ))}
          </>
        ) : (
          providerRows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.providerRow}>
              {row.map((item) => (
                <ProviderIcon
                  key={item.provider_id}
                  item={item}
                  isSelected={selectedProviders.includes(item.provider_id)}
                  onToggleProvider={handleToggle}
                  vertical
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    );
  }

  const providerColumns = useMemo(() => {
    const cols = [];
    for (let i = 0; i < providers.length; i += 2) {
      cols.push(providers.slice(i, i + 2));
    }
    return cols;
  }, [providers]);
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={isCategorySelected}>
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((colIndex) => (
              <View key={`skeleton-col-${colIndex}`}>
                <SkeletonCard width={60} height={54} borderRadius={8} style={{ marginBottom: 10 }} />
                <SkeletonCard width={60} height={54} borderRadius={8} />
              </View>
            ))}
          </>
        ) : (
          providerColumns.map((column, index) => (
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
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 128, // 2 rows of 54px + 10px margin-bottom
  },
  containerVertical: {
    flex: 1,
  },
  providerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  providerContainer: {
    marginRight: 15,
    marginBottom: 10,
  },
  providerContainerVertical: {
    flex: 1,
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
  providerWrapperVertical: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#1a1a1a",
    width: "100%",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 6,
  },
  selectedProvider: {
    borderColor: MD2DarkTheme.colors.primary,
  },
  providerLogo: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  providerLogoVertical: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  providerName: {
    color: "#fff",
    fontSize: 11,
    textAlign: "center",
    maxWidth: "100%",
  },
});

export default ProviderList;
