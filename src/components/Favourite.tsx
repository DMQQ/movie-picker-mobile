import { Fragment, useCallback, useState } from "react";
import { View, TouchableOpacity, Modal, Text, StyleSheet, Platform, Pressable } from "react-native";
import { MD2DarkTheme, Portal } from "react-native-paper";
import { Movie } from "../../types";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { addToGroup, removeFromGroup } from "../redux/favourites/favourites";
import * as Haptics from "expo-haptics";
import useTranslation from "../service/useTranslation";
import { FontAwesome } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut, withSpring, withTiming, runOnJS } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ModalEnteringTransition = () => {
  "worklet";
  return {
    initialValues: {
      opacity: 0,
      transform: [{ scale: 0.8 }, { translateY: 100 }],
    },
    animations: {
      opacity: withSpring(1),
      transform: [
        { scale: withSpring(1) },
        {
          translateY: withSpring(0, {
            damping: 12,
            stiffness: 90,
          }),
        },
      ],
    },
  };
};

const ModalExitingTransition = () => {
  "worklet";
  return {
    initialValues: {
      opacity: 1,
      transform: [{ scale: 1 }, { translateY: 0 }],
    },
    animations: {
      opacity: withTiming(0, { duration: 200 }),
      transform: [{ scale: withTiming(0.9) }, { translateY: withTiming(-50) }],
    },
  };
};

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  if (Platform.OS === "android") return <Portal>{children}</Portal>;
  return <Fragment>{children}</Fragment>;
};

export default function CustomFavourite({ movie, showLabel = true }: { movie: Movie; showLabel?: boolean }) {
  const dispatch = useAppDispatch<any>();
  const favourites = useAppSelector((state) => state.favourite);
  const [visible, setVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const t = useTranslation();

  if (!movie) return null;

  const isFavorite = favourites?.groups?.some((group) => group.movies.some((m) => m?.id === movie?.id));

  const closeModal = useCallback(() => {
    setVisible(false);
    setIsClosing(false);
  }, []);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(closeModal, 500);
  };

  const onPress = (group: (typeof favourites.groups)[number]) => {
    group.movies.find((m) => m.id === movie.id)
      ? dispatch(
          removeFromGroup({
            groupId: group.id,
            movieId: movie.id,
          })
        )
      : dispatch(
          addToGroup({
            item: {
              id: movie.id,
              imageUrl: movie.poster_path,
              type: movie.type || (movie?.title !== undefined ? "movie" : "tv"),
            },
            groupId: group.id,
          })
        );

    handleClose();
  };

  return (
    <View>
      <TouchableOpacity style={styles.iconButton} onPress={() => setVisible(true)}>
        <>
          <FontAwesome name={isFavorite ? "bookmark" : "bookmark-o"} size={35} color="#fff" />
          {showLabel && <Text style={styles.iconText}>{t("quick-actions.my-lists")}</Text>}
        </>
      </TouchableOpacity>

      <Wrapper>
        <Modal visible={visible} transparent onRequestClose={handleClose} animationType="none">
          {!isClosing && (
            <AnimatedPressable entering={FadeIn} exiting={FadeOut.delay(200)} style={styles.overlay} onPress={handleClose}>
              <AnimatedPressable
                style={styles.dropdown}
                entering={ModalEnteringTransition}
                exiting={ModalExitingTransition}
                onPress={(e) => e.stopPropagation()}
              >
                <Text style={styles.modalTitle}>
                  {t("quick-actions.modal")} <Text style={styles.movieTitle}>{movie.title || movie.name}</Text>
                </Text>
                {favourites.groups.map((group) => (
                  <TouchableOpacity
                    key={group.id}
                    style={[
                      styles.item,
                      {
                        backgroundColor: group.movies.find((m) => m.id === movie.id)
                          ? MD2DarkTheme.colors.primary
                          : MD2DarkTheme.colors.background,
                      },
                    ]}
                    onPress={() => {
                      onPress(group);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={styles.itemText}>{group.name}</Text>
                  </TouchableOpacity>
                ))}
              </AnimatedPressable>
            </AnimatedPressable>
          )}
        </Modal>
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    backgroundColor: "#000",
    borderRadius: 15,
    padding: 25,
    width: "80%",
  },
  modalTitle: {
    color: MD2DarkTheme.colors.text,
    fontSize: 25,
    fontFamily: "Bebas",
    marginBottom: 20,
  },
  movieTitle: {
    fontWeight: "bold",
    color: MD2DarkTheme.colors.primary,
  },
  item: {
    borderRadius: 10,
    marginTop: 10,
    padding: 15,
    justifyContent: "center",
    textAlign: "center",
    alignItems: "center",
    backgroundColor: MD2DarkTheme.colors.surface,
  },
  itemText: {
    fontSize: 16,
    color: MD2DarkTheme.colors.text,
  },
  iconText: {
    fontFamily: "Bebas",
    fontSize: 20,
    color: "#fff",
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
  },
});
