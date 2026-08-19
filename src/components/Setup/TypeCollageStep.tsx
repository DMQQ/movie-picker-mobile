import { useCallback, useState } from "react";
import { Dimensions, LayoutChangeEvent, StyleSheet, View } from "react-native";
import TypeCollageCard from "./TypeCollageCard";
import SkeletonCard from "../Room/SkeletonCard";
import { spacing } from "../../constants/design";

export interface TypeCollageOption {
  value: string;
  label: string;
  posters: string[];
}

interface Props {
  options: TypeCollageOption[];
  selected: string;
  onSelect: (value: string) => void;
  isLoading?: boolean;
}

const GAP = spacing.md;
const CARD_WIDTH = Dimensions.get("window").width - spacing.lg * 2;

export default function TypeCollageStep({ options, selected, onSelect, isLoading }: Props) {
  const [containerHeight, setContainerHeight] = useState(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setContainerHeight(h);
  }, []);

  const cardHeight = containerHeight > 0 ? (containerHeight - GAP * (options.length - 1)) / options.length : 0;

  return (
    <View style={styles.container} onLayout={onLayout}>
      {containerHeight > 0 &&
        (isLoading
          ? options.map((option) => <SkeletonCard key={option.value} width={CARD_WIDTH} height={cardHeight} borderRadius={16} />)
          : options.map((option) => (
              <TypeCollageCard
                key={option.value}
                posters={option.posters}
                label={option.label}
                isSelected={selected === option.value}
                onPress={() => onSelect(option.value)}
                height={cardHeight}
              />
            )))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: GAP,
    paddingTop: spacing.xl + spacing.lg,
  },
});
