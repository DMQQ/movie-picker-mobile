import { useNavigation } from "@react-navigation/native";
import * as Haptic from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren } from "react";
import { Platform, Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { IconButton, MD2DarkTheme, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PlatformBlurView from "./PlatformBlurView";
import { AntDesign, Ionicons } from "@expo/vector-icons";

interface PageHeadingProps extends PropsWithChildren {
  title: string;
  onPress?: () => void;
  showBackButton?: boolean;

  showGradientBackground?: boolean;
  gradientHeight?: number;
  useSafeArea?: boolean;

  styles?: StyleProp<ViewStyle>;
}

interface RightIconButtonProps extends PageHeadingProps {
  showRightIconButton?: boolean;

  rightIconName?: keyof typeof AntDesign.glyphMap | keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;

  extraScreenPaddingTop?: number;

  rightIconTitle?: string;

  tintColor?: string;
}

export default function PageHeading({
  title,
  onPress,
  showBackButton = true,
  useSafeArea = true,
  showGradientBackground = true,
  gradientHeight = 150,
  styles: extraStyles,
  children,

  showRightIconButton = false,

  rightIconName,

  rightIconTitle,

  tintColor = undefined,

  onRightIconPress,

  extraScreenPaddingTop = 0,
}: RightIconButtonProps) {
  const navigation = useNavigation();

  const insets = useSafeAreaInsets();
  return (
    <>
      {showGradientBackground && (
        <LinearGradient
          colors={["#000", "rgba(0,0,0,0.6)", "transparent"]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: gradientHeight, zIndex: 10 }}
          pointerEvents="none"
        />
      )}
      <View style={[styles.headerTop, { marginTop: useSafeArea ? insets.top + extraScreenPaddingTop : 0 }, extraStyles]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", width: "100%" }}>
          {showBackButton && (
            <PlatformBlurView isInteractive style={[styles.buttonContainer]}>
              <IconButton
                icon="chevron-left"
                size={25}
                onPress={() => {
                  typeof onPress !== "undefined" ? onPress() : navigation.goBack();

                  if (Platform.OS === "ios") {
                    Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
                  }
                }}
                iconColor="white"
              />
            </PlatformBlurView>
          )}

          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        {children}

        {showRightIconButton && (
          <PlatformBlurView
            isInteractive
            tintColor={tintColor}
            style={[
              styles.buttonContainer,
              {
                right: 15,
                left: undefined,
              },
              rightIconTitle && { flexDirection: "row", alignItems: "center", justifyContent: "center" },
            ]}
          >
            <Pressable
              onPress={() => {
                if (onRightIconPress) {
                  onRightIconPress();
                }

                if (Platform.OS === "ios") {
                  Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
                }
              }}
            >
              {rightIconName && (
                <IconButton
                  icon={rightIconName as any}
                  size={20}
                  onPress={() => {
                    if (onRightIconPress) {
                      onRightIconPress();
                    }

                    if (Platform.OS === "ios") {
                      Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
                    }
                  }}
                  iconColor="white"
                />
              )}
              {rightIconTitle && (
                <Text style={[{ color: "#fff", fontSize: 16, fontWeight: "600" }, !rightIconName && { padding: 15 }]}>
                  {rightIconTitle}
                </Text>
              )}
            </Pressable>
          </PlatformBlurView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerTop: {
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    height: 60,
  },
  headerTitle: {
    fontFamily: "Bebas",
    fontSize: 32,
    color: "#fff",
    flex: 1,
    textAlign: "center",
    paddingTop: 10,
  },
  backButton: {
    marginRight: 8,
    position: "absolute",
    left: 15,
    zIndex: 1,
    top: Platform.OS === "android" ? 10 : 5,
    borderRadius: 1000,

    ...Platform.select({
      android: {
        backgroundColor: MD2DarkTheme.colors.surface,
        borderWidth: 2,
        borderColor: "#343434ff",
      },
    }),
  },

  buttonContainer: {
    borderRadius: 100,
    overflow: "hidden",
    position: "absolute",
    left: 15,
    top: Platform.OS === "android" ? 5 : 5,
    zIndex: 1,

    ...Platform.select({
      android: {
        backgroundColor: MD2DarkTheme.colors.surface,
        borderWidth: 1,
        borderColor: "#343434ff",
      },
    }),
  },
});
