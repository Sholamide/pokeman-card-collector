import React from "react";
import {
  View,
  FlatList,
  Image,
  Text,
  StyleSheet,
  Pressable,
  ListRenderItem,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { usePokemonStore } from "@/store/pokemonStore";
import { Pokemon } from "@/interface";

// Constants

const COLORS = {
  background: "#1a1a1a",
  card: "#fff",
  heartIcon: "#ef0707",
  emptyText: "#666",
};

// Types
interface PokemonCardProps {
  pokemon: Pokemon;
  onUnlike: (pokemonId: number) => void;
}

// Display liked Pokemon 
const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onUnlike }) => (
  <View style={styles.card}>
    <View style={styles.pokemonInfo}>
      <Image
        source={{
          uri: pokemon.sprites.other["official-artwork"].front_default,
        }}
        style={styles.image}
        accessible={true}
        accessibilityLabel={`Image of ${pokemon.name}`}
      />
      <Text style={styles.name}>{pokemon.name}</Text>
    </View>
    <Pressable 
      onPress={() => onUnlike(pokemon.id)}
      accessibilityLabel={`Unlike ${pokemon.name}`}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons size={24} name="heart" color={COLORS.heartIcon} />
    </Pressable>
  </View>
);

// Displays the user's liked pokemon collection
const LikedPokemonsScreen: React.FC = () => {
  const { likedPokemons, unlikePokemon } = usePokemonStore();

  // Memoized render item function to avoid recreation on each render
  const renderPokemon: ListRenderItem<Pokemon> = React.useCallback(
    ({ item }) => <PokemonCard pokemon={item} onUnlike={unlikePokemon} />,
    [unlikePokemon]
  );

  // Empty state handling
  if (likedPokemons.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No liked Pokémons yet!</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={likedPokemons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPokemon}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    height: "100%",
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    margin: 5,
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pokemonInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  image: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  name: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "capitalize",
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.emptyText,
  },
});

export default LikedPokemonsScreen;