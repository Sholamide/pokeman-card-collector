import { INITIALPAGEPARAM } from "@/constants";
import { Pokemon, PokemonList } from "@/interface";

//Fetches detailed information for a single Pokemon
const fetchPokemon = async (url: string): Promise<Pokemon> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch Pokemon data");
    }
    const data: Pokemon = await response.json();
    return data;
  } catch (error) {
    throw new Error("Error fetching Pokemon");
  }
};

//Fetches the list of Pokemon with their detailed information
export const fetchPokemons = async ({
  pageParam = INITIALPAGEPARAM,
}: {
  pageParam: unknown;
}) => {
  try {
    // Validate pageParam
    if (typeof pageParam !== "string") {
      throw new Error("Invalid pageParam");
    }
    // Fetch the Pokemon list
    const response = await fetch(pageParam);

    if (!response.ok) {
      throw new Error("Failed to fetch Pokemon list");
    }

    const data = await response.json();

    // Fetch detailed information for each Pokemon in parallel
    const detailedPokemons = await Promise.all(
      data.results.map(async (pokemon: any) => {
        return await fetchPokemon(pokemon.url);
      })
    );
    // Return combined data
    return {
      ...data,
      detailedPokemons,
    };
  } catch (error) {
    throw new Error("Error fetching Pokemon list");
  }
};
