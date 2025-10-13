import * as Haptics from "expo-haptics";
import { useCallback, useMemo, useState } from "react";
import { Dimensions, Platform, StyleSheet, View, Share, Linking, TouchableOpacity } from "react-native";
import { IconButton, Text } from "react-native-paper";
import Animated, { useAnimatedStyle, withTiming, SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Movie } from "../../types";
import PlatformBlurView, { BlurViewWrapper } from "./PlatformBlurView";
import { useGetTrailersQuery } from "../redux/movie/movieApi";
import { useNavigation } from "@react-navigation/native";

const { height } = Dimensions.get("screen");
const IMG_HEIGHT = height * 0.75;

interface FloatingMovieBottomActionsProps {
  movie: Movie;
  scrollY: SharedValue<number>;
  movieId: number;
  typeOfContent: string;
  providers: any[];
}

export default function FloatingMovieBottomActions({ movie, scrollY, movieId, typeOfContent, providers }: FloatingMovieBottomActionsProps) {
  const navigation = useNavigation<any>();
  const [showTrailers, setShowTrailers] = useState(false);

  const { data: trailers } = useGetTrailersQuery({ id: movieId, type: typeOfContent });

  const filteredTrailers = useMemo(() => {
    return trailers?.filter((v) => v.site === "YouTube" && v.official) || [];
  }, [trailers]);

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!movie) return;

    try {
      const title = movie.title || movie.name;
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "";
      const shareText = `Check out "${title}"${year ? ` (${year})` : ""}!`;

      await Share.share({
        message: shareText,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  }, [movie]);

  const handleTrailersPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTrailers(!showTrailers);
  }, [showTrailers]);

  const handleSmartSearchPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Extract genres
    const genres = movie.genres?.map((g: any) => g.id) || [];
    
    // Extract streaming providers from nested structure
    let watchProviders: number[] = [];
    if (providers && typeof providers === 'object') {
      const allProviders: any[] = [];
      
      // Collect providers from all categories
      (['flatrate', 'rent', 'buy', 'free', 'ads'] as const).forEach(category => {
        if (Array.isArray((providers as any)[category])) {
          allProviders.push(...(providers as any)[category]);
        }
      });
      
      // Extract unique provider IDs
      const uniqueProviderIds = new Set(
        allProviders
          .filter((p: any) => p.provider_id)
          .map((p: any) => p.provider_id)
      );
      
      watchProviders = Array.from(uniqueProviderIds);
    }
    
    // Create search query based on genres (no initial query text for discovery)
    const genreNames = movie.genres?.slice(0, 2).map((g: any) => g.name).join(' & ') || '';
    
    // If we have filters, use discovery mode (empty search), otherwise search by genre names
    let searchQuery = '';
    if (genres.length === 0 && watchProviders.length === 0) {
      // Fallback to genre-based text search if no filters available
      searchQuery = genreNames || typeOfContent === 'movie' ? 'action' : 'drama';
    }
    
    navigation.navigate("Search", {
      initialQuery: searchQuery,
      genres: genres.length > 0 ? genres : undefined,
      providers: watchProviders.length > 0 ? watchProviders : undefined,
      type: typeOfContent
    });
  }, [navigation, movie, typeOfContent, providers]);

  const threshold = useMemo(() => IMG_HEIGHT * 0.9, []);

  const containerOpacity = useAnimatedStyle(() => {
    const isVisible = scrollY.value > threshold;
    return {
      opacity: isVisible ? withTiming(1, { duration: 250 }) : withTiming(0, { duration: 150 }),
      transform: [
        {
          translateY: isVisible ? withTiming(0, { duration: 250 }) : withTiming(50, { duration: 150 }),
        },
      ],
    };
  });

  const backgroundOpacity = useAnimatedStyle(() => {
    const isVisible = scrollY.value > threshold;
    return {
      opacity: isVisible ? withTiming(1, { duration: 250 }) : withTiming(0, { duration: 150 }),
    };
  });

  return (
    <Animated.View style={[styles.container, { paddingBottom: 15 }, containerOpacity]}>
      {Platform.OS === "ios" ? (
        <Animated.View style={[styles.backgroundContainer, backgroundOpacity]}>
          <BlurViewWrapper style={styles.iosBlurBackground} />
        </Animated.View>
      ) : (
        <Animated.View style={[styles.backgroundContainer, styles.androidBackground, backgroundOpacity]} />
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.smartSearchButton, Platform.OS === "android" && styles.androidButtonBackground]}
          onPress={handleSmartSearchPress}
          activeOpacity={0.8}
        >
          <PlatformBlurView style={styles.smartSearchBlur}>
            <View style={styles.smartSearchContent}>
              <Ionicons name="search" size={20} color="white" />
              <Text style={styles.searchButtonText} variant="bodySmall">
                Smart Search
              </Text>
            </View>
          </PlatformBlurView>
        </TouchableOpacity>

        <PlatformBlurView style={[styles.buttonGroup, Platform.OS === "android" && styles.androidButtonBackground]}>
          <IconButton icon={() => <Entypo name="youtube" size={24} color="#FF0000" />} size={30} onPress={handleTrailersPress} />
          <IconButton icon="share-variant" size={30} onPress={handleShare} iconColor="white" />
        </PlatformBlurView>
      </View>

      {showTrailers && filteredTrailers.length > 0 && (
        <Animated.View style={styles.trailersContainer}>
          <PlatformBlurView style={[styles.trailersBlur, Platform.OS === "android" && styles.androidButtonBackground]}>
            {filteredTrailers.slice(0, 3).map((trailer) => (
              <TouchableOpacity
                key={trailer.key}
                onPress={() => {
                  Linking.openURL(`https://www.youtube.com/watch?v=${trailer.key}`);
                }}
                style={styles.trailerButton}
                activeOpacity={0.8}
              >
                <Entypo name="youtube" size={16} color="#FF0000" />
                <Text variant="bodySmall" style={styles.trailerText} numberOfLines={1}>
                  {trailer.name || "Trailer"}
                </Text>
              </TouchableOpacity>
            ))}
          </PlatformBlurView>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 10,
    paddingHorizontal: 15,
    zIndex: 1000,
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  iosBlurBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderWidth: 0,
  },
  androidBackground: {
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 15,
  },
  buttonGroup: {
    flexDirection: "row",
    borderRadius: 100,
    overflow: "hidden",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  smartSearchButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  smartSearchBlur: {
    borderRadius: 25,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 6,
    minHeight: 48,
    justifyContent: "center",
  },
  smartSearchContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchButtonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  trailersContainer: {
    position: "absolute",
    bottom: 70,
    left: 15,
    right: 15,
  },
  trailersBlur: {
    borderRadius: 15,
    overflow: "hidden",
    paddingVertical: 8,
  },
  trailerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
  },
  trailerText: {
    color: "white",
    fontWeight: "bold",
    flex: 1,
  },
  androidButtonBackground: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});
