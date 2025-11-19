import React from "react";
import { View, StyleSheet, Alert, Image, Linking } from "react-native";
import { Button, Card, MD2DarkTheme, Text } from "react-native-paper";
import * as Updates from "expo-updates";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
    this.setState({
      error,
      errorInfo,
    });
  }

  sendError = () => {
    const { error } = this.state;
    const subject = "App Error Report";
    const body = `I encountered an error in the app:\n\nError: ${error?.message || "Unknown error"}\nTime: ${new Date().toISOString()}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert("Error", "Unable to open email app. Please send us an email describing the error.");
    });
  };

  restartApp = async () => {
    try {
      await Updates.reloadAsync({
        reloadScreenOptions: {
          backgroundColor: "#000",
          fade: true,
          image: require("../../assets/images/icon-light.png"),
        },
      });
    } catch (error) {
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
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Image source={require("../../assets/images/icon-light.png")} style={styles.logo} resizeMode="contain" />

              <Text style={styles.title}>I'm Sorry!</Text>
              <Text style={styles.description}>Something unexpected happened. We apologize for the inconvenience.</Text>
            </View>

            <View style={styles.buttonContainer}>
              <Button mode="contained" onPress={this.sendError} style={styles.sendButton} icon="send">
                Send Error Report
              </Button>

              <Button mode="outlined" onPress={this.restartApp} style={styles.restartButton} icon="restart" textColor="#fff">
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
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
    borderRadius: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: "100%",
    maxWidth: 400,
  },
  cardContent: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 16,
    flexDirection: "row",
    width: "100%",
    paddingBottom: 30,
  },
  sendButton: {
    borderRadius: 100,
    paddingVertical: 4,
    backgroundColor: MD2DarkTheme.colors.primary,
  },
  restartButton: {
    borderRadius: 100,
    paddingVertical: 4,
    borderColor: "#555",
  },
});
