import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function Overview({ route }: any) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Text
        style={{
          fontSize: 25,
          color: theme.colors.primary,
          fontWeight: "bold",
          marginBottom: 25,
        }}
      >
        Matched movies
      </Text>
      {route?.params?.matches?.map((match: any, index: number) => {
        return (
          <View key={index} style={{ paddingVertical: 10 }}>
            <Text>{match?.title || match?.name}</Text>
          </View>
        );
      })}
    </View>
  );
}
