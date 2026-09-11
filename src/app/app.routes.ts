import { Routes } from '@angular/router';

/**
 * Application routing configuration defining the navigation hierarchy and route resolution strategy.
 *
 * Uses **Lazy Loading** (code splitting) to optimize initial page loading performance.
 */
export const routes: Routes = [
  /**
   * Default route: Redirects empty paths to the main `/cocktails` feature view.
   */
  {
    path: '',
    redirectTo: 'cocktails',
    pathMatch: 'full',
  },

  /**
   * Main Cocktails catalog route using **Lazy Loading**.
   *
   * @description
   * The `loadComponent` function utilizes a dynamic `import()` statement to split the
   * `CocktailListComponent` code into a separate JS bundle (chunk). This component and its
   * dependencies are downloaded on-demand by the browser only when the user navigates to `/cocktails`,
   * keeping the initial application bundle size minimal.
   */
  {
    path: 'cocktails',
    loadComponent: () =>
      import('./features/cocktail-list/cocktail-list.component').then(
        (m) => m.CocktailListComponent,
      ),
  },

  /**
   * Wildcard route: Catches any unmatched paths or invalid URLs and redirects back to `/cocktails`.
   */
  {
    path: '**',
    redirectTo: 'cocktails',
  },
];
