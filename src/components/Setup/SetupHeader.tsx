import PageHeading from "../PageHeading";
import CircularStepProgress from "./CircularStepProgress";

interface Props {
  title: string;
  currentStep: number;
  totalSteps: number;
  onBackPress: () => void;
  isReady?: boolean;
}

export default function SetupHeader({ title, currentStep, totalSteps, onBackPress, isReady }: Props) {
  return (
    <PageHeading onPress={onBackPress} showBackButton gradientHeight={100} showGradientBackground={false} useSafeArea={false} title={title}>
      <CircularStepProgress currentStep={currentStep} totalSteps={totalSteps} isReady={isReady} />
    </PageHeading>
  );
}
