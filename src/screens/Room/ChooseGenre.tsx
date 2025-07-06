import { FlatList, StyleSheet, View, useWindowDimensions, Dimensions } from "react-native";
import { Appbar, Button, IconButton, Text, TouchableRipple, useTheme, Card } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useCreateRoom } from "./ContextProvider";
import useFetch from "../../service/useFetch";
import Skeleton from "../../components/Skeleton/Skeleton";
import Animated, { FadeIn } from "react-native-reanimated";
import { useGetGenresQuery } from "../../redux/movie/movieApi";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import useTranslation from "../../service/useTranslation";
import PageHeading from "../../components/PageHeading";
import { getConstrainedDimensions } from "../../utils/getConstrainedDimensions";

const { width } = getConstrainedDimensions("window");
const cardWidth = (width - 60) / 3;

const ListEmptyComponent = () => {
  const { width } = useWindowDimensions();
  return (
    <Skeleton>
      <View style={{ width: width - 30, height: 60 * 10, flexDirection: "row", flexWrap: "wrap" }}>
        {Array.from(new Array(12).keys()).map((i) => (
          <View key={i} style={[styles.placeholder, { width: cardWidth, marginRight: i % 3 === 2 ? 0 : 15 }]} />
        ))}
      </View>
    </Skeleton>
  );
};

export default function ChooseGenre({ navigation }: any) {
  const { category, genre, setGenre: selectGenre } = useCreateRoom();
  const { data: genres = [], isLoading: loading } = useGetGenresQuery({
    type: category.includes("tv") ? "tv" : "movie",
  });

  const t = useTranslation();

  return (
    <SafeIOSContainer>
      <PageHeading title={t("room.genre")} />
      <Text style={{ padding: 10, color: "gray", marginBottom: 15, fontSize: 16 }}>{t("room.genre_desc")}</Text>

      <View style={{ flex: 1, paddingHorizontal: 15 }}>
        <View style={{ flex: 1 }}>
          {loading ? (
            <ListEmptyComponent />
          ) : (
            <FlatList
              initialNumToRender={12}
              style={{ flex: 1, paddingBottom: 25 }}
              data={genres as { id: number; name: string }[]}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <GenreTile index={index} item={item} isIncluded={genre.some((g) => g.id === item.id)} selectGenre={selectGenre} />
              )}
            />
          )}
        </View>

        <View>
          <Button
            mode="contained"
            style={{
              borderRadius: 100,
              marginTop: 10,
            }}
            contentStyle={{ padding: 7.5 }}
            onPress={() => navigation.navigate("ExtraSettings")}
          >
            {t("room.next")}
          </Button>
        </View>
      </View>
    </SafeIOSContainer>
  );
}

