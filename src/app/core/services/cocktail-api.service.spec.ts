import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CocktailApiService } from './cocktail-api.service';
import { CocktailApiResponse, CocktailDto } from '../models/cocktail.model';

describe('CocktailApiService', () => {
  let service: CocktailApiService;
  let httpMock: HttpTestingController;

  const baseUrl = 'https://www.thecocktaildb.com/api/json/v1/1';

  const mockBasicDto: CocktailDto = {
    idDrink: '11007',
    strDrink: 'Margarita',
    strDrinkThumb: 'https://example.com/margarita.jpg',
  };

  const mockFullDto: CocktailDto = {
    idDrink: '11007',
    strDrink: 'Margarita',
    strDrinkThumb: 'https://example.com/margarita.jpg',
    strInstructions: 'Rub the rim of the glass with the lime slice.',
    strIngredient1: 'Tequila',
    strMeasure1: '1 1/2 oz ',
    strIngredient2: 'Triple sec',
    strMeasure2: '1/2 oz ',
    strIngredient3: 'Lime juice',
    strMeasure3: '1 oz ',
    strIngredient4: null,
    strMeasure4: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CocktailApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CocktailApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDefaultCocktails', () => {
    it('should fetch and map default alcoholic cocktails', () => {
      const mockResponse: CocktailApiResponse = {
        drinks: [mockBasicDto],
      };

      service.getDefaultCocktails().subscribe((cocktails) => {
        expect(cocktails.length).toBe(1);
        expect(cocktails[0]).toEqual({
          id: '11007',
          name: 'Margarita',
          image: 'https://example.com/margarita.jpg',
        });
      });

      const req = httpMock.expectOne(`${baseUrl}/filter.php?a=Alcoholic`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return an empty array if drinks response is null', () => {
      const mockResponse: CocktailApiResponse = { drinks: null };

      service.getDefaultCocktails().subscribe((cocktails) => {
        expect(cocktails).toEqual([]);
      });

      const req = httpMock.expectOne(`${baseUrl}/filter.php?a=Alcoholic`);
      req.flush(mockResponse);
    });
  });

  describe('searchCocktails', () => {
    it('should return empty array and make no HTTP request if query is empty or whitespace', () => {
      service.searchCocktails('name', '   ').subscribe((cocktails) => {
        expect(cocktails).toEqual([]);
      });

      httpMock.expectNone(`${baseUrl}/search.php?s=`);
    });

    it('should search cocktails by name and map full DTO response', () => {
      const mockResponse: CocktailApiResponse = {
        drinks: [mockFullDto],
      };

      service.searchCocktails('name', 'Margarita').subscribe((cocktails) => {
        expect(cocktails.length).toBe(1);
        expect(cocktails[0].id).toBe('11007');
        expect(cocktails[0].ingredients).toEqual([
          { name: 'Tequila', measure: '1 1/2 oz' },
          { name: 'Triple sec', measure: '1/2 oz' },
          { name: 'Lime juice', measure: '1 oz' },
        ]);
      });

      const req = httpMock.expectOne(`${baseUrl}/search.php?s=Margarita`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should search cocktails by ingredient and map basic DTO response', () => {
      const mockResponse: CocktailApiResponse = {
        drinks: [mockBasicDto],
      };

      service.searchCocktails('ingredient', 'Gin').subscribe((cocktails) => {
        expect(cocktails.length).toBe(1);
        expect(cocktails[0]).toEqual({
          id: '11007',
          name: 'Margarita',
          image: 'https://example.com/margarita.jpg',
        });
      });

      const req = httpMock.expectOne(`${baseUrl}/filter.php?i=Gin`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should search cocktails by ID using getCocktailById', () => {
      const mockResponse: CocktailApiResponse = {
        drinks: [mockFullDto],
      };

      service.searchCocktails('id', '11007').subscribe((cocktails) => {
        expect(cocktails.length).toBe(1);
        expect(cocktails[0].id).toBe('11007');
      });

      const req = httpMock.expectOne(`${baseUrl}/lookup.php?i=11007`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return empty array if search type is invalid', () => {
      // @ts-expect-error Testing default case with invalid type
      service.searchCocktails('unknown_type', 'test').subscribe((cocktails) => {
        expect(cocktails).toEqual([]);
      });

      httpMock.verify();
    });
  });

  describe('getCocktailById', () => {
    it('should fetch a single cocktail by ID and map ingredients correctly', () => {
      const mockResponse: CocktailApiResponse = {
        drinks: [mockFullDto],
      };

      service.getCocktailById('11007').subscribe((cocktail) => {
        expect(cocktail).not.toBeNull();
        expect(cocktail?.id).toBe('11007');
        expect(cocktail?.instructions).toBe('Rub the rim of the glass with the lime slice.');
        expect(cocktail?.ingredients?.length).toBe(3);
      });

      const req = httpMock.expectOne(`${baseUrl}/lookup.php?i=11007`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fallback to default instructions string if strInstructions is missing', () => {
      const dtoWithoutInstructions: CocktailDto = {
        ...mockFullDto,
        strInstructions: undefined,
      };

      service.getCocktailById('11007').subscribe((cocktail) => {
        expect(cocktail?.instructions).toBe('No instructions available.');
      });

      const req = httpMock.expectOne(`${baseUrl}/lookup.php?i=11007`);
      req.flush({ drinks: [dtoWithoutInstructions] });
    });

    it('should return null if API returns empty drinks array or null', () => {
      service.getCocktailById('99999').subscribe((cocktail) => {
        expect(cocktail).toBeNull();
      });

      const req = httpMock.expectOne(`${baseUrl}/lookup.php?i=99999`);
      req.flush({ drinks: null });
    });
  });
});
