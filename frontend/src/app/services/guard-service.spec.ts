import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { GuardService } from './guard-service';
import { AuthService } from './auth.service';
import { of } from 'rxjs';

describe('GuardService', () => {
  let service: GuardService;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    // Création des spies pour les dépendances
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['checkAuth', 'currentUser$']);
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        GuardService,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(GuardService);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Mock des objets route et state
    route = {} as ActivatedRouteSnapshot;
    state = { url: '/dashboard' } as RouterStateSnapshot;
  });

  describe('canActivate', () => {

    describe('when user is not authenticated', () => {
      beforeEach(() => {
        authService.checkAuth.and.returnValue(Promise.resolve(false));
        const mockUrlTree = {} as UrlTree;
        router.createUrlTree.and.returnValue(mockUrlTree);
      });

      it('should redirect to auth page with returnUrl', async () => {
        const result = await service.canActivate(route, state);

        expect(authService.checkAuth).toHaveBeenCalled();
        expect(router.createUrlTree).toHaveBeenCalledWith(['/auth'], {
          queryParams: { returnUrl: state.url }
        });
        expect(result).toBeInstanceOf(Object); // UrlTree
      });
    });

    describe('when user is authenticated', () => {
      beforeEach(() => {
        authService.checkAuth.and.returnValue(Promise.resolve(true));
      });

      describe('and user is CLIENT', () => {
        beforeEach(() => {
          authService.currentUser$.and.returnValue({
            role: 'CLIENT',
            id: '',
            email: '',
            name: '',
            createdAt: new Date(),
          });
        });

        it('should allow access to home page', async () => {
          state.url = '/';

          const result = await service.canActivate(route, state);

          expect(result).toBe(true);
        });

        it('should allow access to profil page', async () => {
          state.url = '/profil';

          const result = await service.canActivate(route, state);

          expect(result).toBe(true);
        });

        it('should redirect to home when accessing unauthorized route', async () => {
          state.url = '/admin';
          const mockUrlTree = {} as UrlTree;
          router.createUrlTree.and.returnValue(mockUrlTree);

          const result = await service.canActivate(route, state);

          expect(router.createUrlTree).toHaveBeenCalledWith(['/']);
          expect(result).toBeInstanceOf(Object); // UrlTree
        });

        it('should redirect to home when accessing dashboard', async () => {
          state.url = '/dashboard';
          const mockUrlTree = {} as UrlTree;
          router.createUrlTree.and.returnValue(mockUrlTree);

          const result = await service.canActivate(route, state);

          expect(router.createUrlTree).toHaveBeenCalledWith(['/']);
          expect(result).toBeInstanceOf(Object); // UrlTree
        });
      });

      describe('and user is undefined', () => {
        beforeEach(() => {
          authService.currentUser$.and.returnValue(null);
        });

        it('should allow access when user is null', async () => {
          state.url = '/dashboard';

          const result = await service.canActivate(route, state);

          expect(result).toBe(true);
        });
      });
    });

    describe('edge cases', () => {
      it('should handle checkAuth rejection', async () => {
        authService.checkAuth.and.returnValue(Promise.reject(new Error('Auth failed')));

        try {
          await service.canActivate(route, state);
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.message).toBe('Auth failed');
        }
      });

      it('should handle different URL formats', async () => {
        authService.checkAuth.and.returnValue(Promise.resolve(true));
        authService.currentUser$.and.returnValue({
          role: 'CLIENT',
          id: '',
          email: '',
          name: '',
          createdAt: new Date(),
        });

        // Test avec query parameters
        state.url = '/?tab=settings';
        let result = await service.canActivate(route, state);
        expect(result).toBeUndefined();

        // Test avec fragments
        state.url = '/profil#section1';
        result = await service.canActivate(route, state);
        expect(result).toBeUndefined();
      });
    });
  });

  describe('service creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should inject dependencies correctly', () => {
      expect(service['authService']).toBeTruthy();
      expect(service['router']).toBeTruthy();
    });
  });
});