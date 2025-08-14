import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user-service';
import { ApiUrlService } from './api-url-service';
import { User, ServiceResponse } from '../models/interfaces';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let apiUrlService: jasmine.SpyObj<ApiUrlService>;
  let mockUser: User;

  // Mock localStorage
  let mockLocalStorage: { [key: string]: string } = {};

  beforeEach(() => {
    // Mock ApiUrlService
    const apiUrlSpy = jasmine.createSpyObj('ApiUrlService', [], {
      GET_CURRENT_USER: '/api/user/profile',
      UPDATE_USER: jasmine.createSpy('UPDATE_USER').and.returnValue('/api/user/update'),
      UPDATE_AVATAR: '/api/user/avatar',
      DELETE_USER: '/api/user/delete'
    });

    // Setup mock localStorage
    mockLocalStorage = {
      'token': 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiUk9MRV9TRUxMRVIiLCJzdWIiOiJhemVydHlmZXBwZG91Z291QGdtYWlsLmNvbSIsImlhdCI6MTc1NDk5NjAyOSwiZXhwIjoxNzU1MDMyMDI5fQ.gT7BIqQYbtWfxH3PDAKcjzk0QW8S_fcvVzMySOvmH5A'
    };

    spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => mockLocalStorage[key] = value);
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => delete mockLocalStorage[key]);

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        UserService,
        { provide: ApiUrlService, useValue: apiUrlSpy }
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    apiUrlService = TestBed.inject(ApiUrlService) as jasmine.SpyObj<ApiUrlService>;

    // Mock user data
    mockUser = {
      id: '',
      email: 'azertyfeppdougou@gmail.com',
      name: 'cheikh Mounirou coly Diouf',
      role: 'SELLER',
      avatar: 'avatar.jpg',
      createdAt: new Date(),
    };
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

  describe('getProfile()', () => {
    it('should fetch user profile successfully', (done) => {
      service.getProfile().subscribe({
        next: (user) => {
          expect(user).toEqual(mockUser);
          expect(service.getCurrentUser()).toEqual(mockUser);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne('/api/user/profile');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer ' + mockLocalStorage['token']);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(mockUser);
    });

    it('should handle error when fetching profile', (done) => {
      service.getProfile().subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne('/api/user/profile');
      req.flush('Profile not found', { status: 404, statusText: 'Not Found' });
    });

    it('should throw error when no token is available', () => {
      mockLocalStorage = {}; // Clear token

      expect(() => {
        service.getProfile().subscribe();
      }).toThrowError('No authentication token found. Please log in again.');
    });
  });

  describe('getProfileAsync()', () => {
    it('should fetch user profile successfully with async method', async () => {
      const profilePromise = service.getProfileAsync();

      const req = httpMock.expectOne('/api/user/profile');
      req.flush(mockUser);

      const result = await profilePromise;

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(result.message).toBe('Profile loaded successfully!');
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    it('should handle error in async profile fetch', async () => {
      const profilePromise = service.getProfileAsync();

      const req = httpMock.expectOne('/api/user/profile');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      const result = await profilePromise;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateProfile()', () => {
    it('should update user profile successfully', async () => {
      const updateData: Partial<User> = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateData };

      // Mock getCurrentUserId to return a valid ID
      spyOn<any>(service, 'getCurrentUserId').and.returnValue('123');

      const updatePromise = service.updateProfile(updateData);

      const req = httpMock.expectOne('/api/user/update');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(updatedUser);

      const result = await updatePromise;

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedUser);
      expect(result.message).toBe('Profile updated successfully!');
    });

    it('should handle error in profile update', async () => {
      const updateData: Partial<User> = { name: 'Updated Name' };
      spyOn<any>(service, 'getCurrentUserId').and.returnValue('123');

      const updatePromise = service.updateProfile(updateData);

      const req = httpMock.expectOne('/api/user/update');
      req.flush('Update failed', { status: 400, statusText: 'Bad Request' });

      const result = await updatePromise;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateAvatar()', () => {
    let mockFile: File;

    beforeEach(() => {
      // Create a mock file
      mockFile = new File(['dummy content'], 'avatar.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024, writable: false }); // 1MB
    });

    it('should update avatar successfully with valid file', async () => {
      const mockResponse = { avatarUrl: 'new-avatar.jpg' };

      const updatePromise = service.updateAvatar(mockFile);

      const req = httpMock.expectOne('/api/user/avatar');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body instanceof FormData).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe('Bearer ' + mockLocalStorage['token']);
      req.flush(mockResponse);

      const result = await updatePromise;

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(result.message).toBe('Avatar updated successfully!');
    });

    it('should reject file with invalid type', async () => {
      const invalidFile = new File(['dummy'], 'test.txt', { type: 'text/plain' });

      const result = await service.updateAvatar(invalidFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid file format. Please use JPG, PNG, GIF, or WebP.');
    });

    it('should reject file that is too large', async () => {
      const largeFile = new File(['dummy content'], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024, writable: false }); // 6MB

      const result = await service.updateAvatar(largeFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('File is too large. Maximum size is 5MB.');
    });

    it('should reject empty file', async () => {
      const emptyFile = new File([''], 'empty.jpg', { type: 'image/jpeg' });
      Object.defineProperty(emptyFile, 'size', { value: 0, writable: false });

      const result = await service.updateAvatar(emptyFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('File is empty. Please select a valid image.');
    });
  });

  describe('Authentication methods', () => {
    it('should return true when user is logged in', () => {
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when user is not logged in', () => {
      mockLocalStorage = {}; // Clear token
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should logout user and clear data', () => {
      // Set a current user first
      service.getProfile().subscribe();
      const req = httpMock.expectOne('/api/user/profile');
      req.flush(mockUser);

      expect(service.getCurrentUser()).toEqual(mockUser);

      service.logout();

      expect(service.getCurrentUser()).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    });

    it('should get current user', () => {
      // Initially null
      expect(service.getCurrentUser()).toBeNull();

      // Set user through getProfile
      service.getProfile().subscribe();
      const req = httpMock.expectOne('/api/user/profile');
      req.flush(mockUser);

      expect(service.getCurrentUser()).toEqual(mockUser);
    });
  });

  describe('File validation', () => {
    it('should validate image file correctly', () => {
      const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(validFile, 'size', { value: 1024, writable: false });

      const result = (service as any).validateImageFile(validFile);
      expect(result.isValid).toBe(true);
    });

    it('should accept all valid image formats', () => {
      const formats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

      formats.forEach(format => {
        const file = new File(['content'], `test.${format.split('/')[1]}`, { type: format });
        Object.defineProperty(file, 'size', { value: 1024, writable: false });

        const result = (service as any).validateImageFile(file);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('Retry mechanism', () => {
    it('should retry operation and succeed on second attempt', async () => {
      let attempts = 0;
      const operation = jasmine.createSpy('operation').and.callFake(() => {
        attempts++;
        if (attempts === 1) {
          return Promise.reject(new Error('First attempt failed'));
        }
        return Promise.resolve('Success');
      });

      const result = await service.retryOperation(operation, 3, 100);

      expect(result).toBe('Success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      const operation = jasmine.createSpy('operation').and.returnValue(Promise.reject(new Error('Always fails')));

      try {
        await service.retryOperation(operation, 2, 50);
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toBe('Always fails');
        expect(operation).toHaveBeenCalledTimes(2);
      }
    });
  });

  describe('currentUser$ Observable', () => {
    it('should emit user changes', (done) => {
      let emissionCount = 0;

      service.currentUser$.subscribe(user => {
        emissionCount++;

        if (emissionCount === 1) {
          expect(user).toBeNull(); // Initial value
        } else if (emissionCount === 2) {
          expect(user).toEqual(mockUser);
          done();
        }
      });

      // Trigger a profile fetch to update the user
      service.getProfile().subscribe();
      const req = httpMock.expectOne('/api/user/profile');
      req.flush(mockUser);
    });
  });
});