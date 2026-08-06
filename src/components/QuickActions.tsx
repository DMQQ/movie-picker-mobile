import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ReactNode } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { Movie } from "../../types";
import { addToGroup, removeFromGroup } from "../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../redux/store";
import useTranslation from "../service/useTranslation";
import { fontSize, spacing } from "../constants/design";

export function useQuickActions(props: { movie: Movie }) {
  const dispatch = useAppDispatch();
  const membershipIndex = useAppSelector(
    (state) => state.favourite.membershipIndex,
  );

  const isInGroup = (groupId: "1" | "2" | "999") => {
    const movieType =
      props.movie?.type ?? (props.movie?.first_air_date ? "tv" : "movie");
    return !!membershipIndex[groupId]?.[`${props.movie?.id}:${movieType}`];
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
            type:
              props?.movie?.type ||
              (props.movie?.first_air_date ? "tv" : "movie"),
          },
        }),
      );
    else
      dispatch(
        removeFromGroup({
          groupId: groupId,
          movieId: props?.movie?.id,
        }),
      );
  };

  return {
    isInGroup,
    onPress,
  };
}

export default function QuickActions(props: {
  movie: Movie;
  children?: ReactNode;
  hideLabels?: boolean;
}) {
  const { isInGroup, onPress } = useQuickActions({ movie: props.movie });
  const t = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <TouchableOpacity
          style={[styles.iconButton]}
          onPress={() => onPress("2")}
        >
          <MaterialCommunityIcons
            name={isInGroup("2") ? "clock" : "clock-outline"}
            size={35}
            color="#fff"
          />
          {!props?.hideLabels && (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.iconText}
            >
              {t("quick-actions.watch-later")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.iconContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => onPress("1")}
        >
          <MaterialCommunityIcons
            name={isInGroup("1") ? "heart" : "heart-outline"}
            size={35}
            color="#fff"
          />
          {!props?.hideLabels && (
            <Text
              numberOfLines={1}
              ellipsizeMode="clip"
              style={styles.iconText}
            >
              {t("quick-actions.favourite")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.iconContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => onPress("999")}
        >
          <MaterialCommunityIcons
            name={isInGroup("999") ? "eye" : "eye-outline"}
            size={35}
            color="#fff"
          />
          {!props?.hideLabels && (
            <Text
              numberOfLines={1}
              ellipsizeMode="clip"
              style={styles.iconText}
            >
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
    gap: spacing.sm + 2,
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm + 2,
    overflow: "hidden",
    flex: 1,
  },
  iconText: {
    fontFamily: "Bebas",
    fontSize: fontSize.xxl,
    textAlign: "center",
    width: "100%",
    overflow: "hidden",
  },
  iconContainer: {
    flex: 1,
  },
});
