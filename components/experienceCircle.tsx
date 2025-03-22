import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  BlurMask,
  Canvas,
  Group,
  Path,
  Skia,
  SweepGradient,
  vec,
  SkPath,
} from "@shopify/react-native-skia";
import Animated, { Easing, useSharedValue, withDelay, withTiming, SharedValue, useAnimatedReaction, useAnimatedStyle } from "react-native-reanimated";

const CANVAS_SIZE = 120;
const CIRCLE_SIZE = 100;
const STROKE_WIDTH = 15;
const MAX_EXPERIENCE = 563;
const CIRCLE_RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const ANIMATION_DURATION = 1000;
const ANIMATION_DELAY = 300; // Delay before starting the animation

const COLORS = {
  backgroundPath: "rgba(255, 255, 255, 0.3)",
  gradientColors: ["#1a1a1a", "#111111", "#080808", "#000000"],
  text: "black",
};

interface ExperienceCircleProps {
  exp: number;
  maxExp?: number; // Optional prop to override default MAX_EXPERIENCE
  isCardActive: SharedValue<boolean>; // Pass shared value directly
}

/**
 * Experience circle component that displays base experience XP with an animated circular progress
 */
const BaseExperienceCircle: React.FC<ExperienceCircleProps> = ({
  exp,
  maxExp = MAX_EXPERIENCE,
  isCardActive,
}) => {
  // Shared value for animation
  const strokeEnd = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  // Normalize experience to be between 0 and 1, with error handling
  const normalizedExp = useMemo(() => {
    // Handle negative exp values
    const safeExp = Math.max(0, exp);
    return Math.min(safeExp, maxExp) / maxExp;
  }, [exp, maxExp]);

  // Create the circle path
  const circlePath = useMemo((): SkPath => {
    try {
      const path = Skia.Path.Make();
      if (!path) throw new Error("Failed to create Skia path");

      path.addCircle(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CIRCLE_RADIUS);
      return path;
    } catch (error) {
      console.error("Error creating circle path:", error);
      // Fallback to empty path
      return Skia.Path.Make();
    }
  }, []);

  // Watch for changes in isCardActive to trigger animations
  useAnimatedReaction(
    () => isCardActive.value,
    (isActive, wasActive) => {
      if (isActive && !wasActive) {
        // Reset animation values
        strokeEnd.value = 0;
        textOpacity.value = 0;

        // Start the animations with delay
        strokeEnd.value = withDelay(
          ANIMATION_DELAY,
          withTiming(normalizedExp, {
            duration: ANIMATION_DURATION,
            easing: Easing.bezierFn(0.25, 0.1, 0.25, 0.1),
          })
        );

        // Fade in the text after circle animation starts
        textOpacity.value = withDelay(
          ANIMATION_DELAY + ANIMATION_DURATION * 0.5,
          withTiming(1, {
            duration: ANIMATION_DURATION * 0.5,
            easing: Easing.bezierFn(0.25, 0.1, 0.25, 0.1),
          })
        );
      } else if (!isActive && wasActive) {
        // Reset when not visible
        strokeEnd.value = withTiming(0, { duration: 300 });
        textOpacity.value = withTiming(0, { duration: 300 });
      }
    },
    [normalizedExp]
  );

  // Animated style for text container
  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value
    };
  });

  // Center point for the gradient
  const centerPoint = useMemo(() => vec(CANVAS_SIZE / 2, CANVAS_SIZE / 2), []);

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Group>
          {/* Background path */}
          <Path
            path={circlePath}
            color={COLORS.backgroundPath}
            style="stroke"
            strokeWidth={STROKE_WIDTH}
            start={0}
            end={1}
            strokeCap="round"
          />

          {/* Animated progress path */}
          <Path
            path={circlePath}
            style="stroke"
            strokeWidth={STROKE_WIDTH}
            start={0}
            end={strokeEnd}
            strokeCap="round"
          >
            <SweepGradient c={centerPoint} colors={COLORS.gradientColors} />
            <BlurMask blur={8} style="solid" />
          </Path>
        </Group>
      </Canvas>

      {/* Experience display in the center of the circle */}
      <Animated.View style={[styles.textContainer, animatedTextStyle]}>
        <Text style={styles.progressText}>{exp}xp</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  },
  textContainer: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
});

export default BaseExperienceCircle;