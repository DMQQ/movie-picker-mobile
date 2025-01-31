import { Platform } from "react-native";

export const FancySpinner = Platform.OS === "android" ? require("./Android").FancySpinner : require("./IOS").FancySpinner;
