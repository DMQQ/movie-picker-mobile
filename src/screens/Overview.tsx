import { Dimensions, Image, View } from "react-native";
import { Text, useTheme, TouchableRipple } from "react-native-paper";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useAppSelector } from "../redux/store";
import Animated, { FadeIn, useAnimatedStyle } from "react-native-reanimated";
import { memo } from "react";

const Matches = ({ route, navigation }: any) => {
  const {
    room: { matches, type },
  } = useAppSelector((state) => state.room);

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Animated.FlatList
        contentContainerStyle={{ paddingTop: 10 }}
        data={matches}
        keyExtractor={(match) => match.id.toString()}
        renderItem={({ item: match, index }) => (
          <AnimatedMatchCard
            match={match}
            type={type}
            navigation={navigation}
            index={index}
          />
        )}
      />
    </View>
  );
};

const AnimatedMatchCard = ({
  match,
  type,
  navigation,
  index,
}: {
  match: any;
  type: string;
  navigation: any;
  index: number;
}) => {
  return (
    <TouchableRipple
      style={{ marginBottom: 15 }}
      onPress={() =>
        navigation.navigate("MovieDetails", {
          id: match.id,
          type: type,
        })
      }
    >
      <Image
        resizeMode="cover"
        source={{
          uri: "https://image.tmdb.org/t/p/w500" + match.poster_path,
        }}
        style={{ width: "100%", height: 250, borderRadius: 10 }}
      />
    </TouchableRipple>
  );
};

const YourLikes = () => {
  return (
    <View>
      <Text>Likes</Text>
    </View>
  );
};

const FriendsLikes = () => {
  return (
    <View>
      <Text>Friends</Text>
    </View>
  );
};

const OverviewTopTabs = createMaterialTopTabNavigator();

function Overview({ route, navigation }: any) {
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
      <OverviewTopTabs.Screen name="Matches" component={Matches} />
      <OverviewTopTabs.Screen
        options={{
          tabBarLabel: "Likes",
        }}
        name="YourLikes"
        component={YourLikes}
      />
      <OverviewTopTabs.Screen
        options={{
          tabBarLabel: "Friends",
        }}
        name="FriendsLikes"
        component={FriendsLikes}
      />
    </OverviewTopTabs.Navigator>
  );
}

export default memo(Overview);
