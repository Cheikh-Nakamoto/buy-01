import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiUrlService } from './api-url-service';
import { DataService } from './data-service';
import { AuthFormData, User, ServiceResponse } from '../models/interfaces';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    let apiUrlService: jasmine.SpyObj<ApiUrlService>;
    let dataService: jasmine.SpyObj<DataService>;
    let localStorageMock: any;
    beforeEach(() => {
        apiUrlService = jasmine.createSpyObj<ApiUrlService>('ApiUrlService', [], {
            LOGIN: 'http://api.test/login',
            REGISTER: 'http://api.test/register',
            GET_CURRENT_USER: 'http://api.test/user'
        });

        // Mock localStorage
        localStorageMock = {
            getItem: jasmine.createSpy('getItem').and.returnValue(null),
            setItem: jasmine.createSpy('setItem'),
            removeItem: jasmine.createSpy('removeItem'),
            clear: jasmine.createSpy('clear')
        };
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });

        // Mock DataService
        dataService = jasmine.createSpyObj<DataService>('DataService', ['updateData']);

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                AuthService,
                { provide: ApiUrlService, useValue: apiUrlService },
                { provide: DataService, useValue: dataService }
            ]
        });

        service = TestBed.inject(AuthService);
        apiUrlService = TestBed.inject(ApiUrlService) as jasmine.SpyObj<ApiUrlService>;
        dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        // Reset localStorage mock
        localStorageMock.getItem.calls.reset();
        localStorageMock.setItem.calls.reset();
        localStorageMock.removeItem.calls.reset();
        localStorageMock.clear.calls.reset();
        
    });


    describe('signIn', () => {
        const mockAuthData: AuthFormData = {
            email: 'test@example.com',
            password: 'password123'
        };

        it('should sign in successfully with valid credentials', async () => {
            const mockResponse = { token: 'mock-token-123' };
            spyOn(service, 'checkAuth').and.returnValue(Promise.resolve(true));

            const signInPromise = service.signIn(mockAuthData);

            // ✅ Intercepter et vérifier la requête
            const req = httpMock.expectOne('http://api.test/login');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(mockAuthData);
            expect(req.request.headers.get('Content-Type')).toBe('application/json');

            // ✅ Simuler la réponse
            req.flush(mockResponse);

            const result = await signInPromise;
            expect(result.success).toBeTrue();
            expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token-123');
        });

        it('should handle sign in failure when no token returned', async () => {
            const mockErrorResponse = { error: 'Invalid credentials' };

            const signInPromise = service.signIn(mockAuthData);

            const req = httpMock.expectOne('http://api.test/login');
            req.flush(mockErrorResponse); // ✅ Réponse sans token

            const result = await signInPromise;
            expect(result.success).toBeFalse();
            expect(result.error).toBeDefined();
        });

        it('should handle HTTP errors during sign in', async () => {
            const signInPromise = service.signIn(mockAuthData);

            const req = httpMock.expectOne('http://api.test/login');
            // ✅ Simuler une erreur HTTP
            req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

            const result = await signInPromise;
            expect(result.success).toBeFalse();
            expect(result.error).toBeDefined();
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
            expect(req.request.body).toBeInstanceOf(FormData);

            req.flush(mockResponse);

            const result = await signUpPromise;
            expect(result.success).toBeTrue();
            expect(result.data).toEqual(mockResponse);
        });

        it('should sign up successfully with avatar file', async () => {
            const mockFile = new File([''], 'avatar.jpg', { type: 'image/jpeg' });
            const mockResponse = { role: 'CLIENT', id: 1 };

            const signUpPromise = service.signUp(mockAuthData, mockFile);

            const req = httpMock.expectOne('http://api.test/register');
            expect(req.request.body).toBeInstanceOf(FormData);

            req.flush(mockResponse);

            const result = await signUpPromise;
            expect(result.success).toBeTrue();
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

    describe('checkAuth', () => {
        it('should return false when no token exists', async () => {

            const result = await service.checkAuth();

            expect(result).toBeFalse();
            expect(service.isSignIn$()).toBeFalse();
            // ✅ Pas de requête HTTP attendue
            httpMock.expectNone('http://api.test/user');
        });

        it('should authenticate successfully with valid token', async () => {
            const mockUser: User = { id: '1', email: 'test@example.com', name: 'Test User', role: 'CLIENT', createdAt: new Date() };
            (localStorage.getItem as jasmine.Spy).and.returnValue('valid-token');
            console.log('Checking auth with token:', localStorage.getItem('token'));
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
            (localStorage.getItem as jasmine.Spy).and.returnValue('invalid-token');
            console.log('Checking auth with token:', localStorage.getItem('token'));
            const checkAuthPromise = service.checkAuth();

            const req = httpMock.expectOne('http://api.test/user');
            req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

            const result = await checkAuthPromise;
            expect(result).toBeFalse();
            expect(service.isSignIn$()).toBeFalse();
        });

        it('should handle network errors during auth check', async () => {
            (localStorage.getItem as jasmine.Spy).and.returnValue('valid-token');
console.log('Checking auth with token:', localStorage.getItem('token'));
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
        it('should clear all localStorage and reset authentication state', () => {
            const result = service.signOut();

            expect(localStorage.removeItem).toHaveBeenCalledWith('currentUser');
            expect(localStorage.removeItem).toHaveBeenCalledWith('token');
            expect(localStorage.clear).toHaveBeenCalled();
            expect(service.isSignIn$()).toBeFalse();
            expect(result.success).toBeTrue();
        });
    });

});