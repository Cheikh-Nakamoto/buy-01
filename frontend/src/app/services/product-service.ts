import { Injectable, OnInit } from '@angular/core';
import { ApiUrlService } from './api-url-service';
import { Product } from '../models/interfaces';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs/internal/observable/throwError';

@Injectable({
  providedIn: 'root'
})
export class ProductService {


  constructor(private apiUrl: ApiUrlService, private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    // This method would typically fetch products from an API or database
    console.log('Fetching products from:', this.apiUrl.GET_ALL_PRODUCTS);
    return this.http.get<any[]>(this.apiUrl.GET_ALL_PRODUCTS).pipe(
      catchError((error: any) => {
        console.error('Error fetching products:', error.error);
        return throwError(error.error || 'Failed to fetch products');
      })
    );
  }
  getProductById(id: number): string {
    // This method would typically fetch a product by its ID
    return `Product ${id}`;
  }
  getHeaderToken(): string {
    // This method would typically return the authorization token for API requests
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return `Bearer ${token}`;
  }
  addProduct(product: FormData): void {
    // This method would typically add a new product to the database
    this.http.post(this.apiUrl.CREATE_PRODUCT, product, {
      headers: {
        'Authorization': this.getHeaderToken()
      }
    }).subscribe({
      next: (response) => {
        console.log(`Product added: ${response}`);
      },
      error: (error) => {
        console.error('Error adding product:', error);
      }
    });
  }
  updateProduct(id: number, product: FormData): void {
    // This method would typically update an existing product
    this.http.put(`${this.apiUrl.UPDATE_PRODUCT}/${id}`, product, {
      headers: {
        'Authorization': this.getHeaderToken()
      }
    }).subscribe({
      next: (response) => {
        console.log(`Product updated: ${response}`);
      },
      error: (error) => {
        console.error('Error updating product:', error);
      }
    });
  }
  deleteProduct(id: number): void {
    // This method would typically delete a product by its ID
    console.log(`Product deleted: ${id}`);
  }
}
