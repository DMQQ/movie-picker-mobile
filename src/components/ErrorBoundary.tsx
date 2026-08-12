import React from "react";
import Text from "./Text";
import { View, StyleSheet, Alert, Image, Linking } from "react-native";

import Button from "./Button";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PrimaryButton from "./PrimaryButton";
import * as Updates from "expo-updates";
import { colors, fontSize, fontWeight, radius, spacing} from "../constants/design";
import { posthog } from "../constants/posthog";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    posthog?.captureException(error, {
      componentStack: errorInfo?.componentStack,
    });
    this.setState({
      error,
      errorInfo,
    });
  }

  sendError = () => {
    const { error } = this.state;
    const subject = "App Error Report";
    const body = `I encountered an error in the app:\n\nError: ${error?.message || "Unknown error"}\nTime: ${new Date().toISOString()}`;
    const mailtoUrl = `mailto:contact@flickmate.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert(
        "Error",
        "Unable to open email app. Please send us an email describing the error.",
      );
    });
  };

  restartApp = async () => {
    try {
      await Updates.reloadAsync({
        reloadScreenOptions: {
          backgroundColor: colors.appBackground,
          fade: true,
          image: require("../../assets/images/adaptive-icon.png"),
        },
      });
    } catch (error) {
      posthog?.captureException(error, { context: "restart" });
      console.error("Failed to restart app:", error);
      this.retry();
    }
  };

  retry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={require("../../assets/images/icon-light.png")}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.title}>I'm Sorry!</Text>
              <Text style={styles.description}>
                Something unexpected happened. We apologize for the
                inconvenience.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <PrimaryButton
                onPress={this.sendError}
                style={styles.sendButton}
                icon={({ color }) => <MaterialCommunityIcons name="send" size={16} color={color} />}
              >
                Send Error Report
              </PrimaryButton>

              <Button
                mode="outlined"
                onPress={this.restartApp}
                style={styles.restartButton}
                icon="restart"
                textColor={colors.text}
              >
                Restart App
              </Button>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  logo: {
    width: 80,
    height: 80,
    opacity: 0.8,
  },
  card: {
    backgroundColor: "#1c1c1c",
    borderRadius: radius.md,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: "100%",
    maxWidth: 400,
  },
  cardContent: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: fontSize.lg,
    color: "#ccc",
    textAlign: "center",
    marginBottom: spacing.xxl + 8,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: spacing.lg,
    flexDirection: "row",
    width: "100%",
    paddingBottom: spacing.xxl + 6,
  },
  sendButton: {
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
  },
  restartButton: {
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    borderColor: "#555",
  },
});
