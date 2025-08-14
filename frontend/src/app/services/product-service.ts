import { Injectable } from '@angular/core';
import { ApiUrlService } from './api-url-service';
import { Product, ServiceResponse } from '../models/interfaces';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, firstValueFrom, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { handleHttpError } from '../utils/utils';


@Injectable({
  providedIn: 'root'
})
/**
 * Service for managing product-related operations, including fetching, adding, updating,
 * and deleting products and their associated images.
 */
export class ProductService {

  constructor(private apiUrl: ApiUrlService, private http: HttpClient) { }

  /**
   * Fetches all products from the backend.
   * @returns An Observable that emits an array of Product objects.
   */
  getProducts(): Observable<Product[]> {
    console.log('Fetching products from:', this.apiUrl.GET_ALL_PRODUCTS);
    return this.http.get<Product[]>(this.apiUrl.GET_ALL_PRODUCTS).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching products:', error);
        return throwError(() => handleHttpError(error));
      })
    );
  }

  /**
   * Fetches products owned by the current authenticated user from the backend.
   * Requires an authentication token.
   * @returns An Observable that emits an array of Product objects.
   */
  getMyProduct(): Observable<Product[]> {
    console.log('Fetching products from:', this.apiUrl.GET_MY_ALL_PRODUCT);
    return this.http.get<Product[]>(this.apiUrl.GET_MY_ALL_PRODUCT, {
      headers: {
        'Authorization': this.getHeaderToken()
      }
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        // const err  = error.error;
        console.error('Test Error fetching my products:', error);
        return throwError(() => handleHttpError(error));
      })
    );
  }

  /**
 * Récupère un produit par son ID depuis le backend.
 * @param id L'ID du produit à récupérer.
 * @returns Une Promise qui résout avec le produit ou une erreur.
 */
  async getProductById(id: string): Promise<ServiceResponse> {
    try {
      const response = await firstValueFrom(
        this.http.get<Product>(this.apiUrl.GET_PRODUCT_BY_ID(id), {
          headers: {
            'Authorization': this.getHeaderToken()
          }
        }).pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Error fetching product by ID:', error);
            return throwError(() => handleHttpError(error));
          })
        )
      );
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: handleHttpError(error).message
      };
    }
  }

  /**
    * Retrieves the authentication token from local storage and formats it for HTTP headers.
    * @returns The formatted authorization header string.
    * @throws Error if no authentication token is found.
    */
  private getHeaderToken(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    return `Bearer ${token}`;
  }

  /**
   * Adds a new product to the backend.
   * @param product The FormData object containing product details and images.
   * @returns A Promise that resolves to a ServiceResponse indicating success or failure.
   */
  async addProduct(product: FormData): Promise<ServiceResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post(this.apiUrl.CREATE_PRODUCT, product, {
          headers: {
            'Authorization': this.getHeaderToken()
          }
        }).pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Error adding product:', error);
            return throwError(() => handleHttpError(error));
          })
        )
      );

      console.log('Product added successfully:', response);
      return {
        success: true,
        data: response,
        message: 'Product created successfully!'
      };

    } catch (error: any) {
      console.error('Error in addProduct:', error);
      return {
        success: false,
        error: error.message || 'Failed to create product'
      };
    }
  }

  /**
   * Updates an existing product on the backend.
   * @param id The ID of the product to update.
   * @param product The Product object containing the updated details.
   * @returns A Promise that resolves to a ServiceResponse indicating success or failure.
   */
  async updateProduct(id: string, product: Product): Promise<ServiceResponse> {
    try {
      const response = await firstValueFrom(
        this.http.put(`${this.apiUrl.UPDATE_PRODUCT(id)}`, product, {
          headers: {
            'Authorization': this.getHeaderToken()
          }
        }).pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Error updating product:', error);
            return throwError(() => handleHttpError(error));
          })
        )
      );

      console.log('Product updated successfully:', response);
      return {
        success: true,
        data: response,
        message: 'Product updated successfully!'
      };

    } catch (error: any) {
      console.error('Error in updateProduct:', error);
      return {
        success: false,
        error: error.message || 'Failed to update product'
      };
    }
  }

  /**
   * Deletes an image associated with a product from the backend.
   * @param id The ID of the image to delete.
   * @returns A Promise that resolves to a ServiceResponse indicating success or failure.
   */
  async deleteImageInProduct(id: string): Promise<ServiceResponse> {
    try {
      console.log('Deleting image:', this.apiUrl.DELETE_IMG_BY_Media_ID(id));

      const response = await firstValueFrom(
        this.http.delete(this.apiUrl.DELETE_IMG_BY_Media_ID(id), {
          headers: {
            'Authorization': this.getHeaderToken()
          },
          observe: 'response'
        }).pipe(
          // Traitement des réponses réussies (200-299)
          map((httpResponse: HttpResponse<any>) => {
            if (httpResponse.ok) {
              return {
                success: true,
                data: httpResponse.body,
                message: 'Image deleted successfully!'
              };
            }
            console.log("effac")
            // Si le statut n'est pas dans la plage 200-299
            return {
              success: false,
              error: `Unexpected status code: ${httpResponse.status}`,
              status: httpResponse.status
            };
          }),
          catchError((error: HttpErrorResponse) => {
            if (error.status === 200) {
              // cas où Angular considère à tort qu'il y a une erreur
              return of({
                success: true,
                data: null,
                message: 'Image deleted successfully (handled)'
              });
            }
            return throwError(() => handleHttpError(error));
          })
        )
      );

      console.log('Image deleted successfully:', response);
      return {
        success: true,
        data: response,
        message: 'Image deleted successfully!'
      };

    } catch (error: any) {
      // Pour les autres erreurs
      return {
        success: false,
        error: handleHttpError(error).message,
      };
    }
  }

  /**
   * Uploads a single image to a product.
   * @param id The ID of the product.
   * @param file The image file to upload.
   * @returns A Promise resolving to the upload result or throwing an error.
   */
  private async uploadSingleImage(id: string, file: File): Promise<any> {
    const formulaire = new FormData();
    formulaire.append("file", file);

    return await firstValueFrom(
      this.http.post(this.apiUrl.ADD_IMG_BY_PRODUCT_ID(id), formulaire, {
        headers: {
          'Authorization': this.getHeaderToken()
        }
      }).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(`Error uploading file ${file.name}:`, error);
          return throwError(() => handleHttpError(error));
        })
      )
    );
  }

  /**
   * Adds one or more images to an existing product on the backend.
   * @param id The ID of the product to add images to.
   * @param formdata An array of File objects representing the images to upload.
   * @returns A Promise that resolves to a ServiceResponse.
   */
  async addImageInProduct(id: string, formdata: File[]): Promise<ServiceResponse> {
    try {
      console.log('Adding images to product:', this.apiUrl.ADD_IMG_BY_PRODUCT_ID(id));

      const results: any[] = [];
      const errors: string[] = [];

      for (let index = 0; index < formdata.length; index++) {
        const file = formdata[index];
        console.log('Uploading image:', file.name);
        try {
          const response = await this.uploadSingleImage(id, file);
          console.log(response);
          results.push({ file: file.name, response });
          console.log(`Image ${file.name} uploaded successfully`);
        } catch (error: any) {
          const errorMsg = `${error.message}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }

        // Anti-spam delay
        if (index < formdata.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Évaluation du résultat global
      if (errors.length === 0) {
        return {
          success: true,
          data: results,
          message: `All ${formdata.length} image(s) uploaded successfully!`
        };
      } else if (results.length > 0) {
        return {
          success: false,
          data: { uploaded: results, errors },
          error: `${results.length}/${formdata.length} images uploaded. ${errors.length} failed: ${errors.join(', ')}`
        };
      } else {
        return {
          success: false,
          error: `Failed to upload images: ${errors[0]}`,
        };
      }

    } catch (error: any) {
      console.error('Error in addImageInProduct:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload images'
      };
    }
  }



  /**
   * Deletes a product from the backend.
   * @param id The ID of the product to delete.
   * @returns A Promise that resolves to a ServiceResponse indicating success or failure.
   */
  async deleteProduct(id: string): Promise<ServiceResponse> {
    try {
      console.log('Deleting image:', this.apiUrl.DELETE_PRODUCT_BY_ID(id));

      const response = await firstValueFrom(
        this.http.delete(this.apiUrl.DELETE_PRODUCT_BY_ID(id), {
          headers: {
            'Authorization': this.getHeaderToken()
          },
          observe: 'response'
        }).pipe(
          // Traitement des réponses réussies (200-299)
          map((httpResponse: HttpResponse<any>) => {
            if (httpResponse.ok) {
              return {
                success: true,
                data: httpResponse.body,
                message: 'Product deleted successfully!'
              };
            }
            // Si le statut n'est pas dans la plage 200-299
            return {
              success: false,
              error: `Unexpected status code: ${httpResponse.status}`,
              status: httpResponse.status
            };
          }),
          catchError((error: HttpErrorResponse) => {
            if (error.status === 200) {
              // cas où Angular considère à tort qu'il y a une erreur
              return of({
                success: true,
                data: null,
                message: 'Product deleted successfully (handled)'
              });
            }
            return throwError(() => handleHttpError(error));
          })
        )
      );

      console.log('Product deleted successfully:', response);
      return {
        success: true,
        data: response,
        message: 'Product deleted successfully!'
      };

    } catch (error: any) {
      // Pour les autres erreurs
      return {
        success: false,
        error: handleHttpError(error).message,
      };
    }
  }

  // /**
  //  * Utility method to retry an asynchronous operation with exponential backoff.
  //  * @template T The return type of the operation.
  //  * @param operation The asynchronous function to retry.
  //  * @param maxRetries The maximum number of retry attempts. Defaults to 3.
  //  * @param baseDelay The base delay in milliseconds before the first retry. Defaults to 1000ms.
  //  * @returns A Promise that resolves with the result of the operation if successful,
  //  *          or rejects with the last error after all retries are exhausted.
  //  */
  // async retryOperation<T>(
  //   operation: () => Promise<T>,
  //   maxRetries: number = 3,
  //   baseDelay: number = 1000
  // ): Promise<T> {
  //   let lastError: any;

  //   for (let attempt = 1; attempt <= maxRetries; attempt++) {
  //     try {
  //       return await operation();
  //     } catch (error) {
  //       lastError = error;

  //       if (attempt === maxRetries) {
  //         break;
  //       }

  //       // Backoff exponentiel
  //       const delay = baseDelay * Math.pow(2, attempt - 1);
  //       console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
  //       await new Promise(resolve => setTimeout(resolve, delay));
  //     }
  //   }

  //   throw lastError;
  // }
}