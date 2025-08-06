// src/screens/Room/RoomSetup/components/SelectionCard.tsx
import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";

type IconData = { component: any; name: string; color: string };

type SelectionCardProps = {
  label: string;
  iconData: IconData;
  isSelected: boolean;
  onPress: () => void;
};

const SelectionCard = ({ label, iconData, isSelected, onPress }: SelectionCardProps) => {
  const theme = useTheme();
  const IconComponent = iconData.component;
  const color = isSelected ? theme.colors.onPrimary : iconData.color;

  return (
    <View style={styles.cardContainer}>
      <Card
        style={{
          backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        }}
        onPress={onPress}
      >
        <View style={styles.innerContainer}>
          <IconComponent name={iconData.name} size={24} color={color} />
          <Text numberOfLines={2} style={[styles.labelText, { color: isSelected ? theme.colors.onPrimary : theme.colors.onSurface }]}>
            {label}
          </Text>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 150,
    marginRight: 15,
    marginBottom: 10,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    height: 60,
  },
  labelText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Bebas",
    flex: 1,
  },
});

export default SelectionCard;
