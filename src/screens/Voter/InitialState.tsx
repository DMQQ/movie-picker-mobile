import { View } from "react-native";
import { Text } from "react-native-paper";
import PrimaryButton from "../../components/PrimaryButton";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import PickCategory from "../../components/Voter/PickCategory";
import PickGenres from "../../components/Voter/PickGenres";
import PickProviders from "../../components/Voter/PickProviders";
import PageHeading from "../../components/PageHeading";
import useTranslation from "../../service/useTranslation";

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
          paddingHorizontal: 15,
          paddingBottom: 15,
          paddingTop: 60,
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ marginTop: 15 }}>
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
      <View style={{ padding: 15, paddingTop: 0 }}>
        <PrimaryButton onPress={actions.createSession}>
          {t("voter.home.create")}
        </PrimaryButton>
      </View>
    </Animated.View>
  );
}
