import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation } from "@react-navigation/native";
import React, { memo, useEffect } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import useTranslation from "../service/useTranslation";
import LikesScreen from "./Overview/Likes";
import MatchesScreen from "./Overview/Matches";

const OverviewTopTabs = createMaterialTopTabNavigator();

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  position?: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  const theme = useTheme();
  const backNavigation = useNavigation();

  const BACK_BUTTON_WIDTH = 56;
  const TAB_HEIGHT = 36;
  const TAB_BORDER_RADIUS = 18;
  const TAB_SPACING = 8;

  const screenWidth = Dimensions.get("window").width;
  const tabContainerWidth = screenWidth - BACK_BUTTON_WIDTH - 32; // 32 for padding
  const tabWidth = (tabContainerWidth - TAB_SPACING * (state.routes.length - 1)) / state.routes.length;

  const getIndicatorPosition = (tabIndex: number): number => {
    return tabIndex * (tabWidth + TAB_SPACING);
  };

  const indicatorPosition = useSharedValue(getIndicatorPosition(state.index));
  const tabScale = useSharedValue(1);

  useEffect(() => {
    const newIndex = state.index;

    indicatorPosition.value = withSpring(getIndicatorPosition(newIndex), {
      damping: 20,
      stiffness: 150,
    });

    tabScale.value = withSequence(withTiming(0.95, { duration: 100 }), withTiming(1, { duration: 150 }));
  }, [state.index, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
    width: tabWidth,
  }));

  const getTabAnimatedStyle = (isActive: boolean) => {
    return useAnimatedStyle(() => {
      const scale = isActive ? tabScale.value : 1;
      return {
        transform: [{ scale }],
      };
    });
  };

  return (
    <View style={[styles.tabBarContainer, { backgroundColor: "#000" }]}>
      <View style={[styles.backButtonContainer, { width: BACK_BUTTON_WIDTH }]}>
        <IconButton icon="chevron-left" onPress={() => backNavigation.goBack()} size={28} iconColor={"#fff"} />
      </View>

      <View style={[styles.tabsContainer, { width: tabContainerWidth }]}>
        <Animated.View
          style={[
            styles.backgroundIndicator,
            {
              backgroundColor: `${theme.colors.primary}20`, // 20% opacity
              borderColor: `${theme.colors.primary}40`, // 40% opacity
              height: TAB_HEIGHT,
              borderRadius: TAB_BORDER_RADIUS,
            },
            indicatorStyle,
          ]}
        />

        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label: string = options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;
          const isFocused: boolean = state.index === index;

          const onPress = (): void => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Animated.View
              key={route.key}
              style={[
                getTabAnimatedStyle(isFocused),
                {
                  width: tabWidth,
                  marginRight: index < state.routes.length - 1 ? TAB_SPACING : 0,
                },
              ]}
            >
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={[
                  styles.tab,
                  {
                    height: TAB_HEIGHT,
                    borderRadius: TAB_BORDER_RADIUS,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isFocused ? theme.colors.primary : "rgba(255, 255, 255, 0.7)",
                      fontWeight: isFocused ? "600" : "400",
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const Overview: React.FC = () => {
  const t = useTranslation();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={28} />,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <OverviewTopTabs.Navigator
        initialLayout={{ width: Dimensions.get("window").width, height: Dimensions.get("screen").height }}
        initialRouteName="Matches"
        tabBar={(props) => <CustomTabBar {...props} />}
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
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 0,
    paddingHorizontal: 8,
  },
  backButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    position: "relative",
    alignItems: "center",
  },
  backgroundIndicator: {
    position: "absolute",
    top: 0,
    borderWidth: 1,
    zIndex: 0,
  },
  tab: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    paddingHorizontal: 12,
  },
  tabLabel: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default memo(Overview);
