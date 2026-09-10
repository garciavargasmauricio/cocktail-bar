import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'cocktals',
    pathMatch: 'full',
  },
  {
    path: 'cocktails',
    loadComponent: () =>
      import('./features/cocktail-list/cocktail-list.component').then(
        (m) => m.CocktailListComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'cocktails',
  },
];
