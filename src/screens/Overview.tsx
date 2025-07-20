import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation } from "@react-navigation/native";
import { memo, useEffect } from "react";
import { Dimensions, SafeAreaView } from "react-native";
import { IconButton, useTheme } from "react-native-paper";
import useTranslation from "../service/useTranslation";
import LikesScreen from "./Overview/Likes";
import MatchesScreen from "./Overview/Matches";

const OverviewTopTabs = createMaterialTopTabNavigator();

function Overview() {
  const theme = useTheme();

  const t = useTranslation();

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={28} />,
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
    </SafeAreaView>
  );
}

export default memo(Overview);
