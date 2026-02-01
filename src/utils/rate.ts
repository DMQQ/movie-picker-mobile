import * as StoreReview from "expo-store-review";
import { storage } from "./storage";

class ReviewManager {
  private static readonly REVIEW_KEY = "app_review_requested";
  private static readonly GAMES_PLAYED_KEY = "games_played_count";

  static async shouldRequestReview(): Promise<boolean> {
    try {
      const hasRequested = await storage.getItemAsync(this.REVIEW_KEY);
      const gamesPlayed = await storage.getItemAsync(this.GAMES_PLAYED_KEY);

      if (hasRequested === "true") return false;

      const count = parseInt(gamesPlayed || "0", 10);
      return count >= 3;
    } catch {
      return false;
    }
  }

  static async onGameComplete(won: boolean): Promise<void> {
    try {
      const gamesPlayed = await storage.getItemAsync(this.GAMES_PLAYED_KEY);
      const count = parseInt(gamesPlayed || "0", 10) + 1;
      await storage.setItemAsync(this.GAMES_PLAYED_KEY, count.toString());

      if (won && (await StoreReview.hasAction()) && (await this.shouldRequestReview())) {
        await StoreReview.requestReview();
        await storage.setItemAsync(this.REVIEW_KEY, "true");
      }
    } catch {}
  }
}

export default ReviewManager;