const getGenreIcon = (genreId: number, isSelected: boolean, theme: any) => {
  const iconMap: { [key: number]: { component: any; name: string; color: string } } = {
    28: { component: FontAwesome5, name: "fist-raised", color: "#FF6B35" }, // Action - Raised Fist
    10759: { component: FontAwesome5, name: "running", color: "#FF6B35" }, // Action & Adventure - Running
    12: { component: FontAwesome5, name: "hiking", color: "#4ECDC4" }, // Adventure - Hiking
    16: { component: FontAwesome5, name: "film", color: "#FFD23F" }, // Animation - Film Strip
    35: { component: FontAwesome5, name: "smile-beam", color: "#FF8C69" }, // Comedy - Laugh
    80: { component: FontAwesome5, name: "fingerprint", color: "#8B4513" }, // Crime - Fingerprint
    99: { component: FontAwesome5, name: "newspaper", color: "#708090" }, // Documentary - Newspaper
    18: { component: FontAwesome5, name: "sad-cry", color: "#9370DB" }, // Drama - Crying Face
    10751: { component: FontAwesome5, name: "baby", color: "#32CD32" }, // Family - Baby
    10762: { component: FontAwesome5, name: "child", color: "#FFB6C1" }, // Kids - Child
    14: { component: FontAwesome5, name: "dragon", color: "#DA70D6" }, // Fantasy - Dragon
    36: { component: FontAwesome5, name: "hourglass", color: "#CD853F" }, // History - Hourglass
    27: { component: FontAwesome5, name: "spider", color: "#2F4F4F" }, // Horror - Spider
    10402: { component: FontAwesome5, name: "guitar", color: "#FF1493" }, // Music - Guitar
    9648: { component: FontAwesome5, name: "key", color: "#4682B4" }, // Mystery - Key
    10763: { component: FontAwesome5, name: "bullhorn", color: "#FF4500" }, // News - Bullhorn
    10749: { component: FontAwesome5, name: "ring", color: "#FF69B4" }, // Romance - Ring
    10764: { component: FontAwesome5, name: "camera", color: "#20B2AA" }, // Reality - Camera
    10765: { component: FontAwesome5, name: "rocket", color: "#00CED1" }, // Sci-Fi & Fantasy - Rocket
    878: { component: FontAwesome5, name: "robot", color: "#00CED1" }, // Science Fiction - Robot
    10766: { component: FontAwesome5, name: "heart-broken", color: "#DDA0DD" }, // Soap - Broken Heart
    10767: { component: FontAwesome5, name: "microphone", color: "#FFA07A" }, // Talk - Microphone
    10770: { component: FontAwesome5, name: "video", color: "#6495ED" }, // TV Movie - Video Camera
    53: { component: FontAwesome5, name: "eye", color: "#FFD700" }, // Thriller - Eye
    10752: { component: FontAwesome5, name: "shield-alt", color: "#696969" }, // War - Shield
    10768: { component: FontAwesome5, name: "balance-scale", color: "#696969" }, // War & Politics - Balance Scale
    37: { component: FontAwesome5, name: "horse", color: "#D2691E" }, // Western - Horse
  };

  const iconData = iconMap[genreId] || { component: MaterialIcons, name: "local-offer", color: "#808080" };

  return {
    component: iconData.component,
    name: iconData.name,
    color: isSelected ? theme.colors.onPrimary : iconData.color,
  };
};

const GenreTile = ({
  item,
  isIncluded,
  selectGenre,
  index,
}: {
  item: { id: number; name: string };
  isIncluded: boolean;
  selectGenre: (val: any) => void;
  index: number;
}) => {
  const theme = useTheme();
  const iconData = getGenreIcon(item.id, isIncluded, theme);
  const IconComponent = iconData.component;

  const onTilePress = () => {
    if (isIncluded) {
      selectGenre((val: (typeof item)[]) => val.filter((g: any) => g.id !== item.id));
    } else {
      selectGenre((val: (typeof item)[]) => [...val, item]);
    }
  };

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50)}
      style={{ width: cardWidth, marginRight: index % 3 === 2 ? 0 : 15, marginBottom: 15 }}
    >
      <Card
        style={{
          backgroundColor: isIncluded ? theme.colors.primary : theme.colors.surface,
          borderRadius: 15,
          borderWidth: isIncluded ? 0 : 1,
          borderColor: theme.colors.outline,
          paddingTop: 5,
        }}
        onPress={onTilePress}
      >
        <View style={styles.cardContent}>
          <View style={styles.genreIconContainer}>
            <IconComponent name={iconData.name} size={35} color={iconData.color} />
          </View>

          <View style={styles.textContainer}>
            <Text
              style={[
                styles.genreText,
                {
                  color: isIncluded ? theme.colors.onPrimary : theme.colors.onSurface,
                },
              ]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContent: {
    padding: 16,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  genreIconContainer: {
    alignItems: "center",
    marginBottom: 6,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  genreText: {
    fontWeight: "700",
    fontFamily: "Bebas",
    textAlign: "center",
    fontSize: 18,
  },
  placeholder: {
    aspectRatio: 1,
    backgroundColor: "#000",
    marginBottom: 15,
    borderRadius: 15,
  },
});
