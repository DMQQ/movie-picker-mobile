import { StyleSheet, TouchableOpacity, View } from "react-native";
import { IconButton, Text, TouchableRipple } from "react-native-paper";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { addToGroup } from "../redux/favourites/favourites";
import { Movie } from "../../types";
import { useAppDispatch, useAppSelector } from "../redux/store";

import * as Haptics from "expo-haptics";
import useTranslation from "../service/useTranslation";
import { ReactNode } from "react";

export default function QuickActions(props: { movie: Movie; children?: ReactNode }) {
  const dispatch = useAppDispatch();
  const { groups } = useAppSelector((state) => state.favourite);

  const onPress = (groupId: "1" | "2" | "3") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!props.movie) return;
    dispatch(
      addToGroup({
        groupId: groupId,
        item: {
          id: props?.movie?.id,
          imageUrl: props?.movie?.poster_path,
          type: props?.movie?.type || props.movie?.title ? "movie" : "tv",
        },
      })
    );
  };

  const isInGroup = (groupId: "1" | "2" | "3") => {
    const group = groups.find((g) => g.id === groupId);

    if (!group) return false;

    return group.movies.some((m) => m.id === props.movie.id);
  };

  const t = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <TouchableOpacity style={[styles.iconButton]} onPress={() => onPress("2")}>
          <>
            <AntDesign name={isInGroup("2") ? "clockcircle" : "clockcircleo"} size={35} color="#fff" />

            <Text style={styles.iconText}>{t("quick-actions.watch-later")}</Text>
          </>
        </TouchableOpacity>
      </View>
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => onPress("1")}>
          <>
            <FontAwesome name={isInGroup("1") ? "star" : "star-o"} size={35} color="#fff" />
            <Text style={styles.iconText}>{t("quick-actions.favourite")}</Text>
          </>
        </TouchableOpacity>
      </View>
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => onPress("3")}>
          <>
            <AntDesign name={isInGroup("3") ? "eye" : "eyeo"} size={35} color="#fff" />
            <Text style={styles.iconText}>{t("quick-actions.watched")}</Text>
          </>
        </TouchableOpacity>
      </View>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },

  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
  },
  iconText: {
    fontFamily: "Bebas",
    fontSize: 20,
  },
  iconContainer: {},
});
