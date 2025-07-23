import { Injectable } from '@angular/core';
import { ApiUrlService } from './api-url-service';
import { User } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apiUrl: ApiUrlService) { }
  /**
   * Récupère le profil de l'utilisateur connecté
   * @returns Promise<User | null>
   */
  async getProfile(): Promise<User | null> {
    try {
      const response = await fetch(this.apiUrl.GET_CURRENT_USER, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch current user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  async updateProfile(user: User): Promise<User | null> {
    try {
      const response = await fetch(this.apiUrl.UPDATE_USER(2), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(user)
      });
      if (!response.ok) {
        throw new Error('Failed to update user profile');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }
}
