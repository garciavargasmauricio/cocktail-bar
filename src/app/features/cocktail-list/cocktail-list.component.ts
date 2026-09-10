import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';

import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { Cocktail, SearchType } from '../../core/models/cocktail.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CocktailDetailDialogComponent } from '../cocktail-detail-dialog/cocktail-detail-dialog';
import { CocktailStateService } from '../../core/services/cocktail-state';
import { FavoritesService } from '../../core/services/favorites';

/**
 * Component responsible for rendering the cocktail catalog grid, handling dynamic search forms,
 * applying client-side input validations, and managing loading states.
 */
@Component({
  selector: 'app-cocktail-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatButtonToggleModule,
    ScrollingModule,
    MatDialogModule,
  ],
  templateUrl: './cocktail-list.component.html',
  styleUrl: './cocktail-list.component.scss',
})
export class CocktailListComponent implements OnInit, AfterViewInit, OnDestroy {
  //To capture the scroll data
  private viewportInstance?: CdkVirtualScrollViewport;

  /**
   * Setter @if (isLoading) rendering
   */
  @ViewChild(CdkVirtualScrollViewport) set viewport(v: CdkVirtualScrollViewport | undefined) {
    if (v && v !== this.viewportInstance) {
      this.viewportInstance = v;
      this.attachScrollListener(v);
    }
  }

  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly cocktailApi = inject(CocktailApiService);
  private readonly stateService = inject(CocktailStateService);
  readonly favoritesService = inject(FavoritesService);
  private readonly destroy$ = new Subject<void>();

  /** Signal containing the raw cocktail list retrieved from the API search query */
  readonly rawCocktails = signal<Cocktail[]>([]);

  /** Signal indicating whether an HTTP search request is currently in progress */
  readonly isLoading = signal<boolean>(false);

  /**
   * Computed list of cocktails displayed in the Virtual Scroll.
   * Filters by favorites if `showOnlyFavorites` is true.
   */
  readonly displayedCocktails = computed(() => {
    if (this.showOnlyFavorites()) {
      return this.favoritesService.favorites();
    }
    return this.rawCocktails();
  });

  /** Signal toggle flag indicating whether to display only favorite drinks */
  readonly showOnlyFavorites = signal<boolean>(this.stateService.showOnlyFavorites());

  // Get filter search values stored
  private readonly initialSearchType = this.stateService.searchType();
  private readonly initialSearchQuery = this.stateService.searchQuery();

  /**
   * Reactive Form definition managing search filter type and input text query with dynamic validators.
   */
  readonly searchForm = this.fb.group({
    searchType: this.fb.nonNullable.control<SearchType>(this.initialSearchType),
    query: this.fb.nonNullable.control(this.initialSearchQuery, [
      Validators.pattern(/^[a-zA-Z\s]*$/),
      Validators.maxLength(50),
    ]),
  });

  /**
   * TrackBy function for CDK Virtual Scroll performance optimization.
   */
  trackById(_index: number, item: Cocktail): string {
    return item.id;
  }

  /**
   * Lifecycle hook triggered after component initialization.
   * Sets up reactive form listeners and triggers an initial default search.
   */
  ngOnInit(): void {
    this.setupFormSubscriptions();

    const initialQuery = this.stateService.searchQuery();
    if (initialQuery.trim()) {
      // Load saved state of the search
      this.fetchCocktails(this.stateService.searchType(), initialQuery);
    } else {
      this.loadInitialCatalog(); //Loads the initial catalog based on alcoholic drinks
    }
  }

