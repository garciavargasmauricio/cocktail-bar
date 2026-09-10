import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Cocktail,
  CocktailApiResponse,
  Ingredient,
  SearchType,
  CocktailDto,
} from '../models/cocktail.model';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
/**
 * Service responsible for fetching cocktail data from TheCocktailDB public API
 * and mapping raw DTO responses into clean domain models.
 */
@Injectable({
  providedIn: 'root',
})
export class CocktailApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://www.thecocktaildb.com/api/json/v1/1';

  /**
   * Performs cocktail searches based on the specified search type.
   *
   * @param type - The search type filter ('name', 'ingredient', or 'id').
   * @param query - The user input search query.
   * @returns An Observable emitting an array of mapped cocktails or an empty array if invalid.
   */
  searchCocktails(type: SearchType, query: string): Observable<Cocktail[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return of([]);

    switch (type) {
      case 'name':
        return this.http
          .get<CocktailApiResponse>(`${this.baseUrl}/search.php?s=${cleanQuery}`)
          .pipe(
            map((res) => (res.drinks ? res.drinks.map((dto) => this.mapDtoToCocktail(dto)) : [])),
          );

      case 'ingredient':
        return this.http
          .get<CocktailApiResponse>(`${this.baseUrl}/filter.php?i=${cleanQuery}`)
          .pipe(
            map((res) =>
              res.drinks ? res.drinks.map((dto) => this.mapBasicDtoCocktail(dto)) : [],
            ),
          );

      case 'id':
        return this.getCocktailById(cleanQuery).pipe(
          map((cocktail) => (cocktail ? [cocktail] : [])),
        );

      default:
        return of([]);
    }
  }

  /**
   * Retrieves detailed information for a specific cocktail by its unique ID.
   *
   * @param id - The numeric cocktail ID as a string.
   * @returns An Observable emitting the mapped Cocktail object or `null` if not found.
   */
  getCocktailById(id: string): Observable<Cocktail | null> {
    return this.http.get<CocktailApiResponse>(`${this.baseUrl}/lookup.php?i=${id}`).pipe(
      map((res) => {
        if (!res.drinks || res.drinks.length === 0) return null;
        return this.mapDtoToCocktail(res.drinks[0]);
      }),
    );
  }

  /**
   * Maps a full API DTO response object to a clean `Cocktail` domain model.
   * Dynamically extracts up to 15 ingredients and their corresponding measures.
   *
   * @param dto - Raw DTO object from TheCocktailDB.
   * @returns A normalized `Cocktail` object.
   * @private
   */
  private mapDtoToCocktail(dto: CocktailDto): Cocktail {
    const ingredients: Ingredient[] = [];

    for (let i = 1; i <= 15; i++) {
      const name = dto[`strIngredient${i}`];
      const measure = dto[`strMeasure${i}`];

      if (name && name.trim()) {
        ingredients.push({
          name: name.trim(),
          measure: measure ? measure.trim() : '',
        });
      }
    }

    return {
      id: dto['idDrink'],
      name: dto['strDrink'],
      image: dto['strDrinkThumb'],
      instructions: dto['strInstructions'] || 'No instructions available.',
      ingredients,
    };
  }

  /**
   * Maps a simplified API DTO object (e.g., from ingredient filter response)
   * to a basic `Cocktail` object.
   *
   * @param dto - Simplified DTO object from the API.
   * @returns Basic `Cocktail` object containing ID, name, and image thumbnail.
   * @private
   */
  private mapBasicDtoCocktail(dto: CocktailDto): Cocktail {
    return {
      id: dto['idDrink'],
      name: dto['strDrink'],
      image: dto['strDrinkThumb'],
    };
  }
}
