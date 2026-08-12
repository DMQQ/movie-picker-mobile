import { StyleSheet, View } from "react-native";
import Text from "../../components/Text";

import PrimaryButton from "../../components/PrimaryButton";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import PickCategory from "../../components/Voter/PickCategory";
import PickGenres from "../../components/Voter/PickGenres";
import PickProviders from "../../components/Voter/PickProviders";
import PageHeading from "../../components/PageHeading";
import useTranslation from "../../service/useTranslation";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fontSize, spacing } from "../../constants/design";

interface Props {
  sessionSettings: any;
  actions: any;
  onGoBack: () => void;
}

export default function InitialState({
  sessionSettings,
  actions,
  onGoBack,
}: Props) {
  const t = useTranslation();

  return (
    <Animated.View
      style={{ flex: 1 }}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
    >
      <PageHeading
        useSafeArea={false}
        gradientHeight={80}
        title={t("voter.home.howtotitle")}
        onPress={onGoBack}
      />
      <View
        style={{
          flex: 1,
          paddingHorizontal: spacing.screen,
          paddingBottom: spacing.screen,
          paddingTop: spacing.xl * 3,
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ marginTop: spacing.screen }}>
            <Text
              style={{
                fontSize: fontSize.md,
                color: colors.placeholder,
                lineHeight: 20,
              }}
            >
              {t("voter.home.howto")}
            </Text>
          </View>
          <Text style={styles.sectionTitle}>{t("filters.categories")}</Text>
          <PickCategory
            category={sessionSettings.category}
            setCategory={(category: string) => {
              actions.setSessionSettings((p: any) => ({ ...p, category }));
            }}
          />
          <Text style={styles.sectionTitle}>{t("filters.genres")}</Text>
          <PickGenres
            genres={sessionSettings.genres}
            setGenres={(genres: any) => {
              actions.setSessionSettings((p: any) => ({
                ...p,
                genres: genres(p.genres),
              }));
            }}
          />
          <Text style={styles.sectionTitle}>{t("filters.providers")}</Text>
          <PickProviders
            setProviders={(providers: any) => {
              actions.setSessionSettings((p: any) => ({
                ...p,
                providers: providers(p.providers),
              }));
            }}
            providers={sessionSettings.providers}
          />
        </View>
      </View>
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.9)"]}
        style={{ padding: spacing.screen, paddingTop: spacing.screen }}
      >
        <PrimaryButton onPress={actions.createSession}>
          {t("voter.home.create")}
        </PrimaryButton>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: "Bebas",
    fontSize: 24,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm + 2,
  },
});
