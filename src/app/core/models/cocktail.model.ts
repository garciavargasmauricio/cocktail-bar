export interface CocktailDto {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  strInstructions?: string;
  [key: string]: string | null | undefined;
}

export interface Ingredient {
  name: string;
  measure: string;
}

export interface Cocktail {
  id: string;
  name: string;
  image: string;
  instructions?: string;
  ingredients?: Ingredient[];
}

export interface CocktailApiResponse {
  drinks: CocktailDto[] | null;
}

export type SearchType = 'name' | 'ingredient' | 'id';

export interface SearchFilter {
  type: SearchType;
  query: string;
}
