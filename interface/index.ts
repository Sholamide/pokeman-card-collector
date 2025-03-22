// pokemon ability
interface SpriteUrls {
  back_default: string;
  back_shiny: string;
  front_default: string;
  front_shiny: string;
  other: {
    dream_world: {
      front_default: string;
    };
    home: {
      front_default: string;
      front_shiny: string;
    };
    "official-artwork": {
      front_default: string;
      front_shiny: string;
    };
  };
}

interface Type {
  slot: number; // Slot number
  type: { name: string; url: string }; // Type name (e.g., Grass, Poison)
}

export interface Pokemon {
  id: number;
  base_experience: number;
  name: string;
  sprites: SpriteUrls;
  types: Type[];
  weight: number;
}

export interface PokemonList {
  detailedPokemons?: Pokemon[];
  count: number;
  next: string;
  previous: string;
  results: { name: string; url: string }[];
}
