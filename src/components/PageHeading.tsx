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
  tintColor,
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
        <View style={styles.sideContainer}>
          {showBackButton && (
            <PlatformBlurView interactive style={styles.buttonContainer}>
              <IconButton
                icon="chevron-left"
                size={25}
                onPress={() => {
                  onPress ? onPress() : navigation.goBack();
                  if (Platform.OS === "ios") {
                    Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
                  }
                }}
                iconColor="white"
              />
            </PlatformBlurView>
          )}
        </View>

        <View style={styles.centerContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

        <View style={[styles.sideContainerRight, rightIconTitle && { width: "auto" }]}>
          {children
            ? children
            : showRightIconButton &&
              (rightIconTitle ? (
                <PlatformBlurView interactive tintColor={tintColor} style={styles.buttonContainer}>
                  <Pressable
                    onPress={() => {
                      if (onRightIconPress) onRightIconPress();
                      if (Platform.OS === "ios") {
                        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
                      }
                    }}
                    style={styles.rightButtonWithText}
                  >
                    {rightIconName && <IconButton icon={rightIconName as any} size={20} iconColor="white" />}
                    <Text style={[styles.rightText, !rightIconName && { paddingHorizontal: 15, paddingVertical: 10 }]}>
                      {rightIconTitle}
                    </Text>
                  </Pressable>
                </PlatformBlurView>
              ) : (
                <PlatformBlurView interactive tintColor={tintColor} style={styles.buttonContainer}>
                  <IconButton
                    icon={rightIconName as any}
                    size={25}
                    onPress={() => {
                      if (onRightIconPress) onRightIconPress();
                      if (Platform.OS === "ios") {
                        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
                      }
                    }}
                    iconColor="white"
                  />
                </PlatformBlurView>
              ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    paddingHorizontal: 15,
    zIndex: 10,
  },
  sideContainer: {
    width: 60,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sideContainerRight: {
    width: 60,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 0,
    right: 0,
  },
  headerTitle: {
    fontFamily: "Bebas",
    fontSize: 32,
    color: "#fff",
    textAlign: "center",
  },
  rightButtonWithText: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    paddingRight: 10,
  },
  buttonContainer: {
    borderRadius: 100,
    overflow: "hidden",
    ...Platform.select({
      android: {
        backgroundColor: MD2DarkTheme.colors.surface,
        borderWidth: 1,
        borderColor: "#343434ff",
      },
    }),
  },
});
