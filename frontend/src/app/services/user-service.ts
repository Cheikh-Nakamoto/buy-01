import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiUrlService } from './api-url-service';
import { User } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiUrl: ApiUrlService,
    private http: HttpClient
  ) {}

  /**
   * Récupère le profil de l'utilisateur connecté
   * @returns Observable<User>
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(this.apiUrl.GET_CURRENT_USER, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError(this.handleError('Erreur lors de la récupération du profil'))
    );
  }

  /**
   * Met à jour le profil utilisateur
   * @param user - Les données utilisateur à mettre à jour
   * @param userId - ID de l'utilisateur (optionnel, sera récupéré automatiquement si non fourni)
   * @returns Observable<User>
   */
  updateProfile(user: Partial<User>, userId?: number): Observable<User> {
    const id = userId || this.getCurrentUserId()

    return this.http.put<User>(this.apiUrl.UPDATE_USER(2), user, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(updatedUser => this.currentUserSubject.next(updatedUser)),
      catchError(this.handleError('Erreur lors de la mise à jour du profil'))
    );
  }

  /**
   * Met à jour l'avatar de l'utilisateur
   * @param file - Fichier image pour l'avatar
   * @returns Observable<any>
   */
  updateAvatar(file: File): Observable<any> {
    if (!this.isValidImageFile(file)) {
      return throwError(() => new Error('Format de fichier non supporté. Utilisez JPG, PNG ou GIF.'));
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.put(this.apiUrl.UPDATE_AVATAR, formData, { headers })
      .pipe(
        catchError(this.handleError('Erreur lors de la mise à jour de l\'avatar'))
      );
  }

  /**
   * Déconnecte l'utilisateur et nettoie les données
   */
  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('token');
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
   * Valide le format du fichier image
   * @param file - Fichier à valider
   * @returns boolean
   */
  private isValidImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  /**
   * Gestionnaire d'erreur générique
   * @param operation - Nom de l'opération qui a échoué
   * @returns fonction de gestion d'erreur
   */
  private handleError(operation: string) {
    return (error: any): Observable<never> => {
      console.error(`${operation}:`, error);
      
      let errorMessage = operation;
      if (error.error?.message) {
        errorMessage += `: ${error.error.message}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      return throwError(() => new Error(errorMessage));
    };
  }
}