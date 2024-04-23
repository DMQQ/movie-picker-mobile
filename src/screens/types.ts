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
};

export type Props<Key extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Key>;
