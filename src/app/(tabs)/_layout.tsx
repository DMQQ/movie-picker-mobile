import { Icon, Label, NativeTabs, VectorIcon } from "expo-router/unstable-native-tabs";
import useTranslation from "../../service/useTranslation";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { MD2DarkTheme } from "react-native-paper";

export default function TabLayout() {
  const t = useTranslation();
  return (
    <NativeTabs
      backgroundColor={"#000"}
      blurEffect="dark"
      backBehavior="none"
      minimizeBehavior="onScrollDown"
      shadowColor={"rgba(0,0,0,0.25)"}
      iconColor={MD2DarkTheme.colors.primary}
      indicatorColor={MD2DarkTheme.colors.primary}
      tintColor={MD2DarkTheme.colors.primary}
    >
      <NativeTabs.Trigger
        name="favourites"
        options={{
          title: "Favourites",
        }}
      >
        <Icon
          {...(Platform.OS === "android"
            ? { src: <VectorIcon family={MaterialCommunityIcons} name="bookmark" />, selectedColor: "#000" }
            : { sf: "bookmark" })}
        />
        <Label>{t("tabBar.favourites")}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="discover"
        options={{
          title: "Home",
        }}
      >
        <Icon
          {...(Platform.OS === "android"
            ? { src: <VectorIcon family={MaterialCommunityIcons} name="movie-check" />, selectedColor: "#000" }
            : { sf: "movieclapper" })}
        />
        <Label>{t("tabBar.explore")}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="index"
        options={{
          title: "Games",
        }}
      >
        <Icon
          {...(Platform.OS === "android"
            ? { src: <VectorIcon family={MaterialCommunityIcons} name="gamepad-variant" />, selectedColor: "#000" }
            : { sf: "gamecontroller" })}
        />
        <Label>{t("tabBar.games")}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <Icon
          {...(Platform.OS === "android"
            ? { src: <VectorIcon family={MaterialCommunityIcons} name="magnify" />, selectedColor: "#000" }
            : { sf: "magnifyingglass" })}
        />
        <Label>{t("tabBar.search")}</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="settings"
        options={{
          title: "Settings",
        }}
      >
        <Icon
          {...(Platform.OS === "android"
            ? { src: <VectorIcon family={FontAwesome} name="gear" />, selectedColor: "#000" }
            : { sf: "gear" })}
        />
        <Label>{t("tabBar.join-game")}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
