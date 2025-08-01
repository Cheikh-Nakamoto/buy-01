import { Signal } from "@angular/core";

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CLIENT' | 'SELLER';
  avatar?: string;
  password?: string;
  createdAt: Date;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  size: number;
  uploadedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  quantity: number;
  imageUrls: productImage[];
  sellerName: string;
  sellerAvatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface productImage {
  id: string;
  imagePath: string;
  productId: string;
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  userId: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  name?: string;
  role?: 'CLIENT' | 'SELLER';
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  sellerName?: string;
  imageUrls: string[];
}

export interface UploadProgress {
  file: File;
  progress: number;
  completed: boolean;
  error?: string;
}

export interface AuthResponse {
  user?: User;
  token: string;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ErrorMessage{
  error : string;
  success : string;
}