import { AntDesign, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ReactNode } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Movie } from "../../types";
import { addToGroup, removeFromGroup } from "../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../redux/store";
import useTranslation from "../service/useTranslation";

export function useQuickActions(props: { movie: Movie }) {
  const dispatch = useAppDispatch();
  const groups = useAppSelector((state) => state.favourite.groups);

  const isInGroup = (groupId: "1" | "2" | "999") => {
    const group = groups.find((g) => g?.id === groupId);
    if (!group) return false;
    return group.movies.some((m) => m?.id === props?.movie?.id);
  };

  const onPress = (groupId: "1" | "2" | "999") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!props.movie) return;

    if (!isInGroup(groupId))
      dispatch(
        addToGroup({
          groupId: groupId,
          item: {
            id: props?.movie?.id,
            imageUrl: props?.movie?.poster_path,
            type: props?.movie?.type || (props.movie?.title ? "movie" : "tv"),
          },
        })
      );
    else
      dispatch(
        removeFromGroup({
          groupId: groupId,
          movieId: props?.movie?.id,
        })
      );
  };

  return {
    isInGroup,
    onPress,
  };
}

export default function QuickActions(props: { movie: Movie; children?: ReactNode; hideLabels?: boolean }) {
  const { isInGroup, onPress } = useQuickActions({ movie: props.movie });
  const t = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <TouchableOpacity style={[styles.iconButton]} onPress={() => onPress("2")}>
          <MaterialCommunityIcons name={isInGroup("2") ? "clock" : "clock-check-outline"} size={35} color="#fff" />
          {!props?.hideLabels && (
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.iconText}>
              {t("quick-actions.watch-later")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => onPress("1")}>
          <FontAwesome name={isInGroup("1") ? "heart" : "heart-o"} size={35} color="#fff" />
          {!props?.hideLabels && (
            <Text numberOfLines={1} ellipsizeMode="clip" style={styles.iconText}>
              {t("quick-actions.favourite")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => onPress("999")}>
          <AntDesign name={isInGroup("999") ? "eye" : "eye-invisible"} size={35} color="#fff" />
          {!props?.hideLabels && (
            <Text numberOfLines={1} ellipsizeMode="clip" style={styles.iconText}>
              {t("quick-actions.watched")}
            </Text>
          )}
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
    flex: 1,
  },
  iconText: {
    fontFamily: "Bebas",
    fontSize: 20,
    textAlign: "center",
    width: "100%",
    overflow: "hidden",
  },
  iconContainer: {
    flex: 1,
  },
});
