import { View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { useCreateRoom } from "./ContextProvider";
import { useEffect, useState } from "react";
import { url } from "../../service/SocketContext";

function generateArrayWithMaxIncrement(max: number, length = 7) {
  if (max === 0) return Array.from({ length }, (_, i) => i + 1);

  let greatest = max;

  const arr = [];

  while (arr.length < length) {
    arr.push(Math.floor(greatest));
    greatest /= 2;

    if (greatest < 1) break;
  }

  return arr.sort((a, b) => a - b);
}

export default function ChoosePageRange({ navigation }: any) {
  const { pageRange, setPageRange, category, genre } = useCreateRoom();

  const [maxCount, setMaxCount] = useState(0);

  useEffect(() => {
    fetch(
      `${url}/movie/max-count?type=${category}&genres=${genre
        .map((g: any) => g.id)
        .join(",")}`
    )
      .then((res) => res.json())
      .then((data) => {
        setMaxCount(data.maxCount);
      });
  }, [category, genre]);

  const nums = generateArrayWithMaxIncrement(maxCount, 7);

  const theme = useTheme();

  return (
    <View style={{ padding: 15, flex: 1 }}>
      <View style={{ flex: 1 }}>
        <TextInput
          keyboardType="numeric"
          mode="outlined"
          label={"Page Range"}
          value={pageRange.toString()}
          onChangeText={(text) => {
            setPageRange(text.replace(/[^0-9]/g, "").replace(/^0+/, ""));
          }}
          style={{ marginTop: 10 }}
        />
        <Button
          onPress={() => {
            navigation.navigate("CreateQRCode");
          }}
        >
          Next
        </Button>

        <Text style={{ marginTop: 10, marginHorizontal: 5, marginBottom: 25 }}>
          Max page
        </Text>

        {nums.map((n, index) => (
          <Button
            mode="contained"
            style={{ marginBottom: 10, borderRadius: 10 }}
            contentStyle={{ padding: 5 }}
            key={index}
            buttonColor={theme.colors.surface}
            onPress={() => {
              setPageRange(n.toString());
              navigation.navigate("CreateQRCode");
            }}
          >
            {n}
          </Button>
        ))}
      </View>

      <Button
        mode="contained"
        style={{
          borderRadius: 100,
          marginTop: 10,
        }}
        contentStyle={{ padding: 7.5 }}
        onPress={() => navigation.navigate("CreateQRCode")}
      >
        Next
      </Button>
    </View>
  );
}
