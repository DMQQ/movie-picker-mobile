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

  FortuneWheel: undefined;

  Favourites: undefined;
};

export type ScreenProps<Key extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, Key>;
