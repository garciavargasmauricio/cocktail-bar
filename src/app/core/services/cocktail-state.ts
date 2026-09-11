import { Injectable, signal } from '@angular/core';
import { SearchType } from '../models/cocktail.model';

export interface ViewportScrollPosition {
  top: number;
}

/** Local storage key used for persisting search filter criteria */
export const SEARCH_STATE_KEY = 'cocktail_search_state';

/** Local storage key used for persisting viewport scroll offset */
export const SCROLL_POS_KEY = 'cocktail_scroll_pos';

/** Local storage key used for persisting favorites */
export const SHOW_ONLY_FAVS_KEY = 'cocktail_show_only_favs';

/**
 * Service responsible for managing and persisting the application state,
 * including active search parameters and virtual scroll position across browser tabs and page reloads.
 */
@Injectable({
  providedIn: 'root',
})
export class CocktailStateService {
  /** Signal holding the current search criteria type ('name', 'ingredient', or 'id') */
  readonly searchType = signal<SearchType>('name');

  /** Signal holding the active text search query */
  readonly searchQuery = signal<string>('');

  /** Signal holding the view toggle state (true = show only favorites, false = show all) */
  readonly showOnlyFavorites = signal<boolean>(false);

  /** Signal holding the last recorded viewport scroll position */
  readonly scrollPosition = signal<ViewportScrollPosition>({ top: 0 });

  constructor() {
    this.restoreState();
  }

  /**
   * Persists the favorites view mode toggle in signal and local storage.
   *
   * @param showOnlyFavs - Boolean flag indicating if only favorites are displayed.
   */
  saveShowOnlyFavorites(showOnlyFavs: boolean): void {
    this.showOnlyFavorites.set(showOnlyFavs);
    localStorage.setItem(SHOW_ONLY_FAVS_KEY, JSON.stringify(showOnlyFavs));
  }

  /**
   * Persists the active search filter type and text query in both reactive state signals and local storage.
   *
   * @param type - The selected search criteria type.
   * @param query - The user-entered search text string.
   */
  saveSearchState(type: SearchType, query: string): void {
    this.searchType.set(type);
    this.searchQuery.set(query);
    localStorage.setItem(SEARCH_STATE_KEY, JSON.stringify({ type, query }));
  }

  /**
   * Persists the viewport top scroll position offset in both reactive state signal and local storage.
   *
   * @param top - The vertical scroll offset in pixels.
   */
  saveScrollPosition(top: number): void {
    const pos = { top };
    this.scrollPosition.set(pos);
    localStorage.setItem(SCROLL_POS_KEY, JSON.stringify(pos));
  }

  /**
   * Restores previously persisted search state and scroll position from local storage during service initialization.
   *
   * @private
   */
  private restoreState(): void {
    const savedSearch = localStorage.getItem(SEARCH_STATE_KEY);
    if (savedSearch) {
      try {
        const { type, query } = JSON.parse(savedSearch);
        if (type) this.searchType.set(type);
        if (query !== undefined) this.searchQuery.set(query);
      } catch (e) {
        console.error('Error restoring search state', e);
      }
    }
    // Restore view mode toggle
    const savedFavsToggle = localStorage.getItem(SHOW_ONLY_FAVS_KEY);
    if (savedFavsToggle !== null) {
      try {
        this.showOnlyFavorites.set(JSON.parse(savedFavsToggle));
      } catch (e) {
        console.error('Error restoring favorites view state', e);
      }
    }

    const savedScroll = localStorage.getItem(SCROLL_POS_KEY);
    if (savedScroll) {
      try {
        const pos = JSON.parse(savedScroll);
        this.scrollPosition.set(pos);
      } catch (e) {
        console.error('Error restoring scroll position', e);
      }
    }
  }
}
