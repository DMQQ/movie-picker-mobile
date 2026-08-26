import { useEffect, useState } from "react";
import { AsyncStorage } from "expo-sqlite/kv-store";
import FloatingBadge, { type FloatingBadgeProps } from "./FloatingBadge";
import useTranslation from "../service/useTranslation";

interface NewBadgeProps extends Omit<FloatingBadgeProps, "label" | "visible"> {
  /** Unique feature id — seen-state persisted in KV store under `new_badge_seen_<featureKey>` */
  featureKey: string;
}

export default function NewBadge({ featureKey, ...props }: NewBadgeProps) {
  const t = useTranslation();
  // null until the KV read resolves — badge stays hidden to avoid flashing for returning users
  const [seen, setSeen] = useState<boolean | null>(null);

  const storageKey = `new_badge_seen_${featureKey}`;

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItemAsync(storageKey).then((raw) => {
      if (mounted) setSeen(raw !== null);
    });
    return () => {
      mounted = false;
    };
  }, [storageKey]);

  return (
    <FloatingBadge
      {...props}
      label={t("landing.chips.new") as string}
      visible={seen === false}
      onPressCapture={() => {
        if (seen === false) {
          setSeen(true);
          AsyncStorage.setItem(storageKey, "1");
        }
      }}
    />
  );
}
