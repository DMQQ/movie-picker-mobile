import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MD2DarkTheme } from "react-native-paper";
import useTranslation from "../../service/useTranslation";

export default function TabLayout() {
  const t = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#111",
          borderTopColor: "rgba(255,255,255,0.1)",
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarActiveTintColor: MD2DarkTheme.colors.primary,
        tabBarInactiveTintColor: "rgba(255,255,255,0.5)",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="qr-scanner"
        options={{
          title: t("tabBar.join-game"),
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="qrcode-scan" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabBar.explore"),
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="movie-check" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: t("tabBar.games"),
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="gamepad-variant" size={size} color={color} />,
        }}
      />
      {/* Hidden tabs */}
      <Tabs.Screen name="favourites" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
    </Tabs>
  );
}
