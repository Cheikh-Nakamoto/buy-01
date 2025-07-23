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
    try {
      let res = await fetch(this.apiUrlService.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data_form)
      }).then((res) => res.json());
      this._isSignIn.set(true);
      localStorage.setItem('token', res.token);
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
   return true;
  }

  async signUp(data_form: AuthFormData, avatarFile ?: File): Promise < void> {
  const formData = new FormData();

  // Créer un blob JSON pour la partie "data"
  const userData = {
    email: data_form.email,
    password: data_form.password,
    name: data_form.name,
    role: data_form.role
  };

  formData.append('data', new Blob([JSON.stringify(userData)], {
    type: 'application/json'
  }));

  // Ajouter l'avatar si fourni
  if(avatarFile) {
    formData.append('avatar', avatarFile);
  }

    console.log('Sending form data:', userData);

  let res = await fetch(this.apiUrlService.REGISTER, {
    method: 'POST',
    // Ne pas définir Content-Type, le navigateur le fera automatiquement
    body: formData
  }).then((res) => res.json())
    .catch(error => {
      throw new Error(error.message || 'Registration failed');
    });

  console.log(res);
}

signOut(): void {
  localStorage.removeItem('currentUser');
  localStorage
      .removeItem('token');
  this._isSignIn.set(false);
  localStorage.clear();
}

  async checkAuth(): Promise < boolean > {
  const token = localStorage.getItem('token');
  if(!token) {
    this._isSignIn.set(false);
    return false;
  }

    try {
    const response = await fetch(this.apiUrlService.GET_CURRENT_USER, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if(response.ok) {
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