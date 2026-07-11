export interface IMovieSummary {
  id: number;
  title: string;
  poster_path: string;
}

export interface IGameSummary {
  roomId: string;
  type: string;
  genres: number[];
  providers: number[];
  maxRounds: number;
  finalPage: number;
  totalUsers: number;
  users: Array<{
    userId: string;
    username: string;
    finished: boolean;
    totalPicks: number;
    picks: Record<string, string>;
    swipedMovies: {
      totalSwiped: number;
      liked: IMovieSummary[];
      disliked: IMovieSummary[];
    };
  }>;
  matchedMovies: IMovieSummary[];
  totalMatches: number;
  gameEndReason: string;
}
