import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, AuthFormData, AuthResponse } from '../models/interfaces';
import { ApiUrlService } from './api-url-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = signal<User | null>(null);
  public currentUser$ = this.currentUserSubject.asReadonly();
  private _isSignIn = signal<boolean>(false);
  public isSignIn$ = this._isSignIn.asReadonly();

  constructor(private apiUrlService: ApiUrlService) {
    // Check for stored user
    this.checkAuth();
  }

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
    } catch (error: any) {
      console.error('Login failed:', error);
      return false;
    }
    return true;
  }

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
      console.error('Invalid avatar file type:', typeof avatarFile, avatarFile);
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
      console.error('Registration failed:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  signOut(): void {
    localStorage.removeItem('currentUser');
    localStorage
      .removeItem('token');
    this._isSignIn.set(false);
    localStorage.clear();
  }

  async checkAuth(): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
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
    } catch (error) {
      console.error('Auth check failed:', error);
    }

    this._isSignIn.set(false);
    return false;
  }

  // Ajoutez cette méthode synchrone pour le guard
  isAuthenticatedSync(): boolean {
    return !!localStorage.getItem('token');
  }

}