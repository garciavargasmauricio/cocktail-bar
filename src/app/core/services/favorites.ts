import { Injectable, signal } from '@angular/core';
import { Cocktail } from '../models/cocktail.model';

export const FAVORITES_KEY = 'cocktail_favorites';

/**
 * Service responsible for managing favorite cocktails, persisting them in local storage,
 * and synchronizing state across multiple browser tabs in real time.
 */
@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  /** Reactive Signal containing the list of favorite cocktails */
  readonly favorites = signal<Cocktail[]>(this.loadFavoritesFromStorage());

  constructor() {
    this.listenToCrossTabChanges();
  }

  /**
   * Checks whether a specific cocktail is currently marked as favorite.
   *
   * @param cocktailId - The ID of the cocktail to check.
   * @returns True if the cocktail is in favorites, false otherwise.
   */
  isFavorite(cocktailId: string): boolean {
    return this.favorites().some((item) => item.id === cocktailId);
  }

  /**
   * Toggles the favorite status of a cocktail (adds if not present, removes if present).
   *
   * @param cocktail - The cocktail object to toggle.
   */
  toggleFavorite(cocktail: Cocktail): void {
    const current = this.favorites();
    const exists = current.some((item) => item.id === cocktail.id);

    let updated: Cocktail[];
    if (exists) {
      updated = current.filter((item) => item.id !== cocktail.id);
    } else {
      updated = [...current, cocktail];
    }

    this.saveFavorites(updated);
  }

  /**
   * Persists the favorites array to local storage and updates the signal.
   *
   * @param favs - Updated list of favorite cocktails.
   * @private
   */
  private saveFavorites(favs: Cocktail[]): void {
    this.favorites.set(favs);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  }

  /**
   * Reads and parses persisted favorites from local storage.
   *
   * @private
   * @returns Array of favorite cocktails or empty array if none found.
   */
  private loadFavoritesFromStorage(): Cocktail[] {
    const data = localStorage.getItem(FAVORITES_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading favorites from storage', e);
      return [];
    }
  }

  /**
   * Listens to window storage events to synchronize favorite status
   * across multiple open browser tabs automatically.
   *
   * @private
   */
  private listenToCrossTabChanges(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === FAVORITES_KEY) {
        this.favorites.set(this.loadFavoritesFromStorage());
      }
    });
  }
}
