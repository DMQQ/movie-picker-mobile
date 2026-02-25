import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import useTranslation from "../service/useTranslation";

interface FateTextProps {
  intervalMs?: number;
}

export default function FateText({ intervalMs = 2000 }: FateTextProps) {
  const t = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const messages = t("fortune-wheel.fate-messages") as unknown as string[];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [messages.length, intervalMs]);

  return (
    <Animated.View key={currentIndex} entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} style={styles.container}>
      <Text style={styles.text}>{messages[currentIndex]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 40,
    fontFamily: "Bebas",
    textAlign: "center",
    color: "#fff",
  },
});
