import { Dimensions, Image, View } from "react-native";
import { Text, useTheme, TouchableRipple, Button } from "react-native-paper";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useAppSelector } from "../redux/store";
import Animated from "react-native-reanimated";
import { memo, useState } from "react";
import { Movie } from "../../types";
import MatchModal from "../components/Movie/MatchModal";

const Matches = ({ route, navigation }: any) => {
  const {
    room: { matches, type },
  } = useAppSelector((state) => state.room);

  const [match, setMatch] = useState<Movie | undefined>(undefined);

  const randomMovie = () => {
    setMatch(matches[Math.floor(Math.random() * matches.length)]);
  };

  return (
    <View style={{ flex: 1, padding: 15, position: "relative" }}>
      <Animated.FlatList
        style={{ marginBottom: 50 }}
        ListHeaderComponent={
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ fontSize: 20, marginBottom: 15, fontWeight: "400" }}>
              Matched with your friends
            </Text>
            <Text style={{ fontSize: 20, marginBottom: 15, fontWeight: "400" }}>
              ({matches.length})
            </Text>
          </View>
        }
        data={matches}
        keyExtractor={(match) => match.id.toString()}
        renderItem={({ item: match, index }) => (
          <AnimatedCard
            match={match}
            type={type}
            navigation={navigation}
            index={index}
          />
        )}
      />

      {match && (
        <MatchModal match={match} hideMatchModal={() => setMatch(undefined)} />
      )}

      <Button
        onPress={randomMovie}
        mode="contained"
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          right: 10,
          width: "100%",
          borderRadius: 100,
        }}
        contentStyle={{ padding: 7.5 }}
      >
        Randomize
      </Button>
    </View>
  );
};

const AnimatedCard = ({
  match,
  type,
  navigation,
  index,
}: {
  match: Movie;
  type: string;
  navigation: any;
  index: number;
}) => {
  return (
    <TouchableRipple
      style={{ marginBottom: 15, flexDirection: "row" }}
      onPress={() =>
        navigation.navigate("MovieDetails", {
          id: match.id,
          type: type,
          img: match.poster_path,
        })
      }
    >
      <>
        <Image
          resizeMode="cover"
          source={{
            uri: "https://image.tmdb.org/t/p/w500" + match.poster_path,
          }}
          style={{ width: "25%", height: 100, borderRadius: 10 }}
        />

        <View style={{ gap: 5 }}>
          <Text
            lineBreakMode="clip"
            textBreakStrategy="simple"
            style={{
              marginLeft: 10,
              fontSize: 17,
              fontWeight: "500",
              color: "#fff",
              flexWrap: "wrap",
            }}
          >
            {match.title || match.name || match.original_title}
          </Text>

          <Text
            style={{
              marginLeft: 10,
              fontSize: 17,
              fontWeight: "500",
              color: "#fff",
            }}
          >
            {match.release_date || match.first_air_date}
          </Text>

          <Text
            style={{
              marginLeft: 10,
              fontSize: 17,
              fontWeight: "500",
              color: "#fff",
            }}
          >
            {match.vote_average.toFixed(1)}/10
          </Text>
        </View>
      </>
    </TouchableRipple>
  );
};

const YourLikes = ({ navigation }: any) => {
  const { likes } = useAppSelector((state) => state.room.room);

  const [match, setMatch] = useState<Movie | undefined>(undefined);

  const randomMovie = () => {
    setMatch(likes[Math.floor(Math.random() * likes.length)]);
  };

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Animated.FlatList
        style={{ marginBottom: 50 }}
        ListHeaderComponent={
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ fontSize: 20, marginBottom: 15, fontWeight: "400" }}>
              Your Likes
            </Text>
            <Text style={{ fontSize: 20, marginBottom: 15, fontWeight: "400" }}>
              ({likes.length})
            </Text>
          </View>
        }
        data={likes}
        keyExtractor={(match) => match.id.toString()}
        renderItem={({ item: match, index }) => (
          <AnimatedCard
            match={match}
            type={""}
            navigation={navigation}
            index={index}
          />
        )}
      />

      {match && (
        <MatchModal match={match} hideMatchModal={() => setMatch(undefined)} />
      )}

      <Button
        onPress={randomMovie}
        mode="contained"
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          right: 10,
          width: "100%",
          borderRadius: 100,
        }}
        contentStyle={{ padding: 7.5 }}
      >
        Randomize
      </Button>
    </View>
  );
};

const FriendsLikes = () => {
  return (
    <View>
      <Text>Friends Likes</Text>
    </View>
  );
};

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
      <OverviewTopTabs.Screen name="Matches" component={Matches} />
      <OverviewTopTabs.Screen
        options={{
          tabBarLabel: "Likes",
        }}
        name="YourLikes"
        component={YourLikes}
      />
      {/* <OverviewTopTabs.Screen
        options={{
          tabBarLabel: "Friends",
        }}
        name="FriendsLikes"
        component={FriendsLikes}
      /> */}
    </OverviewTopTabs.Navigator>
  );
}

export default memo(Overview);
