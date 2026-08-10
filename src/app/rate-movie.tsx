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
import { useUpsertRatingMutation, useGetMyRatingQuery } from "../redux/ratings/ratingsApi";
import { usePatchItemMutation } from "../redux/lists/listsApi";
import { spacing } from "../constants/design";

export default function RateMovieScreen() {
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
  const [patchItem] = usePatchItemMutation();

  const { data: existingRating } = useGetMyRatingQuery(
    { contentType: params.contentType, contentId: Number(params.movieId) },
    { skip: !user || !params.movieId },
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

  const handleSave = async () => {
    if (!canSave) return;

    if (user) {
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
      <Text style={styles.title}>Rate this movie</Text>

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
        placeholder="Add a review…"
        value={review}
        onChangeText={setReview}
        multiline
        maxLength={300}
        style={{ marginBottom: spacing.xxl }}
      />

      <View style={styles.actions}>
        <Button mode="text" onPress={() => router.back()} textColor="#888">
          Cancel
        </Button>
        <PrimaryButton onPress={handleSave} disabled={!canSave}>
          Save
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
  title: {
    fontSize: 22,
    fontFamily: "Bebas",
    marginBottom: spacing.xxl,
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
