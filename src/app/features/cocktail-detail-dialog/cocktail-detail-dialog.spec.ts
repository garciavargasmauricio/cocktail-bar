import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CocktailDetailDialogComponent } from './cocktail-detail-dialog';

describe('CocktailDetailDialog', () => {
  let component: CocktailDetailDialogComponent;
  let fixture: ComponentFixture<CocktailDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CocktailDetailDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CocktailDetailDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
