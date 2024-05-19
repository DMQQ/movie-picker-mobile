import { Dimensions } from "react-native";
import { useTheme } from "react-native-paper";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { memo } from "react";
import MatchesScreen from "./Overview/Matches";
import LikesScreen from "./Overview/Likes";

const OverviewTopTabs = createMaterialTopTabNavigator();

function Overview() {
  const theme = useTheme();

  return (
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
      <OverviewTopTabs.Screen name="Matches" component={MatchesScreen} />
      <OverviewTopTabs.Screen
        options={{
          tabBarLabel: "Likes",
        }}
        name="YourLikes"
        component={LikesScreen}
      />
    </OverviewTopTabs.Navigator>
  );
}

export default memo(Overview);
