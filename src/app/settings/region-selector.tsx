import AsyncStorage from "@react-native-async-storage/async-storage";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChooseRegion from "../../components/ChooseRegion";
import PageHeading from "../../components/PageHeading";
import TransparentModalScreen from "../../components/TransparentModalBackGesture";
import { roomActions } from "../../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { BlurViewWrapper } from "../../components/PlatformBlurView";
import { router } from "expo-router";

export default function RegionSelectorScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const nickname = useAppSelector((state) => state.room.nickname);
  const language = useAppSelector((state) => state.room.language);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.1)", paddingTop: insets.top * 2 }}>
        <PageHeading title="Select Region" onPress={() => router.back()} />
        <View style={{ flex: 1 }}>
          <ChooseRegion
            showAsSelector={true}
            onBack={() => router.back()}
            onRegionSelect={async (region) => {
              const headers = {} as Record<string, string>;
              headers["x-user-region"] = region.code;
              headers["x-user-watch-provider"] = region.code;
              headers["x-user-watch-region"] = region.code;
              headers["x-user-timezone"] = region.timezone;

              await AsyncStorage.setItem("regionalization", JSON.stringify(headers));
              dispatch(roomActions.setSettings({ nickname, language, regionalization: headers }));
              router.back();
            }}
          />
        </View>
      </View>
    </View>
  );
}
