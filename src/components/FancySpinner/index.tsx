import { Platform } from "react-native";

export const FancySpinner = Platform.OS === "ios" ? require("./IOS").FancySpinner : require("./Android").FancySpinner;
