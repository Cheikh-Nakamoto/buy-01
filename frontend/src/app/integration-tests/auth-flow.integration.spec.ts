import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SignIn } from '../auth/sign-in/sign-in';
import { AuthService } from '../services/auth.service';
import { ApiUrlService } from '../services/api-url-service';
import { ProductList } from '../products/product-list/product-list'; // A component to navigate to
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastError } from '../error/toast-error/toast-error';
import { routes } from '../app.routes';
import { provideHttpClient } from '@angular/common/http';

describe('Authentication Flow Integration Test', () => {
  let fixture: ComponentFixture<SignIn>;
  let component: SignIn;
  let router: Router;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let apiUrlService: ApiUrlService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SignIn, // Import the standalone component
        CommonModule,
        ReactiveFormsModule,
        ToastError,
      ],
      providers: [
        AuthService,
        ApiUrlService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(routes), // Provide the router with application routes
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignIn);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    apiUrlService = TestBed.inject(ApiUrlService);

    // Spy on router.navigate to check navigation
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    // Spy on authService.checkAuth to control its behavior
    spyOn(authService, 'checkAuth').and.returnValue(Promise.resolve(false)); // Assume not signed in initially
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
    localStorage.clear(); // Clean up localStorage after each test
  });

  it('should sign in successfully and navigate to home page', fakeAsync(() => {
    fixture.detectChanges(); // Initialize component (ngOnInit)
    tick(); // Resolve checkAuth promise

    // Set form values for sign-in
    component.authForm.controls['email'].setValue('test@example.com');
    component.authForm.controls['password'].setValue('password123');

    // Trigger form submission
    component.onSubmit();

    // Expect HTTP POST request to login endpoint
    const req = httpMock.expectOne(apiUrlService.LOGIN);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com', password: 'password123' });

    // Respond to the login request
    req.flush({ token: 'mock-jwt-token' });

    tick(1000); // Advance timer for setTimeout in onSubmit

    // Assertions
    expect(localStorage.getItem('token')).toBe('mock-jwt-token');
    expect(authService.isSignIn$()).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(component.successMessage()).toBe('Sign in successful! Redirecting...');
  }));

  it('should display error message on sign in failure', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    component.authForm.controls['email'].setValue('wrong@example.com');
    component.authForm.controls['password'].setValue('wrongpass');

    component.onSubmit();

    const req = httpMock.expectOne(apiUrlService.LOGIN);
    req.flush({ error: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

    tick(); // Resolve promises

    expect(localStorage.getItem('token')).toBeNull();
    expect(authService.isSignIn$()).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('The password you’ve entered is incorrect. Please try again.');
  }));

  it('should sign up successfully and switch to sign-in mode', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    // Switch to sign-up mode
    component.toggleMode();
    fixture.detectChanges(); // Update view after toggleMode

    // Set form values for sign-up
    component.authForm.controls['name'].setValue('New User');
    component.authForm.controls['email'].setValue('newuser@example.com');
    component.authForm.controls['password'].setValue('newpassword');
    component.authForm.controls['confirmPassword'].setValue('newpassword');
    component.authForm.controls['role'].setValue('CLIENT');

    component.onSubmit();

    const req = httpMock.expectOne(apiUrlService.REGISTER);
    expect(req.request.method).toBe('POST');
    // Expect FormData, so we can't directly check body content like JSON
    expect(req.request.body instanceof FormData).toBeTrue();

    req.flush({ role: 'CLIENT', id: '123' }); // Simulate successful registration

    tick(1500); // Advance timer for setTimeout in onSubmit

    expect(component.successMessage()).toBe(''); // Message should be cleared
    expect(component.isSignUp()).toBeFalse(); // Should switch back to sign-in mode
    expect(router.navigate).not.toHaveBeenCalled(); // Should not navigate after sign-up
  }));

  it('should display error message on sign up failure', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    component.toggleMode();
    fixture.detectChanges();

    component.authForm.controls['name'].setValue('New User');
    component.authForm.controls['email'].setValue('existing@example.com');
    component.authForm.controls['password'].setValue('password');
    component.authForm.controls['confirmPassword'].setValue('password');
    component.authForm.controls['role'].setValue('CLIENT');

    component.onSubmit();

    const req = httpMock.expectOne(apiUrlService.REGISTER);
    req.flush({ error: 'Email already registered' }, { status: 409, statusText: 'Conflict' });

    tick();

    expect(component.errorMessage()).toBe('Your Email is already registered. Please try logging in or use a different email address.');
    expect(component.loading()).toBeFalse();
  }));
});