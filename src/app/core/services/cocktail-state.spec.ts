import { TestBed } from '@angular/core/testing';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import { SearchType } from '../models/cocktail.model';
import { CocktailStateService } from './cocktail-state';

describe('CocktailStateService', () => {
  let service: CocktailStateService;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and have default initial signal values when localStorage is empty', () => {
    TestBed.configureTestingModule({
      providers: [CocktailStateService],
    });
    service = TestBed.inject(CocktailStateService);

    expect(service).toBeTruthy();
    expect(service.searchType()).toBe('name');
    expect(service.searchQuery()).toBe('');
    expect(service.showOnlyFavorites()).toBe(false);
    expect(service.scrollPosition()).toEqual({ top: 0 });
  });

  describe('restoreState (constructor logic)', () => {
    it('should restore search state from localStorage on service initialization', () => {
      const mockSearchState = { type: 'ingredient' as SearchType, query: 'Gin' };
      localStorage.setItem('cocktail_search_state', JSON.stringify(mockSearchState));

      TestBed.configureTestingModule({
        providers: [CocktailStateService],
      });
      service = TestBed.inject(CocktailStateService);

      expect(service.searchType()).toBe('ingredient');
      expect(service.searchQuery()).toBe('Gin');
    });

    it('should restore favorites view mode toggle from localStorage on initialization', () => {
      localStorage.setItem('cocktail_show_only_favs', JSON.stringify(true));

      TestBed.configureTestingModule({
        providers: [CocktailStateService],
      });
      service = TestBed.inject(CocktailStateService);

      expect(service.showOnlyFavorites()).toBe(true);
    });

    it('should restore scroll position from localStorage on initialization', () => {
      const mockScrollPos = { top: 450 };
      localStorage.setItem('cocktail_scroll_pos', JSON.stringify(mockScrollPos));

      TestBed.configureTestingModule({
        providers: [CocktailStateService],
      });
      service = TestBed.inject(CocktailStateService);

      expect(service.scrollPosition()).toEqual(mockScrollPos);
    });

    it('should catch and log error gracefully if stored JSON is corrupt', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      localStorage.setItem('cocktail_search_state', 'invalid-json-{');
      localStorage.setItem('cocktail_show_only_favs', 'invalid-json-{');
      localStorage.setItem('cocktail_scroll_pos', 'invalid-json-{');

      TestBed.configureTestingModule({
        providers: [CocktailStateService],
      });
      service = TestBed.inject(CocktailStateService);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
      expect(service.searchType()).toBe('name');
      expect(service.searchQuery()).toBe('');
      expect(service.showOnlyFavorites()).toBe(false);
      expect(service.scrollPosition()).toEqual({ top: 0 });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('saveShowOnlyFavorites', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [CocktailStateService],
      });
      service = TestBed.inject(CocktailStateService);
    });

    it('should update showOnlyFavorites signal and persist in localStorage', () => {
      service.saveShowOnlyFavorites(true);

      expect(service.showOnlyFavorites()).toBe(true);
      expect(localStorage.getItem('cocktail_show_only_favs')).toBe('true');
    });
  });

  describe('saveSearchState', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [CocktailStateService],
      });
      service = TestBed.inject(CocktailStateService);
    });

    it('should update searchType and searchQuery signals and persist in localStorage', () => {
      const type: SearchType = 'id';
      const query = '11007';

      service.saveSearchState(type, query);

      expect(service.searchType()).toBe('id');
      expect(service.searchQuery()).toBe('11007');
      expect(localStorage.getItem('cocktail_search_state')).toBe(
        JSON.stringify({ type: 'id', query: '11007' }),
      );
    });
  });

  describe('saveScrollPosition', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [CocktailStateService],
      });
      service = TestBed.inject(CocktailStateService);
    });

    it('should update scrollPosition signal and persist in localStorage', () => {
      const topOffset = 280;

      service.saveScrollPosition(topOffset);

      expect(service.scrollPosition()).toEqual({ top: 280 });
      expect(localStorage.getItem('cocktail_scroll_pos')).toBe(JSON.stringify({ top: 280 }));
    });
  });
});
