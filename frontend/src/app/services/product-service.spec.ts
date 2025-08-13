import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductService } from './product-service';
import { ApiUrlService } from './api-url-service';
import { Product, ServiceResponse } from '../models/interfaces';
import { HttpErrorResponse, HttpResponse, provideHttpClient } from '@angular/common/http';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  let apiUrlService: jasmine.SpyObj<ApiUrlService>;
  let mockProducts: Product[];
  let mockProduct: Product;

  // Mock localStorage
  let mockLocalStorage: { [key: string]: string } = {};

  beforeEach(() => {
    // Mock ApiUrlService
    const apiUrlSpy = jasmine.createSpyObj('ApiUrlService', [], {
      GET_ALL_PRODUCTS: '/api/products',
      GET_MY_ALL_PRODUCT: '/api/products/my',
      GET_PRODUCT_BY_ID: jasmine.createSpy('GET_PRODUCT_BY_ID').and.returnValue('/api/products/123'),
      CREATE_PRODUCT: '/api/products',
      UPDATE_PRODUCT: jasmine.createSpy('UPDATE_PRODUCT').and.returnValue('/api/products/123'),
      DELETE_PRODUCT_BY_ID: jasmine.createSpy('DELETE_PRODUCT_BY_ID').and.returnValue('/api/products/123'),
      DELETE_IMG_BY_Media_ID: jasmine.createSpy('DELETE_IMG_BY_Media_ID').and.returnValue('/api/images/456'),
      ADD_IMG_BY_PRODUCT_ID: jasmine.createSpy('ADD_IMG_BY_PRODUCT_ID').and.returnValue('/api/products/123/images')
    });

    // Setup mock localStorage
    mockLocalStorage = {
      'token': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiUk9MRV9TRUxMRVIiLCJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjkwMDAwMDAwLCJleHAiOjE2OTAwMzYwMDB9.test'
    };

    spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => mockLocalStorage[key] = value);
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => delete mockLocalStorage[key]);

    TestBed.configureTestingModule({

      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ProductService,
        { provide: ApiUrlService, useValue: apiUrlSpy }
      ]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
    apiUrlService = TestBed.inject(ApiUrlService) as jasmine.SpyObj<ApiUrlService>;

    // Mock data
    mockProduct = {
      id: '123',
      name: 'Test Product',
      description: 'Test Description',
      quantity: 10,
      price: 99.99,
      category: 'electronics',
      imageUrls: [],
      sellerName: 'TechCorp',
      sellerAvatar: 'https://example.com/avatars/techcorp.jpg',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-20')
    };

    mockProducts = [
      mockProduct,
      {
        id: '456',
        name: 'Second Product',
        description: 'Second Description',
        price: 149.99,
        category: 'clothing',
        quantity: 10,

        imageUrls: [],
        sellerName: 'TechCorp',
        sellerAvatar: 'https://example.com/avatars/techcorp.jpg',
        createdAt: new Date('2023-01-15'),
      }
    ];
  });

  afterEach(() => {
    httpMock.verify();
    mockLocalStorage = {};
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('getProducts()', () => {
    it('should fetch all products successfully', (done) => {
      service.getProducts().subscribe({
        next: (products) => {
          expect(products).toEqual(mockProducts);
          expect(products.length).toBe(2);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne('/api/products');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBeNull(); // Public endpoint
      req.flush(mockProducts);
    });

    it('should handle error when fetching all products', (done) => {
      service.getProducts().subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne('/api/products');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getMyProduct()', () => {
    it('should fetch user products with authentication', (done) => {
      service.getMyProduct().subscribe({
        next: (products) => {
          expect(products).toEqual(mockProducts);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne('/api/products/my');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer ' + mockLocalStorage['token']);
      req.flush(mockProducts);
    });

    it('should handle error when fetching my products', (done) => {
      service.getMyProduct().subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne('/api/products/my');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should throw error when no token is available', () => {
      mockLocalStorage = {}; // Clear token

      expect(() => {
        service.getMyProduct().subscribe();
      }).toThrowError('No authentication token found. Please log in again.');
    });
  });

  describe('getProductById()', () => {
    it('should fetch product by id successfully', async () => {
      const productPromise = service.getProductById('123');

      const req = httpMock.expectOne('/api/products/123');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer ' + mockLocalStorage['token']);
      req.flush(mockProduct);

      const result = await productPromise;

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProduct);
    });

    it('should handle error when fetching product by id', async () => {
      const productPromise = service.getProductById('123');

      const req = httpMock.expectOne('/api/products/123');
      req.flush('Product not found', { status: 404, statusText: 'Not Found' });

      const result = await productPromise;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('addProduct()', () => {
    it('should add product successfully', async () => {
      const formData = new FormData();
      formData.append('name', 'New Product');
      formData.append('description', 'New Description');

      const productPromise = service.addProduct(formData);

      const req = httpMock.expectOne('/api/products');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(formData);
      expect(req.request.headers.get('Authorization')).toBe('Bearer ' + mockLocalStorage['token']);
      req.flush({ ...mockProduct });

      const result = await productPromise;

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product created successfully!');
      expect(result.data).toBeDefined();
    });

    it('should handle error when adding product', async () => {
      const formData = new FormData();

      const productPromise = service.addProduct(formData);

      const req = httpMock.expectOne('/api/products');
      req.flush('Validation error', { status: 400, statusText: 'Bad Request' });

      const result = await productPromise;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateProduct()', () => {
    it('should update product successfully', async () => {
      const updatedProduct = { ...mockProduct, name: 'Updated Product' };

      const updatePromise = service.updateProduct('123', updatedProduct);

      const req = httpMock.expectOne('/api/products/123');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedProduct);
      expect(req.request.headers.get('Authorization')).toBe('Bearer ' + mockLocalStorage['token']);
      req.flush(updatedProduct);

      const result = await updatePromise;

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product updated successfully!');
      expect(result.data).toEqual(updatedProduct);
    });

    it('should handle error when updating product', async () => {
      const updatePromise = service.updateProduct('123', mockProduct);

      const req = httpMock.expectOne('/api/products/123');
      req.flush('Product not found', { status: 404, statusText: 'Not Found' });

      const result = await updatePromise;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('deleteProduct()', () => {
    it('should delete product successfully', async () => {
      const deletePromise = service.deleteProduct('123');

      const req = httpMock.expectOne('/api/products/123');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe('Bearer ' + mockLocalStorage['token']);

      // Simulate successful response
      const mockResponse = new HttpResponse({
        status: 200,
        statusText: 'OK',
        body: { message: 'Product deleted' }
      });
      req.flush({ message: 'Product deleted' }, { status: 200, statusText: 'OK' });

      const result = await deletePromise;

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product deleted successfully!');
    });

    it('should handle error when deleting product', async () => {
      const deletePromise = service.deleteProduct('123');

      const req = httpMock.expectOne('/api/products/123');
      req.flush('Product not found', { status: 404, statusText: 'Not Found' });

      const result = await deletePromise;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle status 200 error case', async () => {
      const deletePromise = service.deleteProduct('123');

      const req = httpMock.expectOne('/api/products/123');
      // Simulate Angular treating status 200 as error
      req.error(new ProgressEvent('error'), { status: 200 });

      const result = await deletePromise;

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product deleted successfully!');
    });
  });

  describe('deleteImageInProduct()', () => {
    it('should delete image successfully', async () => {
      const deletePromise = service.deleteImageInProduct('456');

      const req = httpMock.expectOne('/api/images/456');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe('Bearer ' + mockLocalStorage['token']);
      req.flush({ message: 'Image deleted' }, { status: 200, statusText: 'OK' });

      const result = await deletePromise;

      expect(result.success).toBe(true);
      expect(result.message).toBe('Image deleted successfully!');
    });

    it('should handle error when deleting image', async () => {
      const deletePromise = service.deleteImageInProduct('456');

      const req = httpMock.expectOne('/api/images/456');
      req.flush('Image not found', { status: 404, statusText: 'Not Found' });

      const result = await deletePromise;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('addImageInProduct()', () => {
    let mockFiles: File[];

    beforeEach(() => {
      mockFiles = [
        new File(['image1'], 'image1.jpg', { type: 'image/jpeg' }),
        new File(['image2'], 'image2.jpg', { type: 'image/jpeg' })
      ];
    });

    it('should upload all images successfully', fakeAsync(async () => {
      const uploadPromise = service.addImageInProduct('123', mockFiles);

      // Traiter chaque requête individuellement
      mockFiles.forEach((file, index) => {
        tick(index === 0 ? 0 : 100); // Premier appel immédiat, puis 100ms de délai

        const req = httpMock.expectOne('/api/products/123/images');
        expect(req.request.method).toBe('POST');
        expect(req.request.body instanceof FormData).toBe(true);

        // Vérifier le contenu du FormData
        const formData = req.request.body as FormData;
        const uploadedFile = formData.get('file') as File;
        expect(uploadedFile.name).toBe(file.name);

        req.flush({ url: `uploaded_${file.name}` });
      });

      tick(); // S'assurer que toutes les opérations asynchrones sont terminées



      const result = await uploadPromise;

      expect(result.success).toBe(true);
      expect(result.message).toBe('All 2 image(s) uploaded successfully!');
      expect(result.data.length).toBe(2);
    }));

    it('should handle partial upload success', fakeAsync(async () => {
      const uploadPromise = service.addImageInProduct('123', mockFiles);

      // Traiter chaque requête individuellement
      mockFiles.forEach((file, index) => {
        tick(index === 0 ? 0 : 100); // Premier appel immédiat, puis 100ms de délai

        const req = httpMock.expectOne('/api/products/123/images');
        expect(req.request.method).toBe('POST');
        expect(req.request.body instanceof FormData).toBe(true);

        // Vérifier le contenu du FormData
        const formData = req.request.body as FormData;
        const uploadedFile = formData.get('file') as File;
        expect(uploadedFile.name).toBe(file.name);

        index === 0 ? req.flush({ url: `uploaded_${file.name}` }) : req.flush('Upload failed', { status: 500, statusText: 'Internal Server Error' }); // Error
      });

      tick(); // S'assurer que toutes les opérations asynchrones sont terminées

      const result = await uploadPromise;

      expect(result.success).toBe(false);
      expect(result.data).toBeDefined();
      expect(result.data.uploaded.length).toBe(1);
      expect(result.data.errors.length).toBe(1);
    }));

    it('should handle all uploads failing', fakeAsync(async () => {
      const uploadPromise = service.addImageInProduct('123', mockFiles);

      mockFiles.forEach((file, index) => {
        tick(index === 0 ? 0 : 100); // Premier appel immédiat, puis 100ms de délai
        const req = httpMock.expectOne('/api/products/123/images');
        req.flush('Upload failed', { status: 500, statusText: 'Internal Server Error' });
      });

      tick(); // S'assurer que toutes les opérations asynchrones sont terminées

      const result = await uploadPromise;

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to upload images');
    }));

    it('should handle empty file array', fakeAsync(async () => {
      const result = await service.addImageInProduct('123', []);

      expect(result.success).toBe(true);
      expect(result.message).toBe('All 0 image(s) uploaded successfully!');
    }));
  });


  describe('Authentication', () => {
    it('should throw error when token is missing', () => {
      mockLocalStorage = {}; // Clear token

      expect(() => {
        (service as any).getHeaderToken();
      }).toThrowError('No authentication token found. Please log in again.');
    });

    it('should return formatted header token', () => {
      const token = (service as any).getHeaderToken();
      expect(token).toBe('Bearer ' + mockLocalStorage['token']);
    });
  });

  // describe('retryOperation()', () => {

  //   it('should succeed on first attempt', async () => {
  //     const operation = jasmine.createSpy('operation').and.returnValue(Promise.resolve('success'));

  //     const result = await service.retryOperation(operation);

  //     expect(result).toBe('success');
  //     expect(operation).toHaveBeenCalledTimes(1);
  //   });

  //   it('should retry and succeed on second attempt', async () => {
  //     let attempts = 0;
  //     const operation = jasmine.createSpy('operation').and.callFake(() => {
  //       attempts++;
  //       if (attempts === 1) {
  //         return Promise.reject(new Error('First attempt failed'));
  //       }
  //       return Promise.resolve('success');
  //     });

  //     const result = await service.retryOperation(operation, 3, 100);

  //     expect(result).toBe('success');
  //     expect(operation).toHaveBeenCalledTimes(2);
  //   });

  //   it('should fail after max retries', async () => {
  //     const operation = jasmine.createSpy('operation').and.returnValue(Promise.reject(new Error('Always fails')));

  //     try {
  //       await service.retryOperation(operation, 2, 50);
  //       fail('Should have thrown error');
  //     } catch (error: any) {
  //       expect(error.message).toBe('Always fails');
  //       expect(operation).toHaveBeenCalledTimes(2);
  //     }
  //   });

  //   it('should use exponential backoff', async () => {
  //     jasmine.clock().install();

  //     const operation = jasmine.createSpy('operation').and.returnValue(Promise.reject(new Error('Always fails')));
  //     const delaySpy = spyOn(window, 'setTimeout').and.callThrough();

  //     const retryPromise = service.retryOperation(operation, 3, 100);

  //     // Fast-forward time to complete retries
  //     jasmine.clock().tick(10000);

  //     try {
  //       await retryPromise;
  //     } catch (error) {
  //       // Expected to fail
  //     }

  //     expect(delaySpy).toHaveBeenCalledWith(jasmine.any(Function), 100); // First retry delay
  //     expect(delaySpy).toHaveBeenCalledWith(jasmine.any(Function), 200); // Second retry delay

  //     jasmine.clock().uninstall();
  //   });
  // });

  describe('Console logging', () => {
    it('should log when fetching products', () => {
      spyOn(console, 'log');

      service.getProducts().subscribe();
      httpMock.expectOne('/api/products').flush([]);

      expect(console.log).toHaveBeenCalledWith('Fetching products from:', '/api/products');
    });

    it('should log errors', () => {
      spyOn(console, 'error');

      service.getProducts().subscribe({
        error: () => { } // Handle error to prevent test failure
      });

      const req = httpMock.expectOne('/api/products');
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });

      expect(console.error).toHaveBeenCalledWith('Error fetching products:', jasmine.any(HttpErrorResponse));
    });
  });
});