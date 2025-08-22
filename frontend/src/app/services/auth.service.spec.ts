import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiUrlService } from './api-url-service';
import { DataService } from './data-service';
import { AuthFormData, User, ServiceResponse } from '../models/interfaces';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MockStorageService, StorageService } from './service_test/storage.test.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let apiUrlService: jasmine.SpyObj<ApiUrlService>;
  let dataService: jasmine.SpyObj<DataService>;
  let storageService: MockStorageService;

  beforeEach(() => {
    // Mock ApiUrlService
    apiUrlService = jasmine.createSpyObj('ApiUrlService', [], {
      LOGIN: 'http://api.test/login',
      REGISTER: 'http://api.test/register',
      GET_CURRENT_USER: 'http://api.test/user'
    });

    // Mock DataService
    dataService = jasmine.createSpyObj('DataService', ['updateData']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        { provide: ApiUrlService, useValue: apiUrlService },
        { provide: DataService, useValue: dataService },
        { provide: StorageService, useClass: MockStorageService }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    storageService = TestBed.inject(StorageService) as MockStorageService;
  });

  afterEach(() => {
    httpMock.verify();
    storageService.clear();
  });

  describe('signIn', () => {
    const mockAuthData: AuthFormData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should sign in successfully with valid credentials', async () => {
      const mockResponse = { token: 'mock-token-123' };
      
      // Spy sur checkAuth pour éviter l'appel réel
      const checkAuthSpy = spyOn(service, 'checkAuth').and.returnValue(Promise.resolve(true));

      const signInPromise = service.signIn(mockAuthData);

      const req = httpMock.expectOne('http://api.test/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockAuthData);
      req.flush(mockResponse);

      const result = await signInPromise;
      
      expect(result.success).toBeTrue();
      expect(storageService.getItem('token')).toBe('mock-token-123'); // Vérifie le token stocké
      expect(checkAuthSpy).toHaveBeenCalled();
    });

    it('should handle sign in failure when no token returned', async () => {
      const mockErrorResponse = { error: 'Invalid credentials' };

      const signInPromise = service.signIn(mockAuthData);

      const req = httpMock.expectOne('http://api.test/login');
      req.flush(mockErrorResponse);

      const result = await signInPromise;
      expect(result.success).toBeFalse();
      expect(result.error).toBeDefined();
    });

    it('should handle HTTP errors during sign in', async () => {
      const signInPromise = service.signIn(mockAuthData);

      const req = httpMock.expectOne('http://api.test/login');
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      const result = await signInPromise;
      expect(result.success).toBeFalse();
      expect(result.error).toBeDefined();
    });
  });

  describe('checkAuth', () => {
    it('should return false when no token exists', async () => {
      storageService.removeItem('token'); // Assurez-vous qu'il n'y a pas de token
      
      const result = await service.checkAuth();

      expect(result).toBeFalse();
      expect(service.isSignIn$()).toBeFalse();
      httpMock.expectNone('http://api.test/user'); // Aucune requête ne devrait être faite
    });

    it('should authenticate successfully with valid token', async () => {
      const mockUser: User = { 
        id: '1', 
        email: 'test@example.com', 
        name: 'Test User', 
        role: 'CLIENT', 
        createdAt: new Date() 
      };
      
      // Définir un token valide
      storageService.setItem('token', 'valid-token');

      const checkAuthPromise = service.checkAuth();

      const req = httpMock.expectOne('http://api.test/user');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer valid-token');
      
      req.flush(mockUser);

      const result = await checkAuthPromise;
      expect(result).toBeTrue();
      expect(service.currentUser$()).toEqual(mockUser);
      expect(service.isSignIn$()).toBeTrue();
    });

    it('should handle 401 unauthorized response', async () => {
      storageService.setItem('token', 'invalid-token');
      
      const checkAuthPromise = service.checkAuth();

      const req = httpMock.expectOne('http://api.test/user');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      const result = await checkAuthPromise;
      expect(result).toBeFalse();
      expect(service.isSignIn$()).toBeFalse();
    });

    it('should handle network errors during auth check', async () => {
      storageService.setItem('token', 'valid-token');
      
      const checkAuthPromise = service.checkAuth();

      const req = httpMock.expectOne('http://api.test/user');
      req.error(new ProgressEvent('Network error'));

      const result = await checkAuthPromise;
      expect(dataService.updateData).toHaveBeenCalledWith({
        error: 'Auth check failed: wait a moment and will retry',
        success: false
      });
      expect(result).toBeFalse();
    });
  });

  describe('signOut', () => {
    it('should clear storage and reset authentication state', () => {
      // Pré-remplir le storage avec des données
      storageService.setItem('token', 'some-token');
      storageService.setItem('currentUser', JSON.stringify({ name: 'Test User' }));

      const result = service.signOut();

      // Vérifier que le storage est vide
      expect(storageService.getItem('token')).toBeNull();
      expect(storageService.getItem('currentUser')).toBeNull();
      
      // Vérifier l'état du service
      expect(service.isSignIn$()).toBeFalse();
      expect(result.success).toBeTrue();
    });
  });

  describe('signUp', () => {
    const mockAuthData: AuthFormData = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
      role: 'CLIENT'
    };

    it('should sign up successfully without avatar', async () => {
      const mockResponse = { role: 'CLIENT', id: 1 };

      const signUpPromise = service.signUp(mockAuthData);

      const req = httpMock.expectOne('http://api.test/register');
      expect(req.request.method).toBe('POST');
      
      req.flush(mockResponse);

      const result = await signUpPromise;
      expect(result.success).toBeTrue();
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle network errors during sign up', async () => {
      const signUpPromise = service.signUp(mockAuthData);

      const req = httpMock.expectOne('http://api.test/register');
      req.error(new ProgressEvent('Network error'));

      const result = await signUpPromise;
      expect(result.success).toBeFalse();
      expect(result.error).toBeDefined();
    });
  });
});