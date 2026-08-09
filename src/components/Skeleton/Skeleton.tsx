import * as React from "react";
import { useTheme } from "../../hooks/useTheme";
import { View, StyleSheet } from "react-native";

import { colors, spacing } from "../../constants/design";

interface SkeletonProps {
  children: React.ReactElement;
}

const Skeleton = ({ children }: SkeletonProps) => {
  const { width, height } = children.props.style;
  const theme = useTheme();

  return (
    <View 
      style={{ 
        width, 
        height, 
        backgroundColor: theme.colors.surface,
        borderRadius: children.props.style.borderRadius || 5,
      }} 
    />
  );
};

interface ItemProps {
  width: number;
  height: number;
  borderRadius?: number;
}

Skeleton.Item = ({ width, height, borderRadius = 5 }: ItemProps) => (
  <View
    style={[
      styles.item,
      {
        width,
        height,
        borderRadius,
      },
    ]}
  />
);

const styles = StyleSheet.create({
  item: {
    marginTop: spacing.sm + 2,
    backgroundColor: "#333",
  },
});

export default Skeleton;