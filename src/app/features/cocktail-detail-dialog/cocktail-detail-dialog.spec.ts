import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { Cocktail } from '../../core/models/cocktail.model';
import { CocktailDetailDialogComponent } from './cocktail-detail-dialog';

describe('CocktailDetailDialogComponent', () => {
  let component: CocktailDetailDialogComponent;
  let fixture: ComponentFixture<CocktailDetailDialogComponent>;

  let dialogRefMock: { close: ReturnType<typeof vi.fn> };
  let cocktailApiMock: { getCocktailById: ReturnType<typeof vi.fn> };

  const mockDialogData = { cocktailId: '11007' };

  const mockCocktail: Cocktail = {
    id: '11007',
    name: 'Margarita',
    image: 'https://example.com/margarita.jpg',
    instructions: 'Rub the rim of the glass with lime slice.',
    ingredients: [{ name: 'Tequila', measure: '1 1/2 oz' }],
  };

  beforeEach(async () => {
    dialogRefMock = {
      close: vi.fn(),
    };

    cocktailApiMock = {
      getCocktailById: vi.fn().mockReturnValue(of(mockCocktail)),
    };

    await TestBed.configureTestingModule({
      imports: [CocktailDetailDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: CocktailApiService, useValue: cocktailApiMock },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CocktailDetailDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create and trigger fetchDetail on initialization', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(cocktailApiMock.getCocktailById).toHaveBeenCalledWith('11007');
    expect(component.cocktail()).toEqual(mockCocktail);
    expect(component.isLoading()).toBe(false);
  });

  describe('fetchDetail', () => {
    it('should set cocktail data and set isLoading to false on API success', () => {
      cocktailApiMock.getCocktailById.mockReturnValue(of(mockCocktail));

      component.fetchDetail();

      expect(component.cocktail()).toEqual(mockCocktail);
      expect(component.isLoading()).toBe(false);
    });

    it('should set isLoading to false on API error', () => {
      cocktailApiMock.getCocktailById.mockReturnValue(throwError(() => new Error('API Error')));

      component.fetchDetail();

      expect(component.cocktail()).toBeNull();
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('close', () => {
    it('should close the dialog', () => {
      component.close();

      expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
    });
  });
});
