import { TestBed } from '@angular/core/testing';
import { Cocktail } from '../models/cocktail.model';
import { FavoritesService } from './favorites';

describe('FavoritesService', () => {
  let service: FavoritesService;
  const FAVORITES_KEY = 'cocktail_favorites';

  const mockCocktail1: Cocktail = {
    id: '11007',
    name: 'Margarita',
    image: 'https://example.com/margarita.jpg',
  };

  const mockCocktail2: Cocktail = {
    id: '11008',
    name: 'Mojito',
    image: 'https://example.com/mojito.jpg',
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [FavoritesService],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and initialize with empty array if local storage is empty', () => {
    service = TestBed.inject(FavoritesService);

    expect(service).toBeTruthy();
    expect(service.favorites()).toEqual([]);
  });

  it('should load initial favorites from localStorage on creation', () => {
    const initialFavs = [mockCocktail1];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(initialFavs));

    service = TestBed.inject(FavoritesService);

    expect(service.favorites()).toEqual(initialFavs);
  });

  describe('isFavorite', () => {
    beforeEach(() => {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([mockCocktail1]));
      service = TestBed.inject(FavoritesService);
    });

    it('should return false if cocktail is not in favorites', () => {
      expect(service.isFavorite('11008')).toBeFalsy();
    });
  });

  describe('toggleFavorite', () => {
    beforeEach(() => {
      service = TestBed.inject(FavoritesService);
    });

    it('should add cocktail to favorites when it is not present', () => {
      service.toggleFavorite(mockCocktail1);

      expect(service.favorites()).toEqual([mockCocktail1]);
      expect(JSON.parse(localStorage.getItem(FAVORITES_KEY)!)).toEqual([mockCocktail1]);
    });

    it('should remove cocktail from favorites when it is already present', () => {
      service.toggleFavorite(mockCocktail1);
      service.toggleFavorite(mockCocktail2);
      expect(service.favorites().length).toBe(2);

      // Remove mockCocktail1
      service.toggleFavorite(mockCocktail1);

      expect(service.favorites()).toEqual([mockCocktail2]);
      expect(JSON.parse(localStorage.getItem(FAVORITES_KEY)!)).toEqual([mockCocktail2]);
    });
  });

  describe('listenToCrossTabChanges', () => {
    it('should update favorites signal when a storage event from another tab occurs with FAVORITES_KEY', () => {
      service = TestBed.inject(FavoritesService);
      expect(service.favorites()).toEqual([]);

      const externalFavs = [mockCocktail2];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(externalFavs));

      const storageEvent = new StorageEvent('storage', {
        key: FAVORITES_KEY,
        newValue: JSON.stringify(externalFavs),
      });
      window.dispatchEvent(storageEvent);

      expect(service.favorites()).toEqual(externalFavs);
    });

    it('should ignore storage events with keys other than FAVORITES_KEY', () => {
      service = TestBed.inject(FavoritesService);

      const storageEvent = new StorageEvent('storage', {
        key: 'other_unrelated_key',
        newValue: 'some_value',
      });
      window.dispatchEvent(storageEvent);

      expect(service.favorites()).toEqual([]);
    });
  });
});
