import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Home: {
    roomId: string;
  };
  Landing: undefined;
  QRCode: undefined;
  QRScanner: undefined;
  Overview: undefined;
  MovieDetails: { id: number; type: "movie" | "tv" };
};

export type Props<Key extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Key>;
