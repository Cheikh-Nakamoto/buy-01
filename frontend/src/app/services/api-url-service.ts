import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiUrlService {
 private readonly baseUrl = 'https://localhost:8443'; // À remplacer par environment.apiUrl en production

  // Auth Endpoints
  readonly REGISTER = `${this.baseUrl}/api/auth/register`;
  readonly LOGIN = `${this.baseUrl}/api/auth/login`;

  // Admin Endpoints
  readonly GET_ALL_USERS = `${this.baseUrl}/api/admin/users/all`;
  readonly DELETE_USER = (id: number) => `${this.baseUrl}/api/admin/users/del/${id}`;

  // User Endpoints
  readonly UPDATE_USER = (id: number) => `${this.baseUrl}/api/users/update/${id}`;
  readonly UPDATE_AVATAR = `${this.baseUrl}/api/users/update/avatar`;
  readonly GET_USER_BY_ID = (id: number) => `${this.baseUrl}/api/users/profile/${id}`;
  readonly GET_USER_BY_NAME = (userId: string) => `${this.baseUrl}/api/users/name/${userId}`;
  readonly GET_CURRENT_USER = `${this.baseUrl}/api/users/me`;
  readonly GET_USER_BY_EMAIL = (email: string) => `${this.baseUrl}/api/users/email/${email}`;

    // Product Endpoints
  readonly GET_PRODUCT_BY_ID = (id: number) => `${this.baseUrl}/api/products/${id}`;
  readonly UPDATE_PRODUCT = (id: number) => `${this.baseUrl}/api/products/${id}`;
  readonly CREATE_PRODUCT = `${this.baseUrl}/api/products/create`;
  readonly GET_ALL_PRODUCTS = `${this.baseUrl}/api/products/all`;

  
  constructor() { }
}
