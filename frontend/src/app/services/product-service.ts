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

  getMyProduct(): Observable<Product[]> {
    console.log('Fetching products from:', this.apiUrl.GET_MY_ALL_PRODUCT);
    return this.http.get<any[]>(this.apiUrl.GET_MY_ALL_PRODUCT, {
      headers: {
        'Authorization': this.getHeaderToken()
      }
    }).pipe(
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
  updateProduct(id: string, product: Product): void {
    // This method would typically update an existing product
    this.http.put(`${this.apiUrl.UPDATE_PRODUCT(id)}`, product, {
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
  async deleteImageInProduct(id: string): Promise<void> {
    console.log(this.apiUrl.DELETE_IMG_BY_Media_ID(id))
    try {
      this.http.delete(this.apiUrl.DELETE_IMG_BY_Media_ID(id), {
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
    } catch (error: any) {
      console.log("delete requets error")
      throw new Error('No token found' + error.error);
    }
  }

  async addImageInProduct(id: string, formdata: File[]): Promise<void> {
    console.log(this.apiUrl.ADD_IMG_BY_PRODUCT_ID(id))
    for (let index = 0; index < formdata.length; index++) {
      const file = formdata[index];
      let formulaire = new FormData();
      formulaire.append("file", file);
      try {
        this.http.post(this.apiUrl.ADD_IMG_BY_PRODUCT_ID(id), formulaire, {
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
      } catch (error: any) {
        throw new Error('No token found' + error.error);
      }
       await new Promise(resolve => setTimeout(resolve,100))
    }

  }
}
