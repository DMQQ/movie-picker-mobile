import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChooseRegion from "../../components/ChooseRegion";
import PageHeading from "../../components/PageHeading";
import TransparentModalScreen from "../../components/TransparentModalBackGesture";
import { roomActions } from "../../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import PlatformBlurView, { BlurViewWrapper } from "../../components/PlatformBlurView";
import { ScreenProps } from "../../screens/types";

export default function RegionSelectorScreen({ navigation }: ScreenProps<"RegionSelector">) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const nickname = useAppSelector((state) => state.room.nickname);
  const language = useAppSelector((state) => state.room.language);

  return (
    <TransparentModalScreen>
      <BlurViewWrapper style={{ flex: 1 }} intensity={50} tint="dark">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.1)", paddingTop: insets.top * 2 }}>
          <PageHeading title="Select Region" onPress={() => navigation.goBack()} />
          <View style={{ flex: 1 }}>
            <ChooseRegion
              showAsSelector={true}
              onBack={() => navigation.goBack()}
              onRegionSelect={async (region) => {
                const headers = {} as Record<string, string>;
                headers["x-user-region"] = region.code;
                headers["x-user-watch-provider"] = region.code;
                headers["x-user-watch-region"] = region.code;
                headers["x-user-timezone"] = region.timezone;

                await AsyncStorage.setItem("regionalization", JSON.stringify(headers));
                dispatch(roomActions.setSettings({ nickname, language, regionalization: headers }));
                navigation.goBack();
              }}
            />
          </View>
        </View>
      </BlurViewWrapper>
    </TransparentModalScreen>
  );
}
