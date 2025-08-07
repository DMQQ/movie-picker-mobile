import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Home: {
    roomId: string;
    type: "movie" | "tv";
  };
  Landing: undefined;
  QRCode: undefined;
  QRScanner: undefined;
  Overview: undefined;
  MovieDetails: { id: number; type: "movie" | "tv"; img?: string };

  Settings: undefined;

  RegionSelector: undefined;

  Fortune: { category?: string };

  Favourites: undefined;

  SectionSelector: undefined;

  Group: { group: { id: string; name: string } };

  Voter: undefined;

  Games: undefined;

  Search: undefined;

  SearchFilters: undefined;
};

export type ScreenProps<Key extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, Key>;
