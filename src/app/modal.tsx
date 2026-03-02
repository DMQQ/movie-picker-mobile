import { BackHandler, Linking, Platform, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SettingsResponse } from "../../types";
import useTranslation from "../service/useTranslation";
import { useAppSelector } from "../redux/store";
import { useEffect } from "react";

type ModalType = "no-internet" | "server-error" | "maintenance" | "update";
type IconName = "wifi-off" | "server-off" | "wrench" | "cellphone-arrow-down";

function getLocalizedValue(messages: { language: "pl" | "en"; value: string }[] | undefined, lang: string): string | undefined {
  if (!messages?.length) return undefined;
  return messages.find((m) => m.language === lang)?.value || messages.find((m) => m.language === "en")?.value;
}

function ModalIcon({ name }: { name: IconName }) {
  return (
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name={name} size={48} color="#fff" />
    </View>
  );
}

function NoInternetContent({ onDismiss }: { onDismiss?: () => void }) {
  const t = useTranslation();
  return (
    <>
      <ModalIcon name="wifi-off" />
      <Text style={styles.title}>{t("status-modal.no-internet.title")}</Text>
      <Text style={styles.message}>{t("status-modal.no-internet.message")}</Text>
      {onDismiss && (
        <Button mode="contained" onPress={onDismiss} style={styles.button} contentStyle={styles.buttonContent}>
          {t("status-modal.retry")}
        </Button>
      )}
    </>
  );
}

function ServerErrorContent({ onDismiss }: { onDismiss?: () => void }) {
  const t = useTranslation();
  return (
    <>
      <ModalIcon name="server-off" />
      <Text style={styles.title}>{t("status-modal.server.title")}</Text>
      <Text style={styles.message}>{t("status-modal.server.message")}</Text>
      {onDismiss && (
        <Button mode="contained" onPress={onDismiss} style={styles.button} contentStyle={styles.buttonContent}>
          {t("status-modal.retry")}
        </Button>
      )}
    </>
  );
}

function MaintenanceContent({ data, onDismiss }: { data: SettingsResponse; onDismiss?: () => void }) {
  const t = useTranslation();
  const lang = useAppSelector((state) => state.room.language) || "en";
  const maintenance = data.maintenance!;
  const serverMessage = getLocalizedValue(maintenance.message, lang);

  return (
    <>
      <ModalIcon name="wrench" />
      <Text style={styles.title}>{t("status-modal.maintenance.title")}</Text>
      <Text style={styles.message}>{serverMessage || t("status-modal.maintenance.message")}</Text>
      {onDismiss && (
        <Button mode="contained" onPress={onDismiss} style={styles.button} contentStyle={styles.buttonContent}>
          {t("status-modal.dismiss")}
        </Button>
      )}
    </>
  );
}

function UpdateContent({ data, onDismiss }: { data: SettingsResponse; onDismiss?: () => void }) {
  const t = useTranslation();
  const lang = useAppSelector((state) => state.room.language) || "en";
  const update = data.update!;
  const serverMessage = getLocalizedValue(update.message, lang);
  const link = Platform.OS === "ios" ? update.links?.ios : update.links?.android;

  return (
    <>
      <ModalIcon name="cellphone-arrow-down" />
      <Text style={styles.title}>{t("status-modal.update.title")}</Text>
      <Text style={styles.message}>{serverMessage || t("status-modal.update.message")}</Text>
      <View style={styles.buttonContainer}>
        {link && (
          <Button mode="contained" onPress={() => Linking.openURL(link)} style={styles.button} contentStyle={styles.buttonContent}>
            {t("status-modal.update-button")}
          </Button>
        )}
        {onDismiss && (
          <Button mode="text" onPress={onDismiss} textColor="#888" style={styles.button} contentStyle={styles.buttonContent}>
            {t("status-modal.dismiss")}
          </Button>
        )}
      </View>
    </>
  );
}

export default function Modal() {
  const params = useLocalSearchParams<{ type?: string; dismissible?: string; data?: string }>();
  const type = (params.type as ModalType) || "server-error";
  const dismissible = params.dismissible === "true";
  const data: SettingsResponse | null = params.data ? JSON.parse(params.data) : null;

  const handleDismiss = dismissible ? () => router.back() : undefined;

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => !dismissible);

    return () => sub.remove();
  }, [dismissible]);

  return (
    <View style={styles.container}>
      {type === "no-internet" && <NoInternetContent onDismiss={handleDismiss} />}
      {type === "server-error" && <ServerErrorContent onDismiss={handleDismiss} />}
      {type === "maintenance" && data && <MaintenanceContent data={data} onDismiss={handleDismiss} />}
      {type === "update" && data && <UpdateContent data={data} onDismiss={handleDismiss} />}
      {(type === "maintenance" || type === "update") && !data && <ServerErrorContent onDismiss={handleDismiss} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "Bebas",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  button: {
    borderRadius: 25,
    width: "100%",
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
