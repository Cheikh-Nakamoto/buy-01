import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, firstValueFrom } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiUrlService } from './api-url-service';
import { User, ServiceResponse } from '../models/interfaces';
import { handleHttpError } from '../utils/utils';

@Injectable({
  providedIn: 'root'
})
/**
 * Service for managing user-related operations, including profile management,
 * authentication status, and avatar updates.
 */
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient
  ) {}

  /**
   * Récupère le profil de l'utilisateur connecté (Observable - pour les composants réactifs)
   * @returns Observable<User>
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(this.apiUrl.GET_CURRENT_USER, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((user:any) => this.currentUserSubject.next(user)),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching user profile:', error);
        return throwError(() => handleHttpError(error));
      })
    );
  }

  /**
   * Récupère le profil de l'utilisateur connecté (Promise - pour les appels async/await)
   * @returns Promise<ServiceResponse<User>>
   */
  async getProfileAsync(): Promise<ServiceResponse<User>> {
    try {
      const user : any = await firstValueFrom(
        this.http.get<User>(this.apiUrl.GET_CURRENT_USER, {
          headers: this.getAuthHeaders()
        }).pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Error fetching user profile:', error);
            return throwError(() => handleHttpError(error));
          })
        )
      );

      this.currentUserSubject.next(user);
      console.log('User profile fetched successfully:', user);
      
      return {
        success: true,
        data: user,
        message: 'Profile loaded successfully!'
      };

    } catch (error: any) {
      console.error('Error in getProfileAsync:', error);
      return {
        success: false,
        error: error.message || 'Failed to load profile'
      };
    }
  }

  /**
   * Met à jour le profil utilisateur
   * @param user - Les données utilisateur à mettre à jour
   * @param userId - ID de l'utilisateur (optionnel)
   * @returns Promise<ServiceResponse<User>>
   */
  async updateProfile(user: Partial<User>, userId?: string): Promise<ServiceResponse<User>> {
    try {
      const id = userId || this.getCurrentUserId();
      
      if (!id) {
        return {
          success: false,
          error: 'User ID not found. Please log in again.'
        };
      }

      const updatedUser :any = await firstValueFrom(
        this.http.put<User>(this.apiUrl.UPDATE_USER(userId!), user, {
          headers: this.getAuthHeaders()
        }).pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Error updating user profile:', error);
            return throwError(() => handleHttpError(error));
          })
        )
      );

      this.currentUserSubject.next(updatedUser);
      console.log('User profile updated successfully:', updatedUser);
      
      return {
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully!'
      };

    } catch (error: any) {
      console.error('Error in updateProfile:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile'
      };
    }
  }

  /**
   * Met à jour l'avatar de l'utilisateur
   * @param file - Fichier image pour l'avatar
   * @returns Promise<ServiceResponse>
   */
  async updateAvatar(file: File): Promise<ServiceResponse> {
    try {
      // Validation côté client
      const validationResult = this.validateImageFile(file);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error
        };
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.getToken()}`
      });

      const response = await firstValueFrom(
        this.http.put(this.apiUrl.UPDATE_AVATAR, formData, { headers }).pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Error updating avatar:', error);
            return throwError(() => handleHttpError(error));
          })
        )
      );

      console.log('Avatar updated successfully:', response);
      
      return {
        success: true,
        data: response,
        message: 'Avatar updated successfully!'
      };

    } catch (error: any) {
      console.error('Error in updateAvatar:', error);
      return {
        success: false,
        error: error.message || 'Failed to update avatar'
      };
    }
  }

  /**
   * Changes the user's password.
   * @param currentPassword The user's current password.
   * @param newPassword The new password to set.
   * @returns A Promise that resolves to a ServiceResponse indicating success or failure.
   */
  // This method is commented out in the original file, so I will keep it commented out.
  // async changePassword(currentPassword: string, newPassword: string): Promise<ServiceResponse> {
  //   // Implementation for changing password
  // }

  // /**
  //  * Supprime le compte utilisateur
  //  * @returns Promise<ServiceResponse>
  //  */
  // async deleteAccount(): Promise<ServiceResponse> {
  //   try {
  //     const response = await firstValueFrom(
  //       this.http.delete(this.apiUrl.DELETE_USER, {
  //         headers: this.getAuthHeaders()
  //       }).pipe(
  //         catchError((error: HttpErrorResponse) => {
  //           console.error('Error deleting account:', error);
  //           return throwError(() => handleHttpError(error));
  //         })
  //       )
  //     );

  //     // Nettoyer les données locales après suppression
  //     this.logout();
  //     console.log('Account deleted successfully');
      
  //     return {
  //       success: true,
  //       data: response,
  //       message: 'Account deleted successfully!'
  //     };

  //   } catch (error: any) {
  //     console.error('Error in deleteAccount:', error);
  //     return {
  //       success: false,
  //       error: error.message || 'Failed to delete account'
  //     };
  //   }
  // }

  /**
   * Déconnecte l'utilisateur et nettoie les données
   */
  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('token');
    console.log('User logged out successfully');
  }

  /**
   * Vérifie si l'utilisateur est connecté
   * @returns boolean
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtient l'utilisateur actuellement connecté
   * @returns User | null
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtient l'ID de l'utilisateur actuel
   * @returns string | null
   */
  private getCurrentUserId(): string | null {
    const currentUser = this.getCurrentUser();
    return currentUser?.id || null;
  }

  /**
   * Génère les en-têtes d'authentification
   * @returns HttpHeaders
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Récupère le token d'authentification
   * @returns string | null
   */
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Valide le format et la taille du fichier image
   * @param file - Fichier à valider
   * @returns {isValid: boolean, error?: string}
   */
  private validateImageFile(file: File): {isValid: boolean, error?: string} {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file format. Please use JPG, PNG, GIF, or WebP.'
      };
    }
    
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File is too large. Maximum size is 5MB.'
      };
    }
    
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'File is empty. Please select a valid image.'
      };
    }
    
    return { isValid: true };
  }

  /**
   * Méthode utilitaire pour retry avec backoff exponentiel
   * @param operation - Opération à retry
   * @param maxRetries - Nombre maximum de tentatives
   * @param baseDelay - Délai de base en ms
   * @returns Promise<T>
   */
  async retryOperation<T>(
    operation: () => Promise<T>, 
    maxRetries: number = 3, 
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Backoff exponentiel
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Méthode utilitaire pour vérifier la connexion réseau
   * @returns Promise<boolean>
   */
  async checkNetworkConnection(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}