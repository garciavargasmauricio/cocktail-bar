import { TestBed } from '@angular/core/testing';
import { CocktailStateService } from './cocktail-state';

describe('CocktailState', () => {
  let service: CocktailStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CocktailStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
