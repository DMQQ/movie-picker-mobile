import { memo, useCallback, useEffect, useRef, useTransition } from "react";
import { useSharedValue } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { useAppSelector } from "../../redux/store";
import useRoomContext from "../../context/RoomContext";
import SwipeTile from "../Movie/SwipeTiles";
import TabBar from "../Home/TabBar";
import useTranslation from "../../service/useTranslation";

const SwipeContent = memo(() => {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const mediaType = type || "movie";
  const cards = useAppSelector((state) => state.room.movies);
  const { dislikeCard, likeCard, blockAndDislikeCard, superLikeAndLikeCard } = useRoomContext();

  const t = useTranslation();
  const originalLength = useRef(cards.length);
  const dragProgress = useSharedValue(0);
  const buttonSwipe = useSharedValue(0);
  const [isPending] = useTransition();
  const busy = useRef(false);
  const hrefCache = useRef(new Map<number, { pathname: string; params: object }>());

  useEffect(() => {
    busy.current = false;
  }, [cards]);

  const swipe = useCallback(
    (dir: number) => {
      if (busy.current || isPending || cards.length === 0) return;
      busy.current = true;
      buttonSwipe.value = dir;
    },
    [isPending, cards.length, buttonSwipe],
  );

  const topCard = cards[0];
  const visibleCards = cards.slice(0, 3);

  return (
    <>
      {visibleCards.map((card, index) => {
        let href = hrefCache.current.get(card.id);
        if (!href || (href.params as any).type !== mediaType) {
          href = {
            pathname: "/movie/type/[type]/[id]" as const,
            params: { id: card.id, type: mediaType, img: card.poster_path },
          };
          hrefCache.current.set(card.id, href);
        }
        return (
          <SwipeTile
            href={href}
            length={originalLength.current}
            key={card.id}
            card={card}
            index={index}
            dragProgress={dragProgress}
            buttonSwipe={index === 0 ? buttonSwipe : undefined}
            likeCard={() => likeCard(card, index)}
            removeCard={() => dislikeCard(card, index)}
            blockCard={() => blockAndDislikeCard(card, index)}
            superLikeCard={() => superLikeAndLikeCard(card, index)}
          />
        );
      })}
      {topCard && (
        <TabBar
          zIndex={0}
          disabled={isPending}
          likeCard={() => swipe(1)}
          removeCard={() => swipe(-1)}
          openInfo={() =>
            router.push({
              pathname: "/movie/type/[type]/[id]",
              params: { id: topCard.id, type: mediaType, img: topCard.poster_path },
            })
          }
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
