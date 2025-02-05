import { Dimensions } from "react-native";
import { ThemeProvider, useTheme } from "react-native-paper";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { memo } from "react";
import MatchesScreen from "./Overview/Matches";
import LikesScreen from "./Overview/Likes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafeIOSContainer from "../components/SafeIOSContainer";
import { StatusBar } from "expo-status-bar";
import useTranslation from "../service/useTranslation";

const OverviewTopTabs = createMaterialTopTabNavigator();

function Overview() {
  const theme = useTheme();

  const insets = useSafeAreaInsets();

  const t = useTranslation();

  return (
    <SafeIOSContainer>
      <StatusBar translucent={false} backgroundColor={theme.colors.primary} />
      <OverviewTopTabs.Navigator
        initialLayout={{ width: Dimensions.get("window").width }}
        initialRouteName="Matches"
        screenOptions={{
          tabBarLabelStyle: {
            fontSize: 14,
            color: theme.colors.primary,
          },
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            paddingVertical: 5,
          },

          tabBarActiveTintColor: theme.colors.primary,

          tabBarIndicatorStyle: {
            backgroundColor: theme.colors.primary,
          },
        }}
      >
        <OverviewTopTabs.Screen name={t("overview.matches")} component={MatchesScreen} />
        <OverviewTopTabs.Screen
          options={{
            tabBarLabel: t("overview.likes"),
          }}
          name="YourLikes"
          component={LikesScreen}
        />
      </OverviewTopTabs.Navigator>
    </SafeIOSContainer>
  );
}

export default memo(Overview);
