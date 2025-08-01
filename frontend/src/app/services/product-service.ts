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
export class ProductService {

  constructor(private apiUrl: ApiUrlService, private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    console.log('Fetching products from:', this.apiUrl.GET_ALL_PRODUCTS);
    return this.http.get<Product[]>(this.apiUrl.GET_ALL_PRODUCTS).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching products:', error);
        return throwError(() => handleHttpError(error));
      })
    );
  }

  getMyProduct(): Observable<Product[]> {
    console.log('Fetching products from:', this.apiUrl.GET_MY_ALL_PRODUCT);
    return this.http.get<Product[]>(this.apiUrl.GET_MY_ALL_PRODUCT, {
      headers: {
        'Authorization': this.getHeaderToken()
      }
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching my products:', error);
        return throwError(() => handleHttpError(error));
      })
    );
  }

  getProductById(id: number): string {
    // TODO: Implémenter la vraie logique
    return `Product ${id}`;
  }

  private getHeaderToken(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    return `Bearer ${token}`;
  }

  // ✅ Version améliorée - retourne une Promise avec ServiceResponse
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

  // ✅ Version améliorée - retourne une Promise avec ServiceResponse
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

  // ✅ Version améliorée - retourne une Promise avec ServiceResponse
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

  // ✅ Version améliorée - retourne une Promise avec ServiceResponse
  async addImageInProduct(id: string, formdata: File[]): Promise<ServiceResponse> {
    try {
      console.log('Adding images to product:', this.apiUrl.ADD_IMG_BY_PRODUCT_ID(id));

      const results: any[] = [];
      const errors: string[] = [];

      // Traitement séquentiel des fichiers
      for (let index = 0; index < formdata.length; index++) {
        const file = formdata[index];
        const formulaire = new FormData();
        formulaire.append("file", file);

        try {
          const response = await firstValueFrom(
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

          results.push({ file: file.name, response });
          console.log(`Image ${file.name} uploaded successfully`);

        } catch (error: any) {
          const errorMsg = `Failed to upload ${file.name}: ${error.message}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }

        // Délai anti-spam
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
          error: `Failed to upload all images: ${errors.join(', ')}`
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




  // ✅ Version améliorée - retourne une Promise avec ServiceResponse
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



  // ✅ Méthode utilitaire pour retry avec backoff exponentiel
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
}