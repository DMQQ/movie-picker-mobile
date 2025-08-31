import { BlurView } from "expo-blur";
import { Platform, View } from "react-native";

const PlatformBlurView = Platform.OS === "android" ? View : BlurView;

export default PlatformBlurView;
