import { Injectable, OnInit } from '@angular/core';
import { ApiUrlService } from './api-url-service';
import { Product } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private apiUrl: ApiUrlService) { }

  async getProducts(): Promise<Product[]> {
    // This method would typically fetch products from an API or database
    try {
      const response = await fetch(this.apiUrl.GET_ALL_PRODUCTS);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return await response.json();
    } catch (error) {
      
    }
    return [];
  }
  getProductById(id: number): string {
    // This method would typically fetch a product by its ID
    return `Product ${id}`;
  }
  addProduct(product: string): void {
    // This method would typically add a new product to the database
    console.log(`Product added: ${product}`);
  }
  updateProduct(id: number, product: string): void {
    // This method would typically update an existing product
    console.log(`Product updated: ${id} - ${product}`);
  }
  deleteProduct(id: number): void {
    // This method would typically delete a product by its ID
    console.log(`Product deleted: ${id}`);
  }
}
