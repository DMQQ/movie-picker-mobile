import { useEffect, useState } from "react";
import Text from "../components/Text";
import TextInput from "../components/TextInput";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Button from "../components/Button";
import PrimaryButton from "../components/PrimaryButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { rateInGroup } from "../redux/favourites/favourites";
import { useUpsertRatingMutation, useGetMyRatingQuery, useDeleteRatingMutation } from "../redux/ratings/ratingsApi";
import { usePatchItemMutation } from "../redux/lists/listsApi";
import { colors, spacing } from "../constants/design";
import useTranslation from "../service/useTranslation";

export default function RateMovieScreen() {
  const t = useTranslation();
  const params = useLocalSearchParams<{
    movieId: string;
    contentType: string;
    groupId?: string;
    rating?: string;
    review?: string;
    itemId?: string;
    listType?: string;
  }>();

  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const [upsertRating] = useUpsertRatingMutation();
  const [deleteRating] = useDeleteRatingMutation();
  const [patchItem] = usePatchItemMutation();

  const { data: existingRating } = useGetMyRatingQuery(
    { contentType: params.contentType, contentId: Number(params.movieId) },
    { skip: !user || user.provider === "anonymous" || !params.movieId },
  );

  const [rating, setRating] = useState<number | null>(
    params.rating ? Number(params.rating) : null,
  );
  const [review, setReview] = useState(params.review ?? "");
  const [prefilled, setPrefilled] = useState(!!params.rating);

  useEffect(() => {
    if (existingRating && !prefilled) {
      setRating(existingRating.rating);
      setReview(existingRating.review ?? "");
      setPrefilled(true);
    }
  }, [existingRating, prefilled]);

  const canSave = rating !== null && (!!user || !!params.groupId);

  const handleDelete = async () => {
    await deleteRating({ contentType: params.contentType, contentId: Number(params.movieId) });
    router.back();
  };

  const handleSave = async () => {
    if (!canSave) return;

    if (user && user.provider !== "anonymous") {
      await upsertRating({
        contentType: params.contentType,
        contentId: Number(params.movieId),
        rating: rating!,
        review: review.trim() || null,
      });
      if (params.itemId) {
        await patchItem({
          itemId: params.itemId,
          listType: params.listType,
          rating,
          review: review.trim() || null,
        });
      }
    } else if (params.groupId) {
      dispatch(rateInGroup({
        groupId: params.groupId,
        movieId: Number(params.movieId),
        rating,
        review: review.trim() || null,
      }));
    }

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t("ratings.rateTitle") as string}</Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <MaterialCommunityIcons name="close" size={20} color={colors.placeholder} />
        </Pressable>
      </View>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <Pressable
            key={star}
            onPress={() => setRating(rating === star ? null : star)}
            hitSlop={6}
          >
            <MaterialCommunityIcons
              name={rating !== null && star <= rating ? "star" : "star-outline"}
              size={28}
              color={rating !== null && star <= rating ? "#FFD700" : "#555"}
            />
          </Pressable>
        ))}
      </View>

      <TextInput
        placeholder={t("ratings.reviewPlaceholder") as string}
        value={review}
        onChangeText={setReview}
        multiline
        maxLength={300}
        style={{ marginBottom: spacing.xxl }}
      />

      <View style={styles.actions}>
        {existingRating && (
          <Button mode="text" onPress={handleDelete} textColor="#E5484D">
            {t("ratings.deleteRating") as string}
          </Button>
        )}
        <PrimaryButton onPress={handleSave} disabled={!canSave}>
          {t("overview.save-list") as string}
        </PrimaryButton>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 22,
    fontFamily: "Bebas",
    letterSpacing: 0.5,
  },
  stars: {
    flexDirection: "row",
    gap: spacing.sm - 2,
    marginBottom: spacing.xxl,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
});
