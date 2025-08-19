import { View } from "react-native";
import AppLoadingOverlay from "../AppLoadingOverlay";
import NoConnectionError from "../NoConnectionError";
import BottomTab from "./BottomTab";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1 }}>
      <AppLoadingOverlay />
      <NoConnectionError />

      {children}

      <BottomTab />
    </View>
  );
}
