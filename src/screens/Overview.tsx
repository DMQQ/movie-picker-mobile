import { FlatList, View } from "react-native";
import { Text, useTheme, Card, Button } from "react-native-paper";

export default function Overview({ route, navigation }: any) {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <FlatList
        data={route?.params?.matches}
        keyExtractor={(match) => match.id.toString()}
        renderItem={({ item: match }) => (
          <View
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
        )}
      />
    </View>
  );
}
