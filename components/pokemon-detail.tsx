import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useAnimatedReaction,
} from "react-native-reanimated";

import { Pokemon } from "@/interface";
import BaseExperienceCircle from "./experienceCircle";

// Constants
const screenWidth = Dimensions.get("screen").width;
export const pokemonCardWidth = screenWidth * 0.8;

// Threshold values for swipe gestures
const SWIPE_THRESHOLD = 400;
const SWIPE_DISTANCE = 500;

// Component props interface
interface PokemonDetailsProps {
  url: string;
  index: number;
  activeIndex: SharedValue<number>;
  numOfCards: number;
  onSwipe: (pokemon: Pokemon, liked: boolean) => void;
}

//Pokemon card with swipe functionality
const PokemonDetail = ({
  url,
  index,
  activeIndex,
  numOfCards,
  onSwipe,
}: PokemonDetailsProps) => {
  // animation values
  const translationX = useSharedValue(0);
  const isCardActive = useSharedValue(false);

  // Fetch Pokemon data
  const {
    data: pokemon,
    error,
    status,
  } = useQuery({
    queryKey: ["pokemon", url],
    queryFn: async () => {
      const response = await axios.get(url);
      return response.data;
    },
  });

  // Track when card becomes active to trigger experience animation
  useAnimatedReaction(
    () => activeIndex.value,
    (currentIndex, previousIndex) => {
      // Check if this card has just become the active card
      if (Math.floor(currentIndex) === index && (!previousIndex || Math.floor(previousIndex) !== index)) {
        isCardActive.value = true;
      } else if (Math.floor(currentIndex) !== index) {
        isCardActive.value = false;
      }
    },
    [index]
  );

  // Card animation style
  const animatedCard = useAnimatedStyle(() => ({
    opacity: interpolate(
      activeIndex.value,
      [index - 1, index, index + 1],
      [1 - 1 / 5, 1, 1]
    ),
    transform: [
      {
        scale: interpolate(
          activeIndex.value,
          [index - 1, index, index + 1],
          [0.95, 1, 1]
        ),
      },
      {
        translateY: interpolate(
          activeIndex.value,
          [index - 1, index, index + 1],
          [30, 0, 0]
        ),
      },
      {
        translateX: translationX.value,
      },
      {
        rotateZ: `${interpolate(
          translationX.value,
          [-screenWidth / 2, 0, screenWidth / 2],
          [-15, 0, 15]
        )}deg`,
      },
    ],
  }));

  // "LIKE" label animation style
  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translationX.value,
      [0, screenWidth / 4],
      [0, 1],
      "clamp"
    ),
    transform: [
      {
        scale: interpolate(
          translationX.value,
          [0, screenWidth / 4],
          [0.8, 1],
          "clamp"
        ),
      },
    ],
  }));

  // "NOPE" label animation style
  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translationX.value,
      [-screenWidth / 4, 0],
      [1, 0],
      "clamp"
    ),
    transform: [
      {
        scale: interpolate(
          translationX.value,
          [-screenWidth / 4, 0],
          [1, 0.8],
          "clamp"
        ),
      },
    ],
  }));

  // Animated value to control experience circle visibility
  const expCircleVisible = useAnimatedStyle(() => {
    return {
      opacity: isCardActive.value ? 1 : 0,
    };
  });

  // Pan gesture handler
  const gesture = Gesture.Pan()
    .onChange((event) => {
      translationX.value = event.translationX;

      // Update active index based on swipe distance
      activeIndex.value = interpolate(
        Math.abs(translationX.value),
        [0, SWIPE_DISTANCE],
        [index, index + 0.8]
      );
    })
    .onEnd((event) => {
      const liked = event.velocityX > 0; // Right swipe = like

      // If swipe velocity exceeds threshold, complete the swipe action
      if (Math.abs(event.velocityX) > SWIPE_THRESHOLD) {
        translationX.value = withSpring(
          Math.sign(event.velocityX) * SWIPE_DISTANCE,
          {
            velocity: event.velocityX,
          }
        );

        // Update index and trigger onSwipe callback
        activeIndex.value = withSpring(index + 1);
        runOnJS(onSwipe)(pokemon, liked);
        activeIndex.value = withSpring(activeIndex.value + 1);
      } else {
        // Return card to center if swipe was not decisive
        translationX.value = withSpring(0);
      }
    });

  // Loading state
  if (status === "pending") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#aeacac" />
      </View>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.card, animatedCard, {zIndex: numOfCards - index }]}
      >
        {/* Pokemon image */}
        <Image
          style={[StyleSheet.absoluteFillObject, styles.image]}
          source={{
            uri: pokemon.sprites.other["official-artwork"].front_default,
          }}
        />

        {/* Pokemon name */}
        <Text style={styles.name}>{pokemon.name}</Text>

        {/* Like indicator */}
        <Animated.View style={[styles.like, likeStyle]}>
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>

        {/* Nope indicator */}
        <Animated.View style={[styles.nope, nopeStyle]}>
          <Text style={styles.nopeText}>NOPE</Text>
        </Animated.View>

        {/* Experience circle */}
        <Animated.View style={[styles.experienceContainer, expCircleVisible]}>
          <BaseExperienceCircle 
            exp={pokemon.base_experience} 
            isCardActive={isCardActive}  // Pass the shared value directly
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
    width: pokemonCardWidth,
    aspectRatio: 1 / 1.67,
    borderRadius: 15,
    backgroundColor: "#aeacac",
    position: "absolute",
    padding: 15,
    // Shadow
    shadowColor: "#a8a7a7",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  loadingContainer: {
    position: "absolute",
    bottom: 20,
  },
  errorText: {
    color: "red",
    fontWeight: "bold",
  },
  name: {
    fontSize: 20,
    color: "#ffffff",
    zIndex: 1,
    fontWeight: "800",
    textTransform: "capitalize",
    position: "absolute",
    bottom: 20,
    left: 10,
  },
  image: {
    resizeMode: "contain",
  },
  like: {
    position: "absolute",
    top: 40,
    left: 10,
    backgroundColor: "#13e016",
    padding: 10,
    transform: [{ rotate: "-15deg" }],
  },
  likeText: {
    color: "#fbff03",
    fontWeight: "900",
  },
  nope: {
    position: "absolute",
    top: 40,
    right: 10,
    backgroundColor: "#fb1408",
    padding: 10,
    transform: [{ rotate: "35deg" }],
  },
  nopeText: {
    color: "#ffffff",
    fontWeight: "900",
  },
  experienceContainer: {
    position: "absolute",
    bottom: 20,
    right: 10,
    zIndex: 1,
  },
});

export default PokemonDetail;