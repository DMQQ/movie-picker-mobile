import React, { memo, useCallback, useMemo } from "react";
import { FlatList, Image, ListRenderItem, StyleSheet, View } from "react-native";
import { MD2DarkTheme, TouchableRipple, Text } from "react-native-paper";
import SkeletonCard from "./SkeletonCard";
import { MaterialIcons } from "@expo/vector-icons";

type Provider = { provider_id: number; logo_path: string; provider_name: string };

type ProviderListProps = {
  providers: Provider[];
  selectedProviders: number[];
  onToggleProvider: (providers: number[]) => void;
  isCategorySelected: boolean;
  vertical?: boolean;
  isLoading?: boolean;
};

interface ProviderIconProps {
  item: Provider;
  isSelected: boolean;
  onToggle: (providerId: number) => void;
  vertical: boolean;
}

const ProviderIcon = memo(({ item, isSelected, onToggle, vertical }: ProviderIconProps) => {
  const handlePress = useCallback(() => {
    onToggle(item.provider_id);
  }, [onToggle, item.provider_id]);

  return (
    <View style={vertical ? styles.providerContainerVertical : styles.providerContainer}>
      <TouchableRipple
        onPress={handlePress}
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
          {isSelected && (
            <View
              style={[
                styles.checkmark,
                { backgroundColor: MD2DarkTheme.colors.primary },
                vertical ? styles.checkmarkVertical : styles.checkmarkHorizontal,
              ]}
            >
              <MaterialIcons name="check" size={vertical ? 20 : 15} color="#fff" />
            </View>
          )}
        </>
      </TouchableRipple>
    </View>
  );
});

const ProviderRowSkeleton = memo(() => (
  <View style={styles.providerRow}>
    {[1, 2, 3].map((item) => (
      <SkeletonCard key={item} width={100} height={120} borderRadius={12} style={styles.skeletonMargin} />
    ))}
  </View>
));

const ProviderColumnSkeleton = memo(() => (
  <View>
    <SkeletonCard width={60} height={54} borderRadius={8} style={styles.skeletonBottomMargin} />
    <SkeletonCard width={60} height={54} borderRadius={8} />
  </View>
));

const ProviderList = memo(
  ({ providers = [], selectedProviders = [], onToggleProvider, isCategorySelected, vertical = false, isLoading = false }: ProviderListProps) => {
    const handleToggle = useCallback(
      (providerId: number) => {
        const newProviders = selectedProviders.includes(providerId)
          ? selectedProviders.filter((id) => id !== providerId)
          : [...selectedProviders, providerId];
        onToggleProvider(newProviders);
      },
      [selectedProviders, onToggleProvider]
    );

    const selectedSet = useMemo(() => new Set(selectedProviders), [selectedProviders]);

    const providerRows = useMemo(() => {
      const rows: Provider[][] = [];
      for (let i = 0; i < providers.length; i += 3) {
        rows.push(providers.slice(i, i + 3));
      }
      return rows;
    }, [providers]);

    const providerColumns = useMemo(() => {
      const cols: Provider[][] = [];
      for (let i = 0; i < providers.length; i += 2) {
        cols.push(providers.slice(i, i + 2));
      }
      return cols;
    }, [providers]);

    const renderVerticalRow: ListRenderItem<Provider[]> = useCallback(
      ({ item: row }) => (
        <View style={styles.providerRow}>
          {row.map((provider) => (
            <ProviderIcon
              key={provider.provider_id}
              item={provider}
              isSelected={selectedSet.has(provider.provider_id)}
              onToggle={handleToggle}
              vertical
            />
          ))}
        </View>
      ),
      [selectedSet, handleToggle]
    );

    const renderHorizontalColumn: ListRenderItem<Provider[]> = useCallback(
      ({ item: column }) => (
        <View>
          {column.map((provider) => (
            <ProviderIcon
              key={provider.provider_id}
              item={provider}
              isSelected={selectedSet.has(provider.provider_id)}
              onToggle={handleToggle}
              vertical={false}
            />
          ))}
        </View>
      ),
      [selectedSet, handleToggle]
    );

    const keyExtractor = useCallback((_: Provider[], index: number) => `group-${index}`, []);

    if (vertical) {
      if (isLoading) {
        return (
          <View style={styles.containerVertical}>
            {[1, 2, 3, 4, 5].map((rowIndex) => (
              <ProviderRowSkeleton key={rowIndex} />
            ))}
          </View>
        );
      }

      return (
        <FlatList
          data={providerRows}
          renderItem={renderVerticalRow}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          style={styles.containerVertical}
          removeClippedSubviews
        />
      );
    }

    if (isLoading) {
      return (
        <View style={styles.container}>
          <View style={styles.skeletonRow}>
            {[1, 2, 3, 4, 5].map((colIndex) => (
              <ProviderColumnSkeleton key={colIndex} />
            ))}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <FlatList
          data={providerColumns}
          renderItem={renderHorizontalColumn}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={isCategorySelected}
          removeClippedSubviews
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    height: 128,
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
  checkmark: {
    position: "absolute",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkVertical: {
    top: 6,
    right: 6,
    width: 20,
    height: 20,
  },
  checkmarkHorizontal: {
    top: 2,
    right: 2,
    width: 18,
    height: 18,
  },
  skeletonMargin: {
    marginRight: 8,
  },
  skeletonBottomMargin: {
    marginBottom: 10,
  },
  skeletonRow: {
    flexDirection: "row",
  },
});

export default ProviderList;
