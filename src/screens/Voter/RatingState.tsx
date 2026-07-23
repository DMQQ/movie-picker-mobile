import { TouchableOpacity, useWindowDimensions, View } from "react-native";
import { MD2DarkTheme, Text } from "react-native-paper";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { ImageBackground } from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { EdgeInsets } from "react-native-safe-area-context";
import Touch from "../../components/Touch";
import RatingIcons from "../../components/RatingIcons";
import { FancySpinner } from "../../components/FancySpinner";
import useTranslation from "../../service/useTranslation";

const scaleTitle = (title: string, size = 30) => {
  if (title.length > 30) return size * 0.75;
  if (title.length > 20) return size * 0.85;
  return size;
};

interface Props {
  card: any;
  currentMovies: any[];
  insets: EdgeInsets;
  localRatings: { interest: number | null; mood: number | null; uniqueness: number | null };
  setLocalRatings: React.Dispatch<
    React.SetStateAction<{
      interest: number | null;
      mood: number | null;
      uniqueness: number | null;
    }>
  >;
}

export default function RatingState({
  card,
  currentMovies,
  insets,
  localRatings,
  setLocalRatings,
}: Props) {
  const t = useTranslation();
  const { height: screenHeight } = useWindowDimensions();
  const posterHeight = screenHeight * 0.35;
  const posterWidth = posterHeight * (2 / 3);

  if (!card) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 15,
        }}
      >
        <FancySpinner />
        <Text>{t("voter.home.waiting")}</Text>
      </View>
    );
  }

  const ratingRows = [
    {
      key: "interest" as const,
      label: t("voter.ratings.interest.label"),
      options: [
        { value: 0, icon: "😑", label: t("voter.ratings.interest.options.0") },
        { value: 1, icon: "🙂", label: t("voter.ratings.interest.options.1") },
        { value: 2, icon: "🔥", label: t("voter.ratings.interest.options.2") },
      ],
    },
    {
      key: "mood" as const,
      label: t("voter.ratings.mood.label"),
      options: [
        { value: 0, icon: "🙅", label: t("voter.ratings.mood.options.0") },
        { value: 1, icon: "🤷", label: t("voter.ratings.mood.options.1") },
        { value: 2, icon: "😍", label: t("voter.ratings.mood.options.2") },
      ],
    },
    {
      key: "uniqueness" as const,
      label: t("voter.ratings.novelty.label"),
      options: [
        { value: 0, icon: "🔁", label: t("voter.ratings.novelty.options.0") },
        { value: 1, icon: "🤔", label: t("voter.ratings.novelty.options.1") },
        { value: 2, icon: "✨", label: t("voter.ratings.novelty.options.2") },
      ],
    },
  ] as const;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: -insets.top,
        left: 0,
        right: 0,
        bottom: -insets.bottom,
      }}
      key={card.id}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
    >
      <ImageBackground
        blurRadius={5}
        source={{ uri: "https://image.tmdb.org/t/p/w500" + card?.backdrop_path }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}>
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 15,
              paddingTop: insets.top + 5,
              paddingBottom: 8,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 30, fontFamily: "Bebas" }}>
              {t("voter.home.rate")} 🎬
            </Text>
            <Text style={{ fontFamily: "Bebas", fontSize: 20 }}>
              {currentMovies.length} {t("voter.home.left")}
            </Text>
          </View>

          {/* Poster — flex:1 so it fills whatever vertical space remains above the rating rows */}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 15 }}>
            <TouchableOpacity
              disabled={typeof card?.id === "undefined"}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/movie/type/[type]/[id]",
                  params: {
                    id: card?.id,
                    type: card?.title ? "movie" : "tv",
                    img: card?.poster_path,
                  },
                })
              }
              style={{ width: posterWidth, height: posterHeight, borderRadius: 12, overflow: "hidden" }}
            >
              <Animated.Image
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(300)}
                source={{
                  uri: "https://image.tmdb.org/t/p/w342" + card?.poster_path,
                }}
                style={{ width: "100%", height: "100%", borderRadius: 12 }}
                resizeMode="cover"
              />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: scaleTitle((card?.title || card?.name)! as string, 34),
                fontFamily: "Bebas",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              {card?.title || card?.name}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 3,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <RatingIcons vote={card.vote_average} size={11} />
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                {[
                  card?.release_date?.slice(0, 4),
                  card?.original_language?.toUpperCase(),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>

            <Text
              numberOfLines={2}
              style={{
                marginTop: 6,
                color: "rgba(255,255,255,0.75)",
                fontSize: 13,
                textAlign: "center",
                lineHeight: 19,
              }}
            >
              {card?.overview}
            </Text>
          </View>

          {/* Rating rows */}
          <View
            style={{
              paddingHorizontal: 15,
              paddingTop: 10,
              paddingBottom: insets.bottom + 10,
              gap: 10,
            }}
          >
            {ratingRows.map(({ key, label, options }) => (
              <View key={key} style={{ gap: 5 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Bebas",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {label}
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {options.map((option) => {
                    const isSelected = localRatings[key] === option.value;
                    return (
                      <Touch
                        key={option.value}
                        scaleTo={0.94}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setLocalRatings((p) => ({ ...p, [key]: option.value }));
                        }}
                        style={{
                          flex: 1,
                          height: 64,
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                          borderRadius: 12,
                          backgroundColor: isSelected
                            ? MD2DarkTheme.colors.primary
                            : "rgba(0,0,0,0.5)",
                          borderWidth: 1,
                          borderColor: isSelected
                            ? MD2DarkTheme.colors.primary
                            : "rgba(255,255,255,0.12)",
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>{option.icon}</Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#fff",
                            textAlign: "center",
                            paddingHorizontal: 4,
                          }}
                        >
                          {option.label}
                        </Text>
                      </Touch>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}
