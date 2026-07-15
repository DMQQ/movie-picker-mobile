import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Button, Text } from "react-native-paper";
import PrimaryButton from "../../components/PrimaryButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAppDispatch } from "../../redux/store";
import { usePatchItemMutation } from "../../redux/lists/listsApi";
import { rateInGroup } from "../../redux/favourites/favourites";

export default function RateMovieScreen() {
  const params = useLocalSearchParams<{
    movieId: string;
    groupId: string;
    remoteItemId?: string;
    listType?: string;
    rating?: string;
    note?: string;
  }>();

  const dispatch = useAppDispatch();
  const [patchItem] = usePatchItemMutation();

  const [rating, setRating] = useState<number | null>(
    params.rating ? Number(params.rating) : null
  );
  const [note, setNote] = useState(params.note ?? "");

  const handleSave = async () => {
    const payload = {
      rating: rating,
      note: note.trim() || null,
    };

    if (params.remoteItemId) {
      await patchItem({
        itemId: params.remoteItemId,
        listType: params.listType,
        ...payload,
      });
    } else {
      dispatch(rateInGroup({
        groupId: params.groupId,
        movieId: Number(params.movieId),
        ...payload,
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
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            onPress={() => setRating(rating === star ? null : star)}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name={rating !== null && star <= rating ? "star" : "star-outline"}
              size={40}
              color={rating !== null && star <= rating ? "#FFD700" : "#555"}
            />
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.noteInput}
        placeholder="Add a note…"
        placeholderTextColor="#555"
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={300}
      />

      <View style={styles.actions}>
        <Button mode="text" onPress={() => router.back()} textColor="#888">
          Cancel
        </Button>
        <PrimaryButton onPress={handleSave} disabled={rating === null}>
          Save
        </PrimaryButton>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: "Bebas",
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  stars: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  noteInput: {
    backgroundColor: "#242424",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
});
