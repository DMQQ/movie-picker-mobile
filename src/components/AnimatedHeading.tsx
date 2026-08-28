import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import Text from "./Text";
import { colors } from "../constants/design";

const HERO_FONT = 50;
const HERO_LINE = 52;
const HERO_TRACKING = 2;
const MIN_HERO_SCALE = 0.5;

function AnimatedLine({
  text,
  delay,
  accent,
  scale,
  charDelay,
  centered,
}: {
  text: string;
  delay: number;
  accent: boolean;
  scale: number;
  charDelay: number;
  centered: boolean;
}) {
  const style = accent ? styles.heroAccent : styles.heroWhite;
  const sized = { fontSize: HERO_FONT * scale, lineHeight: HERO_LINE * scale };
  const words = text.split(" ");
  let charOffset = 0;

  return (
    <View style={[styles.heroLine, centered && styles.heroLineCentered]}>
      {words.map((word, wi) => {
        const wordEl = (
          <View key={wi} style={styles.heroWord}>
            {word.split("").map((char, i) => (
              <Animated.Text
                key={i}
                entering={FadeInUp.delay(delay + (charOffset + i) * charDelay).duration(300)}
                style={[style, sized]}
              >
                {char}
              </Animated.Text>
            ))}
            {wi < words.length - 1 && (
              <Animated.Text
                entering={FadeInUp.delay(delay + (charOffset + word.length) * charDelay).duration(300)}
                style={[style, sized]}
              >
                {" "}
              </Animated.Text>
            )}
          </View>
        );
        charOffset += word.length + 1;
        return wordEl;
      })}
    </View>
  );
}

export default function AnimatedHeading({ line1, line2, charDelay = 35, centered = false }: { line1: string; line2?: string; charDelay?: number; centered?: boolean }) {
  const [fontScale, setFontScale] = useState(1);
  const blockWidth = useRef(0);
  const textWidths = useRef([0, 0]);

  const fit = () => {
    const avail = blockWidth.current;
    const lines = line2 ? [line1, line2] : [line1];
    if (avail <= 0 || lines.some((_, i) => textWidths.current[i] <= 0)) return;
    const scales = lines.map((text, i) => {
      const w = textWidths.current[i];
      const tracking = text.length * HERO_TRACKING;
      if (w <= tracking) return 1;
      return (avail - tracking) / (w - tracking);
    });
    setFontScale(Math.max(MIN_HERO_SCALE, Math.min(1, ...scales) * 0.99));
  };

  return (
    <View
      style={[styles.heroBlock, centered && styles.heroBlockCentered]}
      onLayout={(e) => {
        blockWidth.current = e.nativeEvent.layout.width;
        fit();
      }}
    >
      <AnimatedLine text={line1} delay={100} accent={false} scale={fontScale} charDelay={charDelay} centered={centered} />
      {line2 && <AnimatedLine text={line2} delay={260} accent scale={fontScale} charDelay={charDelay} centered={centered} />}
      <View pointerEvents="none" style={styles.measureRow}>
        <Text
          style={[styles.heroWhite, styles.measureText]}
          onLayout={(e) => {
            textWidths.current[0] = e.nativeEvent.layout.width;
            fit();
          }}
        >
          {line1}
        </Text>
        {line2 && (
          <Text
            style={[styles.heroAccent, styles.measureText]}
            onLayout={(e) => {
              textWidths.current[1] = e.nativeEvent.layout.width;
              fit();
            }}
          >
            {line2}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroBlock: {
    gap: 2,
  },
  heroBlockCentered: {
    alignItems: "center",
  },
  heroLine: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  heroLineCentered: {
    justifyContent: "center",
  },
  heroWord: {
    flexDirection: "row",
  },
  heroWhite: {
    fontFamily: "Bebas",
    color: colors.text,
    letterSpacing: HERO_TRACKING,
  },
  heroAccent: {
    fontFamily: "Bebas",
    color: colors.primary,
    letterSpacing: HERO_TRACKING,
  },
  measureRow: {
    position: "absolute",
    left: 0,
    top: 0,
    opacity: 0,
  },
  measureText: {
    fontSize: HERO_FONT,
    lineHeight: HERO_LINE,
    alignSelf: "flex-start",
  },
});
