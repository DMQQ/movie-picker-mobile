import { useNavigation } from "expo-router";
import IconButton from "./IconButton";
import Text from "./Text";
import { colors, common, fontWeight, fontSize, radius, spacing} from "../constants/design";
import * as Haptic from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren, ReactElement } from "react";
import { TourAttachStep } from "./Tour/TourAttachStep";
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import PlatformBlurView from "./PlatformBlurView";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
  rightIconName?:
    | keyof typeof MaterialCommunityIcons.glyphMap
    | keyof typeof MaterialCommunityIcons.glyphMap;
  onRightIconPress?: () => void;
  extraScreenPaddingTop?: number;
  rightIconTitle?: string;
  tintColor?: string;
  rightIconColor?: string;
  rightIconTourIndex?: number;
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
  rightIconColor,
  onRightIconPress,
  extraScreenPaddingTop = 0,
  rightIconTourIndex,
}: RightIconButtonProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const wrapRightIcon = (node: ReactElement) =>
    rightIconTourIndex !== undefined ? (
      <TourAttachStep index={rightIconTourIndex}>{node}</TourAttachStep>
    ) : (
      node
    );

  return (
    <>
      {showGradientBackground && (
        <LinearGradient
          colors={[colors.appBackground, "rgba(0,0,0,0.6)", "transparent"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: gradientHeight,
            zIndex: 10,
          }}
          pointerEvents="none"
        />
      )}

      <View
        style={[
          styles.headerTop,
          { marginTop: useSafeArea ? insets.top + extraScreenPaddingTop : 0 },
          extraStyles,
        ]}
      >
        <View style={styles.sideContainer}>
          {showBackButton && (
            <PlatformBlurView interactive style={styles.buttonContainer}>
              <IconButton
                icon="chevron-left"
                size={28}
                style={common.iconButton}
                onPress={() => {
                  onPress ? onPress() : navigation.goBack();
                  if (Platform.OS === "ios") {
                    Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
                  }
                }}
                iconColor={colors.text}
              />
            </PlatformBlurView>
          )}
        </View>

        <View style={styles.centerContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

        <View
          style={[
            styles.sideContainerRight,
            rightIconTitle && { width: "auto" },
          ]}
        >
          {children
            ? children
            : showRightIconButton &&
              wrapRightIcon(
                rightIconTitle ? (
                  <Pressable
                    onPress={() => {
                      if (onRightIconPress) onRightIconPress();
                      if (Platform.OS === "ios") {
                        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
                      }
                    }}
                    hitSlop={12}
                  >
                    <PlatformBlurView
                      interactive
                      tintColor={tintColor}
                      style={styles.buttonContainer}
                    >
                      <View style={styles.rightButtonWithText}>
                        {rightIconName && (
                          <MaterialCommunityIcons
                            name={rightIconName as any}
                            size={20}
                            color={colors.text}
                          />
                        )}
                        <Text style={styles.rightText}>{rightIconTitle}</Text>
                      </View>
                    </PlatformBlurView>
                  </Pressable>
                ) : (
                  <PlatformBlurView
                    interactive
                    tintColor={tintColor}
                    style={styles.buttonContainer}
                  >
                    <IconButton
                      icon={rightIconName as any}
                      size={28}
                      style={common.iconButton}
                      iconColor={rightIconColor ?? colors.text}
                      onPress={() => {
                        if (onRightIconPress) onRightIconPress();
                        if (Platform.OS === "ios") {
                          Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
                        }
                      }}
                    />
                  </PlatformBlurView>
                ),
              )}
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
    height: spacing.xxl * 2 + spacing.lg,
    paddingHorizontal: spacing.screen,
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
    fontSize: 30,
    color: colors.text,
    textAlign: "center",
  },
  rightButtonWithText: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  rightText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  buttonContainer: {
    borderRadius: radius.pill,
    overflow: "hidden",
  },
});
