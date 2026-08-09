import { View } from "react-native";
import Text from "../../components/Text";

import PrimaryButton from "../../components/PrimaryButton";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import PickCategory from "../../components/Voter/PickCategory";
import PickGenres from "../../components/Voter/PickGenres";
import PickProviders from "../../components/Voter/PickProviders";
import PageHeading from "../../components/PageHeading";
import useTranslation from "../../service/useTranslation";
import { fontSize, spacing } from "../../constants/design";

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
        gradientHeight={50}
        useSafeArea={false}
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
            <Text style={{ fontSize: fontSize.xl }}>{t("voter.home.howto")}</Text>
          </View>
          <PickCategory
            category={sessionSettings.category}
            setCategory={(category: string) => {
              actions.setSessionSettings((p: any) => ({ ...p, category }));
            }}
          />
          <PickGenres
            genres={sessionSettings.genres}
            setGenres={(genres: any) => {
              actions.setSessionSettings((p: any) => ({
                ...p,
                genres: genres(p.genres),
              }));
            }}
          />
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
      <View style={{ padding: spacing.screen, paddingTop: 0 }}>
        <PrimaryButton onPress={actions.createSession}>
          {t("voter.home.create")}
        </PrimaryButton>
      </View>
    </Animated.View>
  );
}
