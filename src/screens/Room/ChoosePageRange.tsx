import { Dimensions, StyleSheet, View } from "react-native";
import { Appbar, Button, IconButton, Text, TextInput, useTheme } from "react-native-paper";
import { useCreateRoom } from "./ContextProvider";
import { useEffect, useMemo, useState } from "react";
import { url } from "../../service/SocketContext";
import Skeleton from "../../components/Skeleton/Skeleton";
import Animated, { FadeIn } from "react-native-reanimated";
import { useGetMaxPageRangeQuery } from "../../redux/movie/movieApi";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import useTranslation from "../../service/useTranslation";
import PageHeading from "../../components/PageHeading";

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

const { width } = Dimensions.get("screen");

export default function ChoosePageRange({ navigation }: any) {
  const { pageRange, setPageRange, category, genre } = useCreateRoom();

  const { data = {} as { maxCount: number }, isLoading: loading } = useGetMaxPageRangeQuery({
    type: category,
    genres: genre.map((g: any) => g.id).join(","),
  });

  const nums = useMemo(() => generateArrayWithMaxIncrement(data.maxCount, 7), [data.maxCount]);

  const theme = useTheme();

  const t = useTranslation();

  return (
    <SafeIOSContainer>
      <PageHeading title={t("room.randomize-search")} />
      <View style={{ padding: 15, flex: 1 }}>
        <Text style={{ fontSize: 18, color: "rgba(255,255,255,0.95)", fontWeight: "500" }}>{t("room.page-range")}</Text>

        <View style={{ flex: 1, marginTop: 15 }}>
          <Text style={{ fontFamily: "Bebas", color: "#fff", fontSize: 25, marginVertical: 15 }}>{t("room.page-range-desc")}</Text>

          {!loading ? (
            nums.map((n, index) => (
              <Animated.View key={index} entering={FadeIn.delay(index * 50)}>
                <Button
                  mode="contained"
                  style={{ marginBottom: 10, borderRadius: 10 }}
                  contentStyle={{ padding: 5 }}
                  buttonColor={theme.colors.surface}
                  onPress={() => {
                    setPageRange(n.toString());
                    navigation.navigate("CreateQRCode");
                  }}
                >
                  {n}
                </Button>
              </Animated.View>
            ))
          ) : (
            <Skeleton>
              <View style={{ width: width - 30, height: 50 * 7 }}>
                <View style={styles.placeholder} />
                <View style={styles.placeholder} />
                <View style={styles.placeholder} />
                <View style={styles.placeholder} />
                <View style={styles.placeholder} />
                <View style={styles.placeholder} />
                <View style={styles.placeholder} />
              </View>
            </Skeleton>
          )}
        </View>
      </View>
      <View style={{ paddingHorizontal: 15, paddingTop: 15 }}>
        <Button
          mode="contained"
          style={{
            borderRadius: 100,
            marginTop: 10,
          }}
          contentStyle={{ padding: 7.5 }}
          onPress={() => navigation.navigate("CreateQRCode")}
        >
          {t("room.next")}
        </Button>
      </View>
    </SafeIOSContainer>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    width: width - 30,
    height: 50,
    backgroundColor: "#333",
    borderRadius: 7.5,
    marginBottom: 10,
  },
});
