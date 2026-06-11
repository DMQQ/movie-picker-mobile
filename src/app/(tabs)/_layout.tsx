import { NativeTabs } from "expo-router/unstable-native-tabs";
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
  return (Platform.OS === "ios" && isLiquidGlassSupported) ||
    Platform.OS === "android" ? (
    <TabLayout />
  ) : (
    <Pre26IosLayout />
  );
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
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bookmark" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: t("tabBar.explore"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="movie-check"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabBar.games"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="gamepad-variant"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t("tabBar.search"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabBar.settings"),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="gear" color={color} size={size} />
          ),
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
      shadowColor={"rgba(0,0,0,0.25)"}
      iconColor={MD2DarkTheme.colors.primary}
      indicatorColor={MD2DarkTheme.colors.primary}
      tintColor={MD2DarkTheme.colors.primary}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          selectedColor={"#000"}
          sf="gamecontroller"
          md="sports_esports"
        />
        <NativeTabs.Trigger.Label hidden={Platform.OS === "ios"}>
          {t("tabBar.games")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="discover">
        <NativeTabs.Trigger.Icon
          selectedColor={"#000"}
          sf="movieclapper"
          md="movie"
        />
        <NativeTabs.Trigger.Label hidden={Platform.OS === "ios"}>
          {t("tabBar.explore")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="favourites">
        <NativeTabs.Trigger.Icon
          selectedColor={"#000"}
          sf="bookmark"
          md="bookmarks"
        />
        <NativeTabs.Trigger.Label hidden={Platform.OS === "ios"}>
          {t("tabBar.favourites")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Icon
          selectedColor={"#000"}
          sf="magnifyingglass"
          md="search"
        />
        <NativeTabs.Trigger.Label hidden={Platform.OS === "ios"}>
          {t("tabBar.search")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon
          selectedColor={"#000"}
          sf="gear"
          md="settings"
        />
        <NativeTabs.Trigger.Label hidden={Platform.OS === "ios"}>
          {t("tabBar.settings")}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
