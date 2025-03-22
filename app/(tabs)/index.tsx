import React, { useMemo, useEffect } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from "react-native-reanimated";

import { fetchPokemons } from "@/api/pokemon";
import { Pokemon, PokemonList } from "@/interface";
import PokemonDetail from "@/components/pokemon-detail";
import { usePokemonStore } from "@/store/pokemonStore";

const POKEMON_API_URL = "https://pokeapi.co/api/v2/pokemon?limit=20&offset=0";
const PREFETCH_THRESHOLD = 3; // Number of cards before end to trigger next page load

//loading screen for data fetching state
const LoadingScreen = () => (
  <View style={styles.centeredContainer}>
    <ActivityIndicator size="large" color="#aeacac" />
  </View>
);

//error screen for data fetching state
const ErrorScreen = () => (
  <View style={styles.centeredContainer}>
    <Text style={styles.errorText}>An Error occured</Text>
  </View>
);

export default function PokemonHomeScreen() {
  const { currentIndex, setCurrentIndex, likePokemon, dislikePokemon } =
    usePokemonStore();
  const activeIndex = useSharedValue<number>(currentIndex);

  // Fetch Pokemon data with pagination
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    status,
    isFetchingNextPage,
  } = useInfiniteQuery<PokemonList>({
    queryKey: ["pokemons"],
    queryFn: fetchPokemons,
    initialPageParam: POKEMON_API_URL,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
    getPreviousPageParam: (firstPage) => firstPage.previous ?? undefined,
  });

  // Flatten all pokemon results into a single array
  const allPokemons = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.results);
  }, [data]);

  // Get total number of Pokémon loaded so far
  const totalPokemonCount = useMemo(() => {
    return allPokemons.length;
  }, [allPokemons]);

  // Track active index changes
  useAnimatedReaction(
    () => activeIndex.value,
    (value, prevValue) => {
      if (value !== prevValue && Math.floor(value) !== currentIndex) {
        runOnJS(setCurrentIndex)(Math.floor(value));
      }
    }
  );

  // Auto-fetch more Pokemon when approaching the end
  useEffect(() => {
    const shouldFetchMore =
      currentIndex + PREFETCH_THRESHOLD >= totalPokemonCount;

    if (shouldFetchMore && hasNextPage && !isFetchingNextPage) {
      fetchNextPage().catch((error) =>
        console.error("Failed to fetch next page:", error)
      );
    }
  }, [
    currentIndex,
    totalPokemonCount,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  // Handle swipe response (like or dislike)
  const handleSwipe = (pokemon: Pokemon, liked: boolean) => {
    if (liked) {
      likePokemon(pokemon);
    } else {
      dislikePokemon(pokemon);
    }
  };

  // Render based on query status
  if (status === "pending") {
    return <LoadingScreen />;
  }

  if (status === "error") {
    return <ErrorScreen />;
  }

  return (
    <View style={styles.container}>
      {allPokemons.map((pokemon, index) => (
        <PokemonDetail
          key={`pokemon-${pokemon.name}-${index}`}
          url={pokemon.url}
          index={index}
          activeIndex={activeIndex}
          numOfCards={totalPokemonCount}
          onSwipe={handleSwipe}
        />
      ))}
      {isFetchingNextPage && (
        <ActivityIndicator
          size="large"
          color="#3498db"
          style={styles.bottomLoader}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "red",
    fontWeight: "bold",
  },
  loadMoreButton: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
    alignItems: "center",
  },
  loadMoreText: {
    color: "white",
    fontWeight: "bold",
  },
  bottomLoader: {
    position: "absolute",
    bottom: 20,
  },
});
