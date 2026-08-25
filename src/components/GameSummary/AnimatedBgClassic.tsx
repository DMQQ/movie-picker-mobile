import { memo, useEffect, useRef, useState } from "react";
import { Animated, ImageBackground, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Movie } from "../../../types";

export default memo(function AnimatedBgClassic({ matchedMovies }: { matchedMovies: Partial<Movie>[] }) {
  const [indexA, setIndexA] = useState(0);
  const [indexB, setIndexB] = useState(1);
  const [activeLayer, setActiveLayer] = useState<"A" | "B">("A");
  const opacityA = useRef(new Animated.Value(1)).current;
  const opacityB = useRef(new Animated.Value(0)).current;
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      opacityA.stopAnimation();
      opacityB.stopAnimation();
    };
  }, [opacityA, opacityB]);

  useEffect(() => {
    if (!matchedMovies || matchedMovies.length <= 1) return;

    const interval = setInterval(() => {
      if (activeLayer === "A") {
        setIndexB((indexA + 1) % matchedMovies.length);
        Animated.parallel([
          Animated.timing(opacityA, { toValue: 0, duration: 1000, useNativeDriver: true }),
          Animated.timing(opacityB, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]).start(() => { if (isMounted.current) setActiveLayer("B"); });
      } else {
        setIndexA((indexB + 1) % matchedMovies.length);
        Animated.parallel([
          Animated.timing(opacityB, { toValue: 0, duration: 1000, useNativeDriver: true }),
          Animated.timing(opacityA, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]).start(() => { if (isMounted.current) setActiveLayer("A"); });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [matchedMovies, activeLayer, indexA, indexB, opacityA, opacityB]);

  const uriA = matchedMovies?.[indexA]?.poster_path
    ? `https://image.tmdb.org/t/p/w300${matchedMovies[indexA].poster_path}`
    : null;
  const uriB = matchedMovies?.[indexB]?.poster_path
    ? `https://image.tmdb.org/t/p/w300${matchedMovies[indexB].poster_path}`
    : null;

  if (!uriA && !uriB) return null;

  return (
    <>
      {uriA && (
        <Animated.View style={[styles.layer, { opacity: opacityA }]} pointerEvents="none">
          <ImageBackground source={{ uri: uriA }} style={styles.image} blurRadius={8}>
            <BlurView intensity={15} style={styles.blur} />
          </ImageBackground>
        </Animated.View>
      )}
      {uriB && (
        <Animated.View style={[styles.layer, { opacity: opacityB }]} pointerEvents="none">
          <ImageBackground source={{ uri: uriB }} style={styles.image} blurRadius={8}>
            <BlurView intensity={15} style={styles.blur} />
          </ImageBackground>
        </Animated.View>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  layer: { position: "absolute", top: 0, left: 0, right: 0, bottom: -50 },
  image: { position: "absolute", top: 0, left: 0, right: 0, bottom: -50, opacity: 0.3 },
  blur: { position: "absolute", top: -50, left: 0, right: 0, bottom: -50, backgroundColor: "rgba(0,0,0,0.4)" },
});
