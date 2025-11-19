import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { Image, View, StyleSheet, Platform } from "react-native";
import { Button, SegmentedButtons, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn, FadeInUp } from "react-native-reanimated";
import ChooseRegion from "../components/ChooseRegion";
import useTranslation from "../service/useTranslation";
import { reloadAppAsync } from "expo";
import * as Updates from "expo-updates";

interface Region {
  code: string;
  name: string;
  language: string;
  timezone: string;
}

interface OnboardingHeaderProps {
  step: number;
  totalSteps: number;
}

interface LanguageStepProps {
  language: string;
  onLanguageChange: (language: string) => void;
}

interface NicknameStepProps {
  nickname: string;
  onNicknameChange: (nickname: string) => void;
}

interface RegionStepProps {
  selectedRegion: Region | null;
  onRegionSelect: (region: Region) => void;
}

interface NavigationProps {
  step: number;
  isLoading: boolean;
  canGoNext: boolean;
  onBack: () => void;
  onNext: () => void;
}

const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ step, totalSteps }) => {
  const t = useTranslation();

  return (
    <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
      <Image source={require("../../assets/images/icon-light.png")} style={styles.headerIcon} />
      <Text style={styles.headerTitle}>{t("onboarding.welcome.title")}</Text>
      <Text style={styles.stepIndicator}>{t("onboarding.navigation.step", { current: step, total: totalSteps })}</Text>
    </Animated.View>
  );
};

const LanguageStep: React.FC<LanguageStepProps> = ({ language, onLanguageChange }) => {
  const t = useTranslation();

  return (
    <Animated.View entering={FadeIn} style={styles.stepContainer}>
      <View style={styles.content}>
        <Text style={styles.stepTitle}>{t("onboarding.language.title")}</Text>
        <Text style={styles.stepDescription}>{t("onboarding.language.description")}</Text>

        <SegmentedButtons
          buttons={[
            {
              label: "English",
              value: "en",
            },
            {
              label: "Polski",
              value: "pl",
            },
          ]}
          onValueChange={onLanguageChange}
          value={language}
          style={styles.segmentedButtons}
        />
      </View>
    </Animated.View>
  );
};

const NicknameStep: React.FC<NicknameStepProps> = ({ nickname, onNicknameChange }) => {
  const t = useTranslation();

  return (
    <Animated.View entering={FadeIn} style={styles.stepContainer}>
      <View style={styles.content}>
        <Text style={styles.stepTitle}>{t("onboarding.nickname.title")}</Text>
        <Text style={styles.stepDescription}>{t("onboarding.nickname.description")}</Text>

        <TextInput
          value={nickname}
          onChangeText={onNicknameChange}
          mode="outlined"
          label={t("onboarding.nickname.label")}
          placeholder={t("onboarding.nickname.placeholder")}
          style={styles.textInput}
        />
      </View>
    </Animated.View>
  );
};

const RegionStep: React.FC<RegionStepProps> = ({ onRegionSelect }) => {
  const t = useTranslation();

  return (
    <Animated.View entering={FadeIn} style={styles.stepContainer}>
      <View style={styles.content}>
        <Text style={styles.stepTitle}>{t("onboarding.region.title")}</Text>
        <Text style={styles.stepDescription}>{t("onboarding.region.description")}</Text>

        <View style={styles.regionContainer}>
          <ChooseRegion showAsSelector={true} onRegionSelect={onRegionSelect} />
        </View>
      </View>
    </Animated.View>
  );
};

const OnboardingNavigation: React.FC<NavigationProps> = ({ step, isLoading, canGoNext, onBack, onNext }) => {
  const t = useTranslation();

  return (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.navigationContainer}>
      <View style={styles.navigationButtons}>
        {step > 1 && (
          <Button mode="outlined" onPress={onBack} style={styles.navButton} contentStyle={styles.navButtonContent} disabled={isLoading}>
            {t("onboarding.navigation.back")}
          </Button>
        )}

        <Button
          mode="contained"
          onPress={onNext}
          disabled={!canGoNext || isLoading}
          style={[styles.navButton, step === 1 ? styles.singleButton : null]}
          contentStyle={styles.navButtonContent}
          loading={isLoading && step === 3}
        >
          {step === 3 ? t("onboarding.navigation.getStarted") : t("onboarding.navigation.next")}
        </Button>
      </View>
    </Animated.View>
  );
};

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState("en");
  const [nickname, setNickname] = useState("Guest");
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 3;

  const handleNext = async () => {
    if (step === 1 && language) {
      setStep(2);
    } else if (step === 2 && selectedRegion) {
      setStep(3);
    } else if (step === 3 && nickname.trim().length > 0 && selectedRegion && !isLoading) {
      setIsLoading(true);
      try {
        await Promise.allSettled([
          SecureStore.setItemAsync("language", language),
          SecureStore.setItemAsync("nickname", nickname),
          SecureStore.setItemAsync(
            "regionalization",
            JSON.stringify({
              "x-user-region": selectedRegion.code,
              "x-user-watch-provider": selectedRegion.code,
              "x-user-watch-region": selectedRegion.code,
              "x-user-timezone": selectedRegion.timezone,
            })
          ),
        ]);

        Platform.OS === "ios"
          ? await Updates.reloadAsync({
              reloadScreenOptions: {
                backgroundColor: "#000",
                fade: true,
                image: require("../../assets/images/icon-light.png"),
              },
            })
          : await reloadAppAsync("load with new options");
      } catch (error) {
        console.error("Failed to save onboarding data or reload:", error);
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canGoNext = (step === 1 && !!language) || (step === 3 && nickname.trim().length > 0) || (step === 2 && !!selectedRegion);

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return <LanguageStep language={language} onLanguageChange={setLanguage} />;
      case 2:
        return <RegionStep selectedRegion={selectedRegion} onRegionSelect={setSelectedRegion} />;
      case 3:
        return <NicknameStep nickname={nickname} onNicknameChange={setNickname} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader step={step} totalSteps={totalSteps} />
      <View style={styles.mainContent}>{renderCurrentStep()}</View>
      <OnboardingNavigation step={step} isLoading={isLoading} canGoNext={canGoNext} onBack={handleBack} onNext={handleNext} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 30,
  },
  headerIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Bebas",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  stepIndicator: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  mainContent: {
    flex: 2,
    paddingHorizontal: 15,
  },
  stepContainer: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 60,
  },
  content: {
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: "Bebas",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 15,
  },
  segmentedButtons: {
    width: "100%",
    maxWidth: 400,
  },
  textInput: {
    backgroundColor: "transparent",
    width: "100%",
    maxWidth: 400,
  },
  regionContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 400,
    minHeight: 300,
  },
  navigationContainer: {
    paddingHorizontal: 15,
  },
  navigationButtons: {
    flexDirection: "row",
    gap: 12,
  },
  navButton: {
    flex: 1,
    borderRadius: 25,
  },
  singleButton: {
    marginLeft: "auto",
    flex: 0,
    minWidth: 120,
  },
  navButtonContent: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    paddingBottom: 15,
  },
});