  ngAfterViewInit() {
    if (this.viewport) {
      this.viewport
        .elementScrolled()
        .pipe(debounceTime(200), takeUntil(this.destroy$))
        .subscribe(() => {
          if (this.viewport) {
            const offset = this.viewport.measureScrollOffset('top');
            this.stateService.saveScrollPosition(offset);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Attaches a debounced scroll event listener to the CDK Virtual Scroll Viewport
   * to automatically persist the active scroll position into local storage.
   *
   * @param viewport - The active CDK Virtual Scroll Viewport instance.
   * @private
   */
  private attachScrollListener(viewport: CdkVirtualScrollViewport): void {
    viewport
      .elementScrolled()
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => {
        const offset = viewport.measureScrollOffset('top');
        this.stateService.saveScrollPosition(offset);
      });
  }

  /**
   * Restores the previously persisted scroll position in the viewport after
   * data fetching and DOM virtual node mounting are complete.
   *
   * @private
   */
  private restoreScrollPosition(): void {
    const savedPos = this.stateService.scrollPosition();
    if (savedPos.top > 0) {
      setTimeout(() => {
        this.viewportInstance?.scrollToOffset(savedPos.top);
      }, 50);
    }
  }

  /**
   * Fetches the default catalog of cocktails from the API, updates the component state,
   * resets the active search query state, and restores the viewport scroll position upon success.
   */
  loadInitialCatalog(): void {
    this.isLoading.set(true);
    this.stateService.saveSearchState(this.searchForm.controls.searchType.value, '');

    this.cocktailApi.getDefaultCocktails().subscribe({
      next: (results) => {
        this.rawCocktails.set(results);
        this.isLoading.set(false);
        this.restoreScrollPosition();
      },
      error: () => {
        this.rawCocktails.set([]);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Configures dynamic form control validators based on selected search type
   * and sets up a debounced value listener for auto-executing search requests.
   *
   * @private
   */
  private setupFormSubscriptions(): void {
    // Dynamically swap validators when search type changes
    this.searchForm.controls.searchType.valueChanges.subscribe((type) => {
      const queryControl = this.searchForm.controls.query;
      queryControl.setValue('');

      if (type === 'id') {
        queryControl.setValidators([Validators.pattern(/^[0-9]*$/)]);
      } else {
        queryControl.setValidators([Validators.pattern(/^[a-zA-Z\s]*$/), Validators.maxLength(50)]);
      }
      queryControl.updateValueAndValidity();

      // If the filter changed, refresh the initial catalog
      this.loadInitialCatalog();
    });

    // Debounce search input to avoid spamming API endpoints
    this.searchForm.controls.query.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((query) => {
        const trimmedQuery = query.trim();
        if (this.searchForm.valid && trimmedQuery) {
          this.fetchCocktails(this.searchForm.controls.searchType.value, query);
        } else if (!trimmedQuery) {
          // If query is empty fresh the initial catalog
          this.loadInitialCatalog();
        }
      });
  }

  /**
   * Fetches cocktails from the API service and updates reactive signal state.
   *
   * @param type - The active filter type ('name', 'ingredient', or 'id').
   * @param query - The user-provided search text query.
   */
  fetchCocktails(type: SearchType, query: string): void {
    this.isLoading.set(true);
    this.stateService.saveSearchState(type, query); //Save filter state

    this.cocktailApi.searchCocktails(type, query).subscribe({
      next: (results) => {
        this.rawCocktails.set(results);
        this.isLoading.set(false);
        this.restoreScrollPosition();
      },
      error: () => {
        this.rawCocktails.set([]);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Opens the cocktail detail dialog modal to display full information for the selected cocktail.
   *
   * @param cocktail - The cocktail object whose details will be loaded in the dialog.
   */
  openDetails(cocktail: Cocktail): void {
    this.dialog.open(CocktailDetailDialogComponent, {
      data: { cocktailId: cocktail.id },
      width: '90%',
      maxWidth: '600px',
    });
  }

  /**
   * Toggles a cocktail's favorite status.
   *
   * @param cocktail - The selected cocktail object.
   */
  toggleFavorite(cocktail: Cocktail): void {
    this.favoritesService.toggleFavorite(cocktail);
  }

  /**
   * Toggles the view mode flag between all cocktails and favorite cocktails.
   *
   * @param onlyFavorites - Boolean flag stating whether to filter by favorites.
   */
  toggleFavoritesView(onlyFavorites: boolean): void {
    this.showOnlyFavorites.set(onlyFavorites);
    this.stateService.saveShowOnlyFavorites(onlyFavorites);
  }
}
