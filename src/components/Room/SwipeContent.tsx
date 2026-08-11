import { memo, useCallback, useRef } from "react";
import { Dimensions, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import { useAppSelector } from "../../redux/store";
import useRoomContext from "../../context/RoomContext";
import SwipeCard from "../Movie/SwipeCard";
import TabBar from "../Home/TabBar";
import useTranslation from "../../service/useTranslation";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.15;

const SwipeContent = memo(() => {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const mediaType = type || "movie";
  const cards = useAppSelector((state) => state.room.movies);
  const { dislikeCard, likeCard, blockAndDislikeCard, superLikeAndLikeCard } =
    useRoomContext();

  const t = useTranslation();
  const busy = useRef(false);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const dragProgress = useSharedValue(0);
  const isSwipingOut = useSharedValue(false);
  const isLikeBadge = useSharedValue(false);
  const isNopeBadge = useSharedValue(false);

  const cardsRef = useRef(cards);
  cardsRef.current = cards;
  const likeCardRef = useRef(likeCard);
  likeCardRef.current = likeCard;
  const dislikeCardRef = useRef(dislikeCard);
  dislikeCardRef.current = dislikeCard;
  const superLikeAndLikeCardRef = useRef(superLikeAndLikeCard);
  superLikeAndLikeCardRef.current = superLikeAndLikeCard;
  const blockAndDislikeCardRef = useRef(blockAndDislikeCard);
  blockAndDislikeCardRef.current = blockAndDislikeCard;

  const visibleCards = cards.slice(0, 3);

  // Reset shared values after React commits the new tree (old card gone).
  // busy ref is also reset here — never before, or the next button press
  // races past isSwipingOut and gets swallowed by the reaction guard.
  const finishSwipe = useCallback(() => {
    translateX.value = 0;
    translateY.value = 0;
    dragProgress.value = 0;
    isSwipingOut.value = false;
    busy.current = false;
  }, [translateX, translateY, dragProgress, isSwipingOut]);

  const completeSwipeLike = useCallback(() => {
    const top = cardsRef.current[0];
    if (top) likeCardRef.current(top, 0);
    setTimeout(finishSwipe, 0);
  }, [finishSwipe]);

  const completeSwipeDislike = useCallback(() => {
    const top = cardsRef.current[0];
    if (top) dislikeCardRef.current(top, 0);
    setTimeout(finishSwipe, 0);
  }, [finishSwipe]);

  const completeButtonSwipe = useCallback(
    (dir: number) => {
      const top = cardsRef.current[0];
      if (!top) return;

      if (dir === 1) likeCardRef.current(top, 0);
      else if (dir === -1) dislikeCardRef.current(top, 0);
      else if (dir === 2) superLikeAndLikeCardRef.current(top, 0);
      else if (dir === -2) blockAndDislikeCardRef.current(top, 0);

      setTimeout(finishSwipe, 0);
    },
    [finishSwipe],
  );

  const openDetail = useCallback(() => {
    const top = cardsRef.current[0];
    if (!top) return;
    router.push({
      pathname: "/movie/type/[type]/[id]",
      params: { id: top.id, type: mediaType, img: top.poster_path },
    });
  }, [mediaType]);

  const swipe = useCallback(
    (dir: number) => {
      if (busy.current || cards.length === 0 || isSwipingOut.value) return;
      busy.current = true;
      isSwipingOut.value = true;
      isLikeBadge.value = false;
      isNopeBadge.value = false;

      const targetX = dir > 0 ? width + 200 : -width - 200;
      const exitCfg = { duration: 280, easing: Easing.out(Easing.cubic) };

      dragProgress.value = withTiming(1, exitCfg);
      translateX.value = withTiming(targetX, exitCfg, (finished) => {
        if (finished) runOnJS(completeButtonSwipe)(dir);
      });
    },
    [cards.length, completeButtonSwipe, dragProgress, isLikeBadge, isNopeBadge, isSwipingOut, translateX],
  );

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      if (isSwipingOut.value) return;
    })
    .onChange(({ translationX, translationY }) => {
      if (isSwipingOut.value) return;
      translateX.value = translationX;
      translateY.value = translationY;
      dragProgress.value = Math.min(
        Math.abs(translationX) / SWIPE_THRESHOLD,
        1,
      );
      isLikeBadge.value = translationX > 50;
      isNopeBadge.value = translationX < -50;
    })
    .onEnd(({ translationX }) => {
      if (isSwipingOut.value) return;

      // Clear badges immediately so incoming top card never sees them
      isLikeBadge.value = false;
      isNopeBadge.value = false;

      const exitCfg = { duration: 250, easing: Easing.out(Easing.cubic) };

      if (translationX > SWIPE_THRESHOLD) {
        isSwipingOut.value = true;
        dragProgress.value = withTiming(1, exitCfg);
        translateX.value = withTiming(width + 200, exitCfg, (finished) => {
          if (finished) runOnJS(completeSwipeLike)();
        });
      } else if (translationX < -SWIPE_THRESHOLD) {
        isSwipingOut.value = true;
        dragProgress.value = withTiming(1, exitCfg);
        translateX.value = withTiming(-width - 200, exitCfg, (finished) => {
          if (finished) runOnJS(completeSwipeDislike)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
        translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
        dragProgress.value = withTiming(0, { duration: 180 });
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    if (!isSwipingOut.value) runOnJS(openDetail)();
  });

  const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

  return (
    <>
      <GestureDetector gesture={composedGesture}>
        <View style={{ flex: 1 }}>
          {visibleCards
            .slice()
            .reverse()
            .map((card) => {
              const actualIndex = visibleCards.indexOf(card);
              const isTop = actualIndex === 0;
              return (
                <SwipeCard
                  key={card.id}
                  card={card}
                  index={actualIndex}
                  translateX={translateX}
                  translateY={translateY}
                  dragProgress={dragProgress}
                  isLeftVisible={isTop ? isLikeBadge : undefined}
                  isRightVisible={isTop ? isNopeBadge : undefined}
                />
              );
            })}
        </View>
      </GestureDetector>

      {cards[0] && (
        <TabBar
          zIndex={0}
          disabled={false}
          likeCard={() => swipe(1)}
          removeCard={() => swipe(-1)}
          openInfo={openDetail}
          blockCard={() => swipe(-2)}
          superLikeCard={() => swipe(2)}
          labels={{
            block: t("swipe.block") as string,
            dislike: t("swipe.nope") as string,
            like: t("swipe.like") as string,
            superLike: t("swipe.super") as string,
          }}
        />
      )}
    </>
  );
});

export default SwipeContent;
