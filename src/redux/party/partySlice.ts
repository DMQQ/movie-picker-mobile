import { createSlice } from "@reduxjs/toolkit";

export interface PartyMember {
  userId: string;
  nickname: string;
}

export type PartyGameMode = "swipe" | "voter" | "either-or";

interface PartyState {
  partyId: string | null;
  members: PartyMember[];
  host: string | null;
  nextGame: PartyGameMode | null;
  swipeFromParty: boolean;
}

const initialState: PartyState = {
  partyId: null,
  members: [],
  host: null,
  nextGame: null,
  swipeFromParty: false,
};

const partySlice = createSlice({
  name: "party",
  initialState,
  reducers: {
    setParty(
      state,
      {
        payload,
      }: {
        payload: { partyId: string; members?: PartyMember[]; host?: string };
      },
    ) {
      state.partyId = payload.partyId;
      if (payload.members !== undefined) state.members = payload.members;
      if (payload.host !== undefined) state.host = payload.host;
    },

    updatePartyMembers(state, { payload }: { payload: PartyMember[] }) {
      state.members = payload;
    },

    setNextGame(state, { payload }: { payload: PartyGameMode | null }) {
      state.nextGame = payload;
    },

    setSwipeFromParty(state, { payload }: { payload: boolean }) {
      state.swipeFromParty = payload;
    },

    clearParty(state) {
      Object.assign(state, initialState);
    },
  },
});

export { partySlice };
export const partyActions = partySlice.actions;
