import { Injectable, signal } from '@angular/core';
import { User, AuthFormData, AuthResponse, ServiceResponse } from '../models/interfaces';
import { ApiUrlService } from './api-url-service';
import { handleHttpError } from '../utils/utils';
import { DataService } from './data-service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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

  constructor(private apiUrlService: ApiUrlService, private sharedData: DataService, private http: HttpClient) {
    // Check for stored user
    this.checkAuth();
  }

  /**
   * Authenticates a user by sending their credentials to the login API.
   * On successful login, stores the authentication token and updates the user's sign-in status.
   * @param data_form The authentication form data containing email and password.
   * @returns A Promise that resolves to `true` if sign-in is successful, `false` otherwise.
   */
  async signIn(data_form: AuthFormData): Promise<ServiceResponse> {
    console.log('Signing in with data:', data_form);
    try {
      const res = await firstValueFrom(this.http.post<any>(this.apiUrlService.LOGIN, data_form,{
        headers: {
          'Content-Type': 'application/json'
        }
      }));

      console.log('Login response:', res);
      if (!res?.token) {
        console.log('Login error:', handleHttpError(res).message);
        return { success: false, error: handleHttpError(res).message };
      }

      this._isSignIn.set(true);
      localStorage.setItem('token', res.token);
      await this.checkAuth();
    } catch (error: any) {
      return { success: false, error: handleHttpError(error).message };
    }
    return { success: true };
  }

  /**
   * Registers a new user by sending their registration data and an optional avatar file to the sign-up API.
   * @param data_form The registration form data containing user details.
   * @param avatarFile Optional. The avatar image file to upload for the new user.
   * @returns A Promise that resolves when the sign-up process is complete.
   * @throws Error if registration fails or an invalid avatar file type is provided.
   */
  async signUp(data_form: AuthFormData, avatarFile?: File): Promise<ServiceResponse> {
    const formData = new FormData();
    const file: File | Blob | null = avatarFile || null;
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
        throw new Error('Invalid avatar file');
      }
    }

    console.log('Sending form data:', userData);

    // Debug: voir le contenu du FormData
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      let res = await firstValueFrom(this.http.post<any>(this.apiUrlService.REGISTER, formData));

      console.log('Registration response:', res);
      console.log('Registration success:', !res.role);

      if (!res.role) {
        console.error('Registration error:', handleHttpError(res));
        return { success: false, error: handleHttpError(res).message };
      }


      return { success: true, data: res };

    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: handleHttpError(error).message };
    }
  }

  /**
   * Signs out the current user by clearing local storage and resetting authentication states.
   */
  signOut(): ServiceResponse {
    localStorage.removeItem('currentUser');
    localStorage
      .removeItem('token');
    this._isSignIn.set(false);
    localStorage.clear();
    return { success: true };
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
      const response = await firstValueFrom(this.http.get<any>(this.apiUrlService.GET_CURRENT_USER, {
        headers: { 'Authorization': `Bearer ${token}` }
      }));
      console.log('Auth check response:', response.email.length > 0);
      if (response.email.length > 0) {
        this.currentUserSubject.set(response);
        this._isSignIn.set(true);
        console.log("true existe")
        return true;
      }
    } catch (error: any) {
      this.sharedData.updateData({ error: 'Auth check failed: wait a moment and will retry', success: false });
    }

    this._isSignIn.set(false);
    return false;
  }

}