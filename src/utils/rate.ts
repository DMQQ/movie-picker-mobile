import * as StoreReview from "expo-store-review";
import { AsyncStorage } from "expo-sqlite/kv-store";

const TWO_WEEKS_MS = 7 * 24 * 60 * 60 * 1000;

class ReviewManager {
  private static readonly REVIEW_KEY = "app_review_requested";
  private static readonly GAMES_PLAYED_KEY = "games_played_count";
  private static readonly RATING_REVIEW_TIMESTAMP_KEY = "rating_review_last_requested";

  static async shouldRequestReview(): Promise<boolean> {
    try {
      const hasRequested = await AsyncStorage.getItem(this.REVIEW_KEY);
      const gamesPlayed = await AsyncStorage.getItem(this.GAMES_PLAYED_KEY);

      if (hasRequested === "true") return false;

      const count = parseInt(gamesPlayed || "0", 10);
      return count >= 3;
    } catch {
      return false;
    }
  }

  static async onGameComplete(won: boolean): Promise<void> {
    try {
      const gamesPlayed = await AsyncStorage.getItem(this.GAMES_PLAYED_KEY);
      const count = parseInt(gamesPlayed || "0", 10) + 1;
      await AsyncStorage.setItem(this.GAMES_PLAYED_KEY, count.toString());

      if (won && (await StoreReview.hasAction()) && (await this.shouldRequestReview())) {
        await StoreReview.requestReview();
        await AsyncStorage.setItem(this.REVIEW_KEY, "true");
      }
    } catch {}
  }

  static async canRequestReviewFromRating(): Promise<boolean> {
    try {
      const lastRequested = await AsyncStorage.getItem(this.RATING_REVIEW_TIMESTAMP_KEY);
      if (!lastRequested) return true;

      const lastTimestamp = parseInt(lastRequested, 10);
      if (!Number.isFinite(lastTimestamp)) return true;

      const now = Date.now();
      return now - lastTimestamp >= TWO_WEEKS_MS;
    } catch {
      return true;
    }
  }

  static async recordReviewRequestFromRating(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.RATING_REVIEW_TIMESTAMP_KEY, Date.now().toString());
    } catch {}
  }
}

export default ReviewManager;
