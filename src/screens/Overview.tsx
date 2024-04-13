import { View } from "react-native";
import { Text, useTheme, Card, Button } from "react-native-paper";
import { useAppSelector } from "../redux/store";

export default function Overview({ route, navigation }: any) {
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
          <View
            key={index}
            style={{
              padding: 5,
              borderRadius: 15,
              flexDirection: "row",
              justifyContent: "space-between",
              backgroundColor: theme.colors.surface,
              alignItems: "center",
              paddingHorizontal: 10,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "700" }}>
              {match?.title || match?.name}
            </Text>

            <Button
              mode="text"
              onPress={() =>
                navigation.navigate("MovieDetails", {
                  id: match.id,
                })
              }
            >
              Show details
            </Button>
          </View>
        );
      })}
    </View>
  );
}
