import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Pokemon } from "@/interface";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PokemonStore {
  currentIndex: number;
  likedPokemons: Pokemon[];
  dislikedPokemons: Pokemon[];
  setCurrentIndex: (index: number) => void;
  likePokemon: (pokemon: Pokemon) => void;
  unlikePokemon: (pokemonId: number) => void;
  dislikePokemon: (pokemon: Pokemon) => void;
  resetStore: () => void;
}

//Initial Pokemon store state
const initialState = {
  currentIndex: 0,
  likedPokemons: [],
  dislikedPokemons: [],
};

export const usePokemonStore = create<PokemonStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Update the current Pokemon index
      setCurrentIndex: (index: number) => set({ currentIndex: index }),

      //Add a Pokemon to the liked list
      likePokemon: (pokemon: Pokemon) => {
        const { likedPokemons } = get();

        // Check if Pokemon is already liked to avoid duplicates
        if (!likedPokemons.some((p) => p.id === pokemon.id)) {
          set({
            likedPokemons: [...likedPokemons, pokemon],
            // Remove from disliked if it was there
            dislikedPokemons: get().dislikedPokemons.filter(
              (p) => p.id !== pokemon.id
            ),
          });
        }
      },

      //Remove a Pokemon from liked and add to disliked
      unlikePokemon: (pokemonId: number) => {
        const { likedPokemons, dislikedPokemons } = get();
        const pokemonToUnlike = likedPokemons.find((p) => p.id === pokemonId);

        if (pokemonToUnlike) {
          set({
            likedPokemons: likedPokemons.filter((p) => p.id !== pokemonId),
            dislikedPokemons: [...dislikedPokemons, pokemonToUnlike],
          });
        }
      },

      //Add a Pokemon to the disliked list
      dislikePokemon: (pokemon: Pokemon) => {
        const { dislikedPokemons } = get();

        // Check if Pokemon is already disliked to avoid duplicates
        if (!dislikedPokemons.some((p) => p.id === pokemon.id)) {
          set({
            dislikedPokemons: [...dislikedPokemons, pokemon],

            // Remove from liked if it was there
            likedPokemons: get().likedPokemons.filter(
              (p) => p.id !== pokemon.id
            ),
          });
        }
      },

      //Reset store
      resetStore: () => set(initialState),
    }),
    {
      name: "pokemon-storage", // Name for localStorage key
      storage: createJSONStorage(() => AsyncStorage),
      // Use localStorage for persistence
      partialize: (state) => ({
        // Only persist these parts of the state
        likedPokemons: state.likedPokemons,
        dislikedPokemons: state.dislikedPokemons,
      }),
    }
  )
);
