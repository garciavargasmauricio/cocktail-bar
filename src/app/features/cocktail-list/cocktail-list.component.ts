import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { Cocktail, SearchType } from '../../core/models/cocktail.model';

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
  ],
  templateUrl: './cocktail-list.component.html',
  styleUrl: './cocktail-list.component.scss',
})
export class CocktailListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cocktailApi = inject(CocktailApiService);

  /** Signal containing the raw cocktail list retrieved from the API search query */
  readonly cocktails = signal<Cocktail[]>([]);

  /** Signal indicating whether an HTTP search request is currently in progress */
  readonly isLoading = signal<boolean>(false);

  /** Signal toggle flag indicating whether to display only favorite drinks */
  readonly showOnlyFavorites = signal<boolean>(false);

  /**
   * Computed signal emitting the active list of cocktails to render in the grid.
   */
  readonly displayedCocktails = computed(() => {
    return this.cocktails();
  });

  /**
   * Reactive Form definition managing search filter type and input text query with dynamic validators.
   */
  readonly searchForm = this.fb.group({
    searchType: this.fb.nonNullable.control<SearchType>('name'),
    query: this.fb.nonNullable.control('', [
      Validators.pattern(/^[a-zA-Z\s]*$/),
      Validators.maxLength(50),
    ]),
  });

  /**
   * Lifecycle hook triggered after component initialization.
   * Sets up reactive form listeners and triggers an initial default search.
   */
  ngOnInit(): void {
    this.setupFormSubscriptions();
    this.fetchCocktails('name', 'Margarita');
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
    });

    // Debounce search input to avoid spamming API endpoints
    this.searchForm.controls.query.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((query) => {
        if (this.searchForm.valid && query.trim()) {
          this.fetchCocktails(this.searchForm.controls.searchType.value, query);
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
    if (this.showOnlyFavorites()) return;

    this.isLoading.set(true);
    this.cocktailApi.searchCocktails(type, query).subscribe({
      next: (results) => {
        this.cocktails.set(results);
        this.isLoading.set(false);
      },
      error: () => {
        this.cocktails.set([]);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Placeholder handler for toggling a cocktail's favorite status.
   *
   * @param cocktail - The selected cocktail object.
   */
  toggleFavorite(cocktail: Cocktail): void {
    console.log(cocktail); // TODO
  }

  /**
   * Toggles the view mode flag between all cocktails and favorite cocktails.
   *
   * @param onlyFavorites - Boolean flag stating whether to filter by favorites.
   */
  toggleFavoritesView(onlyFavorites: boolean): void {
    this.showOnlyFavorites.set(onlyFavorites);
  }
}
