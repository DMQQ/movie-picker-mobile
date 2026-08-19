import { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Text from "../../Text";
import Touch from "../../Touch";
import useTranslation from "../../../service/useTranslation";
import { colors, fontSize, radius, spacing, withAlpha } from "../../../constants/design";

const BRACKET_SIZES = [4, 8, 16] as const;
const TAG_KEYS = ["sizeQuick", "sizeStandard", "sizeEpic"] as const;
const PREVIEW_WIDTH = 64;

interface Props {
  bracketSize: number;
  onSelect: (size: number) => void;
}

export default function Step3BracketSize({ bracketSize, onSelect }: Props) {
  const t = useTranslation();

  return (
    <View style={styles.container}>
      {BRACKET_SIZES.map((size, index) => {
        const isSelected = bracketSize === size;
        return (
          <Animated.View key={size} entering={FadeInDown.duration(300).delay(index * 60)}>
            <Touch scaleTo={0.98} onPress={() => onSelect(size)} style={[styles.row, isSelected && styles.rowSelected]}>
              <BracketPreview size={size} active={isSelected} />

              <View style={styles.info}>
                <View style={styles.infoTop}>
                  <Text style={[styles.number, isSelected && styles.numberSelected]}>{size}</Text>
                  <Text style={styles.label}>{t("eitherOr.setup.movies")}</Text>
                  <View style={[styles.tag, isSelected && styles.tagSelected]}>
                    <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>{t(`eitherOr.setup.${TAG_KEYS[index]}`)}</Text>
                  </View>
                </View>
                <Text style={styles.rounds}>{t("eitherOr.setup.rounds", { count: Math.log2(size) })}</Text>
              </View>

              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <MaterialCommunityIcons name="check" size={16} color={colors.text} />}
              </View>
            </Touch>
          </Animated.View>
        );
      })}
    </View>
  );
}

function BracketPreview({ size, active }: { size: number; active: boolean }) {
  const counts: number[] = [];
  for (let c = size; c >= 1; c /= 2) counts.push(c);
  const color = active ? colors.primary : colors.placeholder;

  return (
    <View style={styles.preview}>
      {counts.map((count, i) => (
        <Fragment key={count}>
          <View style={[styles.previewBar, { width: (count / size) * PREVIEW_WIDTH, backgroundColor: color }]} />
          {i < counts.length - 1 && <View style={[styles.previewConnector, { backgroundColor: withAlpha(color, 0.4) }]} />}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: withAlpha(colors.primary, 0.1),
  },
  preview: {
    width: PREVIEW_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  previewBar: {
    height: 4,
    borderRadius: 2,
  },
  previewConnector: {
    width: 1,
    height: 6,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  infoTop: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
  },
  number: {
    fontFamily: "Bebas",
    fontSize: fontSize.title,
    color: colors.text,
  },
  numberSelected: {
    color: colors.primary,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
  },
  tag: {
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.input,
  },
  tagSelected: {
    backgroundColor: withAlpha(colors.primary, 0.2),
  },
  tagText: {
    fontSize: fontSize.xs,
    color: colors.placeholder,
    fontWeight: "600",
  },
  tagTextSelected: {
    color: colors.primary,
  },
  rounds: {
    fontSize: fontSize.xs,
    color: colors.placeholder,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
