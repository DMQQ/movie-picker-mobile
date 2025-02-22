import { Dimensions, Platform } from "react-native";
import { ThemeProvider, useTheme } from "react-native-paper";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { memo, useEffect } from "react";
import MatchesScreen from "./Overview/Matches";
import LikesScreen from "./Overview/Likes";
import useTranslation from "../service/useTranslation";

const OverviewTopTabs = createMaterialTopTabNavigator();

function Overview() {
  const theme = useTheme();

  const t = useTranslation();

  return (
    <>
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
        <OverviewTopTabs.Screen
          name="Matches"
          component={MatchesScreen}
          options={{
            tabBarLabel: t("overview.matches"),
          }}
        />
        <OverviewTopTabs.Screen
          options={{
            tabBarLabel: t("overview.likes"),
          }}
          name="YourLikes"
          component={LikesScreen}
        />
      </OverviewTopTabs.Navigator>
    </>
  );
}

export default memo(Overview);
