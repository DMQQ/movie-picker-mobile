import {
  Dimensions,
  FlatList,
  Image,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Text,
  useTheme,
  Card,
  Button,
  TouchableRipple,
} from "react-native-paper";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useAppSelector } from "../redux/store";
import Animated, { FadeIn, useAnimatedStyle } from "react-native-reanimated";

const Matches = ({ route, navigation }: any) => {
  const {
    room: { matches, type },
  } = useAppSelector((state) => state.room);
  const theme = useTheme();

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Animated.FlatList
        contentContainerStyle={{ paddingTop: 10 }}
        data={matches}
        inverted={matches.length > 1}
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
    <Card
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
      <Card.Title title={match.title || match.name} />
    </Card>
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

export default function Overview({ route, navigation }: any) {
  const theme = useTheme();

  return (
    <OverviewTopTabs.Navigator
      initialRouteName="Matches"
      overdrag
      tabBarPosition="top"
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
          title: "Likes",
        }}
        name="YourLikes"
        component={YourLikes}
      />
      <OverviewTopTabs.Screen
        options={{
          title: "Friends",
        }}
        name="FriendsLikes"
        component={FriendsLikes}
      />
    </OverviewTopTabs.Navigator>
  );
}
