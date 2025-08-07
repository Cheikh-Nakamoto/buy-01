import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
/**
 * Service for managing API URLs.
 * Provides a centralized location for all backend API endpoints.
 */
export class ApiUrlService {
 private readonly baseUrl = 'https://localhost:8443'; // À remplacer par environment.apiUrl en production

 /** Auth Endpoints */
 /** API endpoint for user registration. */
 readonly REGISTER = `${this.baseUrl}/api/auth/register`;
 /** API endpoint for user login. */
 readonly LOGIN = `${this.baseUrl}/api/auth/login`;

  /** Admin Endpoints */
  /** API endpoint to get all users (admin only). */
  readonly GET_ALL_USERS = `${this.baseUrl}/api/admin/users/all`;
  /**
   * API endpoint to delete a user by ID (admin only).
   * @param id The ID of the user to delete.
   */
  readonly DELETE_USER = (id: number) => `${this.baseUrl}/api/admin/users/del/${id}`;

  /** User Endpoints */
  /**
   * API endpoint to update a user by ID.
   * @param id The ID of the user to update.
   */
  readonly UPDATE_USER = (id: string) => `${this.baseUrl}/api/users/update/${id}`;
  /** API endpoint to update the current user's avatar. */
  readonly UPDATE_AVATAR = `${this.baseUrl}/api/users/update/avatar`;
  /**
   * API endpoint to get a user by ID.
   * @param id The ID of the user to retrieve.
   */
  readonly GET_USER_BY_ID = (id: number) => `${this.baseUrl}/api/users/profile/${id}`;
  /**
   * API endpoint to get a user by username.
   * @param userId The username of the user to retrieve.
   */
  readonly GET_USER_BY_NAME = (userId: string) => `${this.baseUrl}/api/users/name/${userId}`;
  /** API endpoint to get the currently authenticated user's profile. */
  readonly GET_CURRENT_USER = `${this.baseUrl}/api/users/me`;
  /**
   * API endpoint to get a user by email address.
   * @param email The email address of the user to retrieve.
   */
  readonly GET_USER_BY_EMAIL = (email: string) => `${this.baseUrl}/api/users/email/${email}`;

  /** Product Endpoints */
  /**
   * API endpoint to get a product by ID.
   * @param id The ID of the product to retrieve.
   */
  readonly GET_PRODUCT_BY_ID = (id: string) => `${this.baseUrl}/api/products/${id}`;
  /**
   * API endpoint to update a product by ID.
   * @param id The ID of the product to update.
   */
  readonly UPDATE_PRODUCT = (id: string) => `${this.baseUrl}/api/products/update/${id}`;
  /** API endpoint to create a new product. */
  readonly CREATE_PRODUCT = `${this.baseUrl}/api/products/create`;
  /** API endpoint to get all products. */
  readonly GET_ALL_PRODUCTS = `${this.baseUrl}/api/products/all`;
  /** API endpoint to get all products owned by the current user. */
  readonly GET_MY_ALL_PRODUCT = `${this.baseUrl}/api/products/myproducts`
  /**
   * API endpoint to delete an image by its Media ID.
   * @param id The Media ID of the image to delete.
   */
  readonly DELETE_IMG_BY_Media_ID = (id: string) => `${this.baseUrl}/api/media/delete/${id}`
  /**
   * API endpoint to delete a product by ID.
   * @param id The ID of the product to delete.
   */
  readonly DELETE_PRODUCT_BY_ID = (id: string) => `${this.baseUrl}/api/products/delete/${id}`

  /**
   * API endpoint to add an image to a product by Product ID.
   * @param id The ID of the product to add the image to.
   */
  readonly ADD_IMG_BY_PRODUCT_ID = (id : string) => `${this.baseUrl}/api/media/add/${id}`
  constructor() { }
}
