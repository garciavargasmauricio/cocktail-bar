import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { Cocktail } from '../../core/models/cocktail.model';

export interface CocktailDetailDialogData {
  cocktailId: string;
}

@Component({
  selector: 'app-cocktail-detail-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './cocktail-detail-dialog.html',
  styleUrl: './cocktail-detail-dialog.scss',
})
export class CocktailDetailDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<CocktailDetailDialogComponent>);
  private readonly cocktailApi = inject(CocktailApiService);

  readonly cocktail = signal<Cocktail | null>(null);
  readonly isLoading = signal<boolean>(true);

  constructor(@Inject(MAT_DIALOG_DATA) public data: CocktailDetailDialogData) {}

  ngOnInit(): void {
    this.fetchDetail();
  }

  fetchDetail(): void {
    this.isLoading.set(true);
    // Asumiendo que tu servicio tiene getCocktailById(id)
    this.cocktailApi.getCocktailById(this.data.cocktailId).subscribe({
      next: (detail) => {
        this.cocktail.set(detail);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
