import { AsyncStorage } from "expo-sqlite/kv-store";
import { useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
import Animated, { FadeInDown, FadeInUp, SlideInRight, SlideOutLeft } from "react-native-reanimated";
import SafeIOSContainer from "../components/SafeIOSContainer";
import useTranslation from "../service/useTranslation";
import { LinearGradient } from "expo-linear-gradient";
import { useAppDispatch, useAppSelector } from "../redux/store";
import SwiperAnimation from "../components/GameListAnimations/SwipeAnimation";
import VoterAnimation from "../components/GameListAnimations/VoterAnimation";
import FortuneWheelAnimation from "../components/GameListAnimations/FortuneWheelAnimation";
import BrowseAnimation from "../components/GameListAnimations/BrowseAnimation";
import ProviderList from "../components/Room/ProviderList";
import { useGetAllProvidersQuery } from "../redux/movie/movieApi";
import { setProviders } from "../redux/mediaFilters/mediaFiltersSlice";

const { width, height } = Dimensions.get("screen");

interface FeatureSlide {
  id: string;
  titleKey: string;
  descriptionKey: string;
  Animation?: React.ComponentType;
  players?: string;
  duration?: string;
  isProviderSlide?: boolean;
}

const features: FeatureSlide[] = [
  {
    id: "swiper",
    titleKey: "onboarding.features.swiper.title",
    descriptionKey: "onboarding.features.swiper.description",
    Animation: SwiperAnimation,
    players: "1-8",
    duration: "3-10 min",
  },
  {
    id: "voter",
    titleKey: "onboarding.features.voter.title",
    descriptionKey: "onboarding.features.voter.description",
    Animation: VoterAnimation,
    players: "2",
    duration: "5-10 min",
  },
  {
    id: "fortune",
    titleKey: "onboarding.features.fortune.title",
    descriptionKey: "onboarding.features.fortune.description",
    Animation: FortuneWheelAnimation,
    players: "1",
    duration: "1 min",
  },
  {
    id: "browse",
    titleKey: "onboarding.features.browse.title",
    descriptionKey: "onboarding.features.browse.description",
    Animation: BrowseAnimation,
  },
  {
    id: "providers",
    titleKey: "onboarding.features.providers.title",
    descriptionKey: "onboarding.features.providers.description",
    isProviderSlide: true,
  },
];

const GamePreviewCard = ({ slide, t }: { slide: FeatureSlide; t: (key: string) => string }) => {
  const Animation = slide.Animation!;

  return (
    <Animated.View entering={SlideInRight.duration(300)} exiting={SlideOutLeft.duration(300)} style={styles.gameCard}>
      <View style={styles.animationContainer}>
        <Animation />
      </View>

      <LinearGradient colors={["transparent", "rgba(0,0,0,0.9)"]} style={styles.cardGradient}>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t(slide.titleKey)}</Text>
            <View style={styles.cardMeta}>
              {slide.players && (
                <View style={styles.metaItem}>
                  <IconButton icon="account-group" size={16} iconColor="#fff" style={styles.metaIcon} />
                  <Text style={styles.metaText}>{slide.players}</Text>
                </View>
              )}
              {slide.duration && (
                <View style={styles.metaItem}>
                  <IconButton icon="clock-outline" size={16} iconColor="#fff" style={styles.metaIcon} />
                  <Text style={styles.metaText}>{slide.duration}</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.cardDescription}>{t(slide.descriptionKey)}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

interface ProviderSelectionCardProps {
  slide: FeatureSlide;
  t: (key: string) => string;
  selectedProviders: number[];
  onToggleProviders: (providers: number[]) => void;
}

const ProviderSelectionCard = ({ slide, t, selectedProviders, onToggleProviders }: ProviderSelectionCardProps) => {
  const { data: providers = [], isLoading } = useGetAllProvidersQuery({});

  return (
    <Animated.View entering={SlideInRight.duration(300)} exiting={SlideOutLeft.duration(300)} style={styles.providerCard}>
      <View style={styles.providerCardHeader}>
        <Text style={styles.cardTitle}>{t(slide.titleKey)}</Text>
        <Text style={styles.providerCardDescription}>{t(slide.descriptionKey)}</Text>
      </View>
      <View style={styles.providerListContainer}>
        <ProviderList
          providers={providers}
          selectedProviders={selectedProviders}
          onToggleProvider={onToggleProviders}
          isCategorySelected={true}
          vertical
          isLoading={isLoading}
        />
      </View>
      {selectedProviders.length > 0 && (
        <Text style={styles.selectedCount}>
          {selectedProviders.length} {t("onboarding.features.providers.selected")}
        </Text>
      )}
    </Animated.View>
  );
};

const PageIndicator = ({ currentPage, totalPages }: { currentPage: number; totalPages: number }) => {
  return (
    <View style={styles.pageIndicator}>
      {Array.from({ length: totalPages }).map((_, index) => (
        <View key={index} style={[styles.dot, currentPage === index && styles.activeDot]} />
      ))}
    </View>
  );
};

interface OnboardingScreenProps {
  onClose?: () => void;
}

export default function OnboardingScreen({ onClose }: OnboardingScreenProps) {
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.room.language) || "en";
  const regionalization = useAppSelector((state) => state.room.regionalization);
  const nickname = useAppSelector((state) => state.room.nickname);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        AsyncStorage.setItem("language", language),
        AsyncStorage.setItem("nickname", nickname || (language === "en" ? "Guest" : "Gość")),
        AsyncStorage.setItem("regionalization", JSON.stringify(regionalization || {})),
      ]);

      // Dispatch to Redux - listener middleware will auto-save to storage
      if (selectedProviders.length > 0) {
        dispatch(setProviders(selectedProviders));
      }

      onClose?.();
    } catch (error) {
      console.error("Failed to save onboarding state:", error);
      onClose?.();
    }
  };

  const handleNext = () => {
    if (currentPage < features.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const isLastPage = currentPage === features.length - 1;
  const currentSlide = features[currentPage];

  return (
    <SafeIOSContainer style={styles.container}>
      <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
        <Image source={require("../../assets/images/icon-light.png")} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>{t("onboarding.features.header")}</Text>
        <Text style={styles.headerSubtitle}>{t("onboarding.features.welcome.description")}</Text>
      </Animated.View>

      <View style={styles.content}>
        {currentSlide.isProviderSlide ? (
          <ProviderSelectionCard
            key={currentSlide.id}
            slide={currentSlide}
            t={t}
            selectedProviders={selectedProviders}
            onToggleProviders={setSelectedProviders}
          />
        ) : (
          <GamePreviewCard key={currentSlide.id} slide={currentSlide} t={t} />
        )}
      </View>

      <Animated.View entering={FadeInDown.delay(400)} style={styles.footer}>
        <PageIndicator currentPage={currentPage} totalPages={features.length} />

        <View style={styles.buttonContainer}>
          {!isLastPage && (
            <Button mode="text" onPress={handleSkip} textColor="#888" style={styles.skipButton}>
              {t("onboarding.features.skip")}
            </Button>
          )}

          <Button
            mode="contained"
            onPress={handleNext}
            loading={isLoading}
            disabled={isLoading}
            style={[styles.nextButton, isLastPage && styles.fullWidthButton]}
            contentStyle={styles.nextButtonContent}
          >
            {isLastPage ? t("onboarding.features.getStarted") : t("onboarding.features.next")}
          </Button>
        </View>
      </Animated.View>
    </SafeIOSContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerIcon: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Bebas",
    color: "#fff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  gameCard: {
    height: height * 0.55,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  animationContainer: {
    flex: 1,
    overflow: "hidden",
  },
  cardGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 28,
    fontFamily: "Bebas",
    color: "#fff",
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  metaIcon: {
    margin: 0,
  },
  metaText: {
    color: "#fff",
    fontSize: 12,
  },
  cardDescription: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 22,
  },
  providerCard: {
    height: height * 0.55,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    padding: 20,
  },
  providerCardHeader: {
    marginBottom: 16,
  },
  providerCardDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginTop: 8,
  },
  providerListContainer: {
    flex: 1,
  },
  selectedCount: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 15,
  },
  pageIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#444",
  },
  activeDot: {
    backgroundColor: "#fff",
    width: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
    borderRadius: 25,
    marginLeft: 10,
  },
  fullWidthButton: {
    marginLeft: 0,
  },
  nextButtonContent: {
    paddingVertical: 8,
  },
});
