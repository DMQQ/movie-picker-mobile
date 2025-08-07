import { BlurView } from "expo-blur";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChooseRegion from "../components/ChooseRegion";
import PageHeading from "../components/PageHeading";
import { ScreenProps } from "./types";

export default function RegionSelectorScreen({ navigation }: ScreenProps<"RegionSelector">) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView style={{ flex: 1, paddingTop: insets.top }} intensity={50} tint="dark">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.1)" }}>
        <PageHeading title="Select Region" onPress={() => navigation.goBack()} />
        <View style={{ flex: 1 }}>
          <ChooseRegion
            showAsSelector={true}
            onBack={() => navigation.goBack()}
            onRegionSelect={(region) => {
              console.log("Selected region:", region);
              navigation.goBack();
            }}
          />
        </View>
      </View>
    </BlurView>
  );
}
