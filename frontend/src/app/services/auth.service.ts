import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, AuthFormData, AuthResponse } from '../models/interfaces';
import { ApiUrlService } from './api-url-service';

@Injectable({
  providedIn: 'root'
})
/**
 * Service for handling user authentication, including sign-in, sign-up, and session management.
 * Manages the current user's authentication state and provides methods for interacting with the authentication API.
 */
export class AuthService {
  private currentUserSubject = signal<User | null>(null);
  public currentUser$ = this.currentUserSubject.asReadonly();
  private _isSignIn = signal<boolean>(false);
  public isSignIn$ = this._isSignIn.asReadonly();

  constructor(private apiUrlService: ApiUrlService) {
    // Check for stored user
    this.checkAuth();
  }

  /**
   * Authenticates a user by sending their credentials to the login API.
   * On successful login, stores the authentication token and updates the user's sign-in status.
   * @param data_form The authentication form data containing email and password.
   * @returns A Promise that resolves to `true` if sign-in is successful, `false` otherwise.
   */
  async signIn(data_form: AuthFormData): Promise<boolean> {
    // Mock authentication - simulate API call
    console.log('Signing in with data:', data_form);
    try {
      let res = await fetch(this.apiUrlService.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data_form)
      }).then((res) => res.json());
      console.log('Login response:', res);
      this._isSignIn.set(true);
      localStorage.setItem('token', res.token);
      await this.checkAuth();
    } catch (error: any) {
     alert('Login failed: ' + error.error);
      return false;
    }
    return true;
  }

  /**
   * Registers a new user by sending their registration data and an optional avatar file to the sign-up API.
   * @param data_form The registration form data containing user details.
   * @param avatarFile Optional. The avatar image file to upload for the new user.
   * @returns A Promise that resolves when the sign-up process is complete.
   * @throws Error if registration fails or an invalid avatar file type is provided.
   */
  async signUp(data_form: AuthFormData, avatarFile?: File): Promise<void> {
    const formData = new FormData();
    const file : File | Blob | null = avatarFile || null;
    // Créer l'objet JSON pour les données utilisateur
    const userData = {
      email: data_form.email,
      password: data_form.password,
      name: data_form.name,
      role: data_form.role
    };

    // Ajouter les données JSON comme Blob avec le bon Content-Type
    formData.append('data', new Blob([JSON.stringify(userData)], {
      type: 'application/json'
    }));
  // Vérification plus stricte du fichier
  if (avatarFile) {
    if (avatarFile instanceof File) {
      console.log('Valid avatar file:', avatarFile.name, avatarFile.type);
      formData.append('avatar', avatarFile);
    } else if (file instanceof Blob) {
      console.log('Avatar is a Blob, converting...');
      formData.append('avatar', file, 'avatar.jpg');
    } else {
     alert('Invalid avatar file type: ' + typeof avatarFile + ', ' + avatarFile);
      throw new Error('Invalid avatar file');
    }
  }

    console.log('Sending form data:', userData);

    // Debug: voir le contenu du FormData
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      let res = await fetch(this.apiUrlService.REGISTER, {
        method: 'POST',
        body: formData
        // Ne pas définir Content-Type, le navigateur le fera automatiquement
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      console.log('Registration success:', result);
      return result;

    } catch (error: any) {
     alert('Registration failed: ' + error);
      throw new Error(error.error || 'Registration failed');
    }
  }

  /**
   * Signs out the current user by clearing local storage and resetting authentication states.
   */
  signOut(): void {
    localStorage.removeItem('currentUser');
    localStorage
      .removeItem('token');
    this._isSignIn.set(false);
    localStorage.clear();
  }

  /**
   * Checks the current authentication status by verifying the stored token with the backend.
   * Updates the `currentUserSubject` and `_isSignIn` signals based on the token's validity.
   * @returns A Promise that resolves to `true` if the user is authenticated, `false` otherwise.
   */
  async checkAuth(): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (!token || token == undefined) {
      this._isSignIn.set(false);
      return false;
    }

    try {
      const response = await fetch(this.apiUrlService.GET_CURRENT_USER, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const user = await response.json();
        this.currentUserSubject.set(user);
        this._isSignIn.set(true);
        return true;
      }
    } catch (error : any) {
     alert('Auth check failed: ' + error.error);
    }

    this._isSignIn.set(false);
    return false;
  }

  /**
   * Synchronously checks if an authentication token exists in local storage.
   * This method is primarily used by route guards for immediate authentication checks.
   * @returns `true` if a token is found, `false` otherwise.
   */
  isAuthenticatedSync(): boolean {
    return !!localStorage.getItem('token');
  }

}