import { useMemo } from "react";
import useTranslation from "../../service/useTranslation";
import SegmentedControl from "../SegmentedControl";

type MediaType = "movie" | "tv" | "both";

interface TypeSelectorProps {
  value: MediaType;
  onChange: (value: MediaType) => void;
}

export default function TypeSelector({ value, onChange }: TypeSelectorProps) {
  const t = useTranslation();

  const options = useMemo(
    () => [
      { value: "both", label: t("filters.both") as string },
      { value: "movie", label: t("filters.movie") as string },
      { value: "tv", label: t("filters.tv") as string },
    ],
    [t],
  );

  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={(v) => onChange(v as MediaType)}
    />
  );
}
