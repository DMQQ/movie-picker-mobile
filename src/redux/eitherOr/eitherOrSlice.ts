import { createSlice } from "@reduxjs/toolkit";
import { Movie } from "../../../types";

export type Side = "champion" | "challenger";

export interface EitherOrUser {
  userId: string;
  username: string;
  isAdmin: boolean;
  isActive: boolean;
}

export interface RoundTally {
  champion: number;
  challenger: number;
}

export interface CurrentMatch {
  roundNumber: number;
  totalRounds: number;
  matchIndex: number;
  matchesInRound: number;
  champion: Movie;
  challenger: Movie;
  countdownMs: number;
  startedAt: number;
}

export interface RoundResult {
  roundNumber: number;
  matchIndex: number;
  matchesInRound: number;
  winnerSide: Side;
  winnerMovie: Movie;
  loserMovie: Movie;
  tally: RoundTally;
  isFinal: boolean;
  tieReason?: "speed" | "champion-keeps";
}

export interface RoundHistoryEntry {
  roundNumber: number;
  matchIndex: number;
  winner: Movie;
  loser: Movie;
  loserVotes: number;
  tally: RoundTally;
  winnerSide: Side;
  votes: Record<string, Side>;
}

export interface MatchResultEntry {
  roundNumber: number;
  matchIndex: number;
  winner: Movie;
  loser: Movie;
}

const initialState = {
  roomId: "",
  host: "",
  isHost: false,
  users: [] as EitherOrUser[],
  isStarted: false,
  bracketSize: 8,

  isJoining: false,
  joinError: false,
  error: null as string | null,
  roomDeleted: false,
  isCustomRoom: null as boolean | null,

  currentMatch: null as CurrentMatch | null,
  tally: { champion: 0, challenger: 0 } as RoundTally,
  votedUserIds: [] as string[],
  votedSide: null as Side | null,
  lastResult: null as RoundResult | null,

  champion: null as Movie | null,
  top3: [] as Movie[],
  history: [] as RoundHistoryEntry[],
  matchResults: [] as MatchResultEntry[],
  players: [] as { userId: string; username: string }[],
  gameEnded: false,
};

const eitherOrSlice = createSlice({
  name: "eitherOr",
  initialState,
  reducers: {
    setRoomId(state, { payload }: { payload: string }) {
      if (state.roomId === payload) return;
      Object.assign(state, initialState);
      state.roomId = payload;
    },

    setRoomState(
      state,
      {
        payload,
      }: {
        payload: { roomId: string; host: string; users: EitherOrUser[]; isStarted: boolean; bracketSize: number };
      },
    ) {
      state.roomId = payload.roomId;
      state.host = payload.host;
      state.users = payload.users;
      state.isStarted = payload.isStarted;
      state.bracketSize = payload.bracketSize;
    },

    setIsHost(state, { payload }: { payload: boolean }) {
      state.isHost = payload;
    },

    setActiveNicknames(state, { payload }: { payload: string[] }) {
      const active = new Set(payload);
      state.users = state.users.map((u) => ({ ...u, isActive: active.has(u.username) }));
    },

    setIsCustomRoom(state, { payload }: { payload: boolean }) {
      state.isCustomRoom = payload;
    },

    setJoining(state, { payload }: { payload: boolean }) {
      state.isJoining = payload;
    },

    setJoinError(state, { payload }: { payload: boolean }) {
      state.joinError = payload;
    },

    setError(state, { payload }: { payload: string | null }) {
      state.error = payload;
    },

    setRoomDeleted(state) {
      state.roomDeleted = true;
    },

    roundStart(state, { payload }: { payload: Omit<CurrentMatch, "startedAt"> }) {
      state.currentMatch = { ...payload, startedAt: Date.now() };
      state.tally = { champion: 0, challenger: 0 };
      state.votedUserIds = [];
      state.votedSide = null;
      state.lastResult = null;
    },

    setVotedSide(state, { payload }: { payload: Side }) {
      state.votedSide = payload;
    },

    voteUpdate(state, { payload }: { payload: { tally: RoundTally; votedUserIds?: string[] } }) {
      state.tally = payload.tally;
      if (payload.votedUserIds) state.votedUserIds = payload.votedUserIds;
    },

    roundWinner(state, { payload }: { payload: RoundResult }) {
      state.lastResult = payload;
      const exists = state.matchResults.some(
        (m) => m.roundNumber === payload.roundNumber && m.matchIndex === payload.matchIndex,
      );
      if (!exists) {
        state.matchResults.push({
          roundNumber: payload.roundNumber,
          matchIndex: payload.matchIndex,
          winner: payload.winnerMovie,
          loser: payload.loserMovie,
        });
      }
    },

    gameComplete(
      state,
      { payload }: { payload: { champion: Movie; top3: Movie[]; history: RoundHistoryEntry[]; players?: { userId: string; username: string }[] } },
    ) {
      state.champion = payload.champion;
      state.top3 = payload.top3;
      state.history = payload.history;
      if (payload.players) state.players = payload.players;
      state.matchResults = payload.history.map((h) => ({
        roundNumber: h.roundNumber,
        matchIndex: h.matchIndex,
        winner: h.winner,
        loser: h.loser,
      }));
      state.gameEnded = true;
      state.isStarted = false;
    },

    reset() {
      return initialState;
    },
  },
});

export { eitherOrSlice };
export const eitherOrActions = eitherOrSlice.actions;
