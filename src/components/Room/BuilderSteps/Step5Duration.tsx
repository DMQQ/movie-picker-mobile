import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { Text, Banner, useTheme } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useValidateRoomConfigMutation } from "../../../redux/movie/movieApi";
import useTranslation from "../../../service/useTranslation";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { setMaxRounds } from "../../../redux/roomBuilder/roomBuilderSlice";

interface Genre {
  id: number;
  name: string;
}

interface Step5DurationProps {
  selectedDuration: number;
  onSelectDuration: (rounds: number) => void;
  category: string;
  genres: Genre[];
  providers: number[];
  specialCategories: string[];
}

const PricingCard = React.memo(({ option, index, selectedDuration, onSelectDuration }: any) => {
  const scale = useSharedValue(1);
  const isSelected = selectedDuration === option.value;
  const IconComponent = option.iconData.component;
  const theme = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(400).delay(index * 100)} style={styles.pricingCardContainer}>
      <Pressable onPress={() => onSelectDuration(option.value)} onPressIn={() => (scale.value = 0.95)} onPressOut={() => (scale.value = 1)}>
        <Animated.View style={[styles.pricingCard, animatedStyle, isSelected && { borderColor: theme.colors.primary, borderWidth: 3 }]}>
          <View style={[styles.iconBadge, { backgroundColor: option.iconData.color }]}>
            <IconComponent name={option.iconData.name} size={28} color="#fff" />
          </View>
          <Text style={styles.pricingLabel}>{option.label}</Text>
          <Text style={styles.pricingMinutes}>{option.minutes}</Text>
          <View style={styles.divider} />
          <Text style={styles.pricingDetail}>{option.moviesCount}</Text>
          <Text style={styles.pricingBestFor}>{option.bestFor}</Text>
          {isSelected && (
            <View style={[styles.checkmarkPricing, { backgroundColor: theme.colors.primary }]}>
              <MaterialIcons name="check" size={20} color="#fff" />
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
});

const Step5Duration: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const { maxRounds: selectedDuration, category, genres, providers, specialCategories } = useAppSelector((state) => state.builder);

  const onSelectDuration = (rounds: number) => {
    dispatch(setMaxRounds(rounds));
  };

  const [validateConfig, { data: validationResult, isLoading: isValidating }] = useValidateRoomConfigMutation();
  const t = useTranslation();

  const gameTimeOptions = useMemo(
    () => [
      {
        value: 3,
        label: t("room.builder.step5.gameTime.quick.label"),
        minutes: t("room.builder.step5.gameTime.quick.duration"),
        moviesCount: t("room.builder.step5.gameTime.quick.rounds"),
        bestFor: t("room.builder.step5.gameTime.quick.bestFor"),
        iconData: { component: MaterialIcons, name: "flash-on", color: "#FF6B35" },
      },
      {
        value: 6,
        label: t("room.builder.step5.gameTime.standard.label"),
        minutes: t("room.builder.step5.gameTime.standard.duration"),
        moviesCount: t("room.builder.step5.gameTime.standard.rounds"),
        bestFor: t("room.builder.step5.gameTime.standard.bestFor"),
        iconData: { component: MaterialIcons, name: "schedule", color: "#4ECDC4" },
      },
      {
        value: 10,
        label: t("room.builder.step5.gameTime.extended.label"),
        minutes: t("room.builder.step5.gameTime.extended.duration"),
        moviesCount: t("room.builder.step5.gameTime.extended.rounds"),
        bestFor: t("room.builder.step5.gameTime.extended.bestFor"),
        iconData: { component: MaterialIcons, name: "hourglass-empty", color: "#FFD23F" },
      },
    ],
    [t]
  );

  useEffect(() => {
    if (category) {
      validateConfig({
        category,
        genres: genres.map((g) => g.id),
        providers,
        specialCategories,
      });
    }
  }, [category, genres, providers, specialCategories]);

  const hasWarnings = validationResult && validationResult.warnings.length > 0;
  const isLowContent = validationResult && validationResult.estimatedCount < 50;

  return (
    <View style={styles.container}>
      {isValidating && (
        <View style={styles.validatingContainer}>
          <ActivityIndicator size="small" />
          <Text style={styles.validatingText}>{t("room.builder.step5.validating")}</Text>
        </View>
      )}

      {hasWarnings && (
        <Banner visible={true} icon="alert" style={[styles.banner, isLowContent && styles.warningBanner]}>
          {validationResult.warnings[0]}
          {validationResult.estimatedCount > 0 && (
            <Text style={styles.estimateText}>
              {"\n"}~{validationResult.estimatedCount} movies/shows available
            </Text>
          )}
        </Banner>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {gameTimeOptions.map((option, index) => (
          <PricingCard
            key={option.value}
            option={option}
            index={index}
            selectedDuration={selectedDuration}
            onSelectDuration={onSelectDuration}
          />
        ))}
      </ScrollView>
    </View>
  );
});

Step5Duration.displayName = "Step5Duration";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  validatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    marginBottom: 16,
  },
  validatingText: {
    color: "#999",
    fontSize: 14,
  },
  banner: {
    marginBottom: 16,
    backgroundColor: "rgba(76, 175, 80, 0.2)",
  },
  warningBanner: {
    backgroundColor: "rgba(255, 152, 0, 0.2)",
  },
  estimateText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  pricingCardContainer: {
    marginBottom: 16,
    width: "100%",
  },
  pricingCard: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 24,
    alignItems: "center",
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 32,
    fontFamily: "Bebas",
    color: "#fff",
    marginBottom: 4,
  },
  pricingMinutes: {
    fontSize: 16,
    color: "#999",
    marginBottom: 16,
  },
  divider: {
    width: "60%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 12,
  },
  pricingDetail: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 8,
  },
  pricingBestFor: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  checkmarkPricing: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryContainer: {
    marginTop: 16,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
  },
  summaryTitle: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Bebas",
    marginBottom: 12,
  },
  summaryText: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 8,
  },
});

export default Step5Duration;
