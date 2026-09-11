import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialog } from '@angular/material/dialog';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { of, throwError, Subject, EMPTY } from 'rxjs';
import { vi, describe, beforeEach, it, expect } from 'vitest';

import { CocktailListComponent } from './cocktail-list.component';
import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { CocktailStateService } from '../../core/services/cocktail-state';
import { FavoritesService } from '../../core/services/favorites';
import { Cocktail } from '../../core/models/cocktail.model';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('CocktailListComponent', () => {
  let component: CocktailListComponent;
  let fixture: ComponentFixture<CocktailListComponent>;

  let cocktailApiMock: {
    getDefaultCocktails: ReturnType<typeof vi.fn>;
    searchCocktails: ReturnType<typeof vi.fn>;
  };
  let stateServiceMock: {
    searchType: ReturnType<typeof vi.fn>;
    searchQuery: ReturnType<typeof vi.fn>;
    showOnlyFavorites: ReturnType<typeof vi.fn>;
    scrollPosition: ReturnType<typeof vi.fn>;
    saveSearchState: ReturnType<typeof vi.fn>;
    saveShowOnlyFavorites: ReturnType<typeof vi.fn>;
    saveScrollPosition: ReturnType<typeof vi.fn>;
  };
  let favoritesServiceMock: {
    favorites: ReturnType<typeof vi.fn>;
    toggleFavorite: ReturnType<typeof vi.fn>;
    isFavorite: ReturnType<typeof vi.fn>;
  };
  let dialogMock: {
    open: ReturnType<typeof vi.fn>;
  };

  const mockCocktailList: Cocktail[] = [
    { id: '11007', name: 'Margarita', image: 'margarita.jpg' },
    { id: '11008', name: 'Mojito', image: 'mojito.jpg' },
  ];

  const mockFavoriteList: Cocktail[] = [{ id: '11008', name: 'Mojito', image: 'mojito.jpg' }];

  beforeEach(async () => {
    cocktailApiMock = {
      getDefaultCocktails: vi.fn().mockReturnValue(of(mockCocktailList)),
      searchCocktails: vi.fn().mockReturnValue(of(mockCocktailList)),
    };

    stateServiceMock = {
      searchType: vi.fn().mockReturnValue('name'),
      searchQuery: vi.fn().mockReturnValue(''),
      showOnlyFavorites: vi.fn().mockReturnValue(false),
      scrollPosition: vi.fn().mockReturnValue({ top: 0 }),
      saveSearchState: vi.fn(),
      saveShowOnlyFavorites: vi.fn(),
      saveScrollPosition: vi.fn(),
    };

    favoritesServiceMock = {
      favorites: vi.fn().mockReturnValue(mockFavoriteList),
      toggleFavorite: vi.fn(),
      isFavorite: vi.fn().mockReturnValue(false),
    };

    dialogMock = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of(true),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [CocktailListComponent],
      providers: [
        provideAnimationsAsync('noop'),
        { provide: CocktailApiService, useValue: cocktailApiMock },
        { provide: CocktailStateService, useValue: stateServiceMock },
        { provide: FavoritesService, useValue: favoritesServiceMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CocktailListComponent);
    component = fixture.componentInstance;
  });

  it('should create component instance', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit Initialization', () => {
    it('should load initial default catalog if no initial search query exists', () => {
      fixture.detectChanges();

      expect(cocktailApiMock.getDefaultCocktails).toHaveBeenCalledTimes(1);
      expect(component.rawCocktails()).toEqual(mockCocktailList);
      expect(component.isLoading()).toBe(false);
    });

    it('should trigger search query fetch on init if initial search query is present in state', () => {
      stateServiceMock.searchQuery.mockReturnValue('Margarita');
      fixture = TestBed.createComponent(CocktailListComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();

      expect(cocktailApiMock.searchCocktails).toHaveBeenCalledWith('name', 'Margarita');
      expect(component.rawCocktails()).toEqual(mockCocktailList);
    });
  });

  describe('Form Controls and Dynamic Validators', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update query validators and reload initial catalog when searchType changes to "id"', () => {
      const typeControl = component.searchForm.controls.searchType;
      const queryControl = component.searchForm.controls.query;

      typeControl.setValue('id');

      queryControl.setValue('abc');
      expect(queryControl.valid).toBe(false);

      queryControl.setValue('123');
      expect(queryControl.valid).toBe(true);

      expect(cocktailApiMock.getDefaultCocktails).toHaveBeenCalled();
    });

    it('should execute fetchCocktails when query changes with valid input after debounce', async () => {
      const queryControl = component.searchForm.controls.query;

      queryControl.setValue('Mojito');
      await delay(450);

      expect(cocktailApiMock.searchCocktails).toHaveBeenCalledWith('name', 'Mojito');
    });

    it('should reload initial catalog when query is emptied', async () => {
      const queryControl = component.searchForm.controls.query;

      queryControl.setValue('');
      await delay(450);

      expect(cocktailApiMock.getDefaultCocktails).toHaveBeenCalled();
    });
  });

  describe('API Handling (loadInitialCatalog & fetchCocktails)', () => {
    it('should handle API error gracefully in loadInitialCatalog', () => {
      cocktailApiMock.getDefaultCocktails.mockReturnValue(throwError(() => new Error('API Error')));

      component.loadInitialCatalog();

      expect(component.rawCocktails()).toEqual([]);
      expect(component.isLoading()).toBe(false);
    });

    it('should handle API error gracefully in fetchCocktails', () => {
      cocktailApiMock.searchCocktails.mockReturnValue(throwError(() => new Error('API Error')));

      component.fetchCocktails('name', 'Unknown');

      expect(component.rawCocktails()).toEqual([]);
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Favorites and Displayed Cocktails Filter', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return rawCocktails in displayedCocktails when showOnlyFavorites is false', () => {
      component.showOnlyFavorites.set(false);
      expect(component.displayedCocktails()).toEqual(mockCocktailList);
    });

    it('should return favorites in displayedCocktails when showOnlyFavorites is true', () => {
      component.showOnlyFavorites.set(true);
      expect(component.displayedCocktails()).toEqual(mockFavoriteList);
    });

    it('should update showOnlyFavorites and save state when toggleFavoritesView is called', () => {
      component.toggleFavoritesView(true);

      expect(component.showOnlyFavorites()).toBe(true);
      expect(stateServiceMock.saveShowOnlyFavorites).toHaveBeenCalledWith(true);
    });

    it('should delegate favorite toggle to FavoritesService', () => {
      const item = mockCocktailList[0];
      component.toggleFavorite(item);

      expect(favoritesServiceMock.toggleFavorite).toHaveBeenCalledWith(item);
    });
  });

  describe('Dialogs and Helpers', () => {
    it('should return cocktail id in trackById', () => {
      const item = mockCocktailList[0];
      expect(component.trackById(0, item)).toBe(item.id);
    });
  });

  describe('Viewport and Scroll Listening', () => {
    it('should attach scroll listener and save scroll position when viewport changes', async () => {
      const scrollSubject = new Subject<Event>();
      const viewportMock = {
        elementScrolled: () => scrollSubject.asObservable(),
        measureScrollOffset: vi.fn().mockReturnValue(150),
      } as unknown as CdkVirtualScrollViewport;

      component.viewport = viewportMock;

      scrollSubject.next(new Event('scroll'));
      await delay(250);

      expect(stateServiceMock.saveScrollPosition).toHaveBeenCalledWith(150);
    });
  });
});
