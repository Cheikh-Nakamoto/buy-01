import { ApiUrlService } from './api-url-service';

describe('ApiUrlService', () => {
  let service: ApiUrlService;
  const baseUrl = 'https://localhost:8443';

  beforeEach(() => {
    service = new ApiUrlService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have the correct REGISTER URL', () => {
    expect(service.REGISTER).toBe(`${baseUrl}/api/auth/register`);
  });

  it('should have the correct LOGIN URL', () => {
    expect(service.LOGIN).toBe(`${baseUrl}/api/auth/login`);
  });

  it('should have the correct GET_ALL_USERS URL', () => {
    expect(service.GET_ALL_USERS).toBe(`${baseUrl}/api/admin/users/all`);
  });

  it('should return the correct DELETE_USER URL for a given ID', () => {
    const id = 123;
    expect(service.DELETE_USER(id)).toBe(`${baseUrl}/api/admin/users/del/${id}`);
  });

  it('should return the correct UPDATE_USER URL for a given ID', () => {
    const id = 'user123';
    expect(service.UPDATE_USER(id)).toBe(`${baseUrl}/api/users/update/${id}`);
  });

  it('should have the correct UPDATE_AVATAR URL', () => {
    expect(service.UPDATE_AVATAR).toBe(`${baseUrl}/api/users/update/avatar`);
  });

  it('should return the correct GET_USER_BY_ID URL for a given ID', () => {
    const id = 456;
    expect(service.GET_USER_BY_ID(id)).toBe(`${baseUrl}/api/users/profile/${id}`);
  });

  it('should return the correct GET_USER_BY_NAME URL for a given username', () => {
    const userId = 'testuser';
    expect(service.GET_USER_BY_NAME(userId)).toBe(`${baseUrl}/api/users/name/${userId}`);
  });

  it('should have the correct GET_CURRENT_USER URL', () => {
    expect(service.GET_CURRENT_USER).toBe(`${baseUrl}/api/users/me`);
  });

  it('should return the correct GET_USER_BY_EMAIL URL for a given email', () => {
    const email = 'test@example.com';
    expect(service.GET_USER_BY_EMAIL(email)).toBe(`${baseUrl}/api/users/email/${email}`);
  });

  it('should return the correct GET_PRODUCT_BY_ID URL for a given ID', () => {
    const id = 'prod123';
    expect(service.GET_PRODUCT_BY_ID(id)).toBe(`${baseUrl}/api/products/${id}`);
  });

  it('should return the correct UPDATE_PRODUCT URL for a given ID', () => {
    const id = 'prod456';
    expect(service.UPDATE_PRODUCT(id)).toBe(`${baseUrl}/api/products/update/${id}`);
  });

  it('should have the correct CREATE_PRODUCT URL', () => {
    expect(service.CREATE_PRODUCT).toBe(`${baseUrl}/api/products/create`);
  });

  it('should have the correct GET_ALL_PRODUCTS URL', () => {
    expect(service.GET_ALL_PRODUCTS).toBe(`${baseUrl}/api/products/all`);
  });

  it('should have the correct GET_MY_ALL_PRODUCT URL', () => {
    expect(service.GET_MY_ALL_PRODUCT).toBe(`${baseUrl}/api/products/myproducts`);
  });

  it('should return the correct DELETE_IMG_BY_Media_ID URL for a given ID', () => {
    const id = 'media123';
    expect(service.DELETE_IMG_BY_Media_ID(id)).toBe(`${baseUrl}/api/media/delete/${id}`);
  });

  it('should return the correct DELETE_PRODUCT_BY_ID URL for a given ID', () => {
    const id = 'prod789';
    expect(service.DELETE_PRODUCT_BY_ID(id)).toBe(`${baseUrl}/api/products/delete/${id}`);
  });

  it('should return the correct ADD_IMG_BY_PRODUCT_ID URL for a given ID', () => {
    const id = 'prodABC';
    expect(service.ADD_IMG_BY_PRODUCT_ID(id)).toBe(`${baseUrl}/api/media/add/${id}`);
  });
});