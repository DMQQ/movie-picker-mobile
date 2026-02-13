import { Icon, Label, NativeTabs, VectorIcon } from "expo-router/unstable-native-tabs";
import useTranslation from "../../service/useTranslation";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { MD2DarkTheme } from "react-native-paper";

import { Tabs } from "expo-router/tabs";
import { isLiquidGlassSupported } from "@callstack/liquid-glass";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function Layout() {
  return (Platform.OS === "ios" && isLiquidGlassSupported) || Platform.OS === "android" ? <TabLayout /> : <Pre26IosLayout />;
}

function Pre26IosLayout() {
  const t = useTranslation();
  const primaryColor = MD2DarkTheme.colors.primary;

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: "#ffffffc2",
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopColor: "rgba(0,0,0,0.25)",
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="favourites"
        options={{
          title: t("tabBar.favourites"),
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="bookmark" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: t("tabBar.explore"),
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="movie-check" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabBar.games"),
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="gamepad-variant" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t("tabBar.search"),
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="magnify" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabBar.settings"),
          tabBarIcon: ({ color, size }) => <FontAwesome name="gear" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

function TabLayout() {
  const t = useTranslation();
  return (
    <NativeTabs
      backgroundColor={"#000"}
      blurEffect="dark"
      backBehavior="none"
      disableTransparentOnScrollEdge
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
        <Label>{t("tabBar.settings")}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
