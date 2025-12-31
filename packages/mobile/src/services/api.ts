/**
 * API client for backend communication
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config/env';
import { supabase } from './supabase';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: 120000, // 2 minutes for image uploads
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use(
      async (config) => {
        const session = await supabase.auth.getSession();
        if (session.data.session?.access_token) {
          config.headers.Authorization = `Bearer ${session.data.session.access_token}`;
        }
        
        // Remove Content-Type for FormData - axios will set it with boundary automatically
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
          delete config.headers['content-type'];
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const { data, error: refreshError } = await supabase.auth.refreshSession();
          if (!refreshError && data.session) {
            // Retry original request
            if (error.config) {
              error.config.headers.Authorization = `Bearer ${data.session.access_token}`;
              return this.client.request(error.config);
            }
          }
          // If refresh fails, redirect to login
          throw new Error('Session expired. Please log in again.');
        }
        
        // Log 400 errors with more detail
        if (error.response?.status === 400) {
          console.error('Bad Request (400):', {
            url: error.config?.url,
            method: error.config?.method,
            data: error.response?.data,
            headers: error.config?.headers,
          });
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Items API
  async createItem() {
    // POST /items expects an empty body {}
    const response = await this.client.post('/items', {});
    return response.data.data;
  }

  async getItems(status?: string) {
    const params = status ? { status } : {};
    const response = await this.client.get('/items', { params });
    return response.data.data;
  }

  async getItem(itemId: string) {
    const response = await this.client.get(`/items/${itemId}`);
    return response.data.data;
  }

  async updateItemStatus(itemId: string, status: string) {
    const response = await this.client.patch(`/items/${itemId}`, { status });
    return response.data.data;
  }

  async deleteItem(itemId: string) {
    await this.client.delete(`/items/${itemId}`);
  }

  // Images API
  async uploadImages(itemId: string, images: { uri: string; type: string; name: string }[]) {
    console.log('📤 Starting image upload...');
    console.log('API URL:', this.client.defaults.baseURL);
    console.log('Item ID:', itemId);
    console.log('Image count:', images.length);
    console.log('Image URIs:', images.map(img => img.uri));
    
    const formData = new FormData();
    images.forEach((image, index) => {
      // React Native FormData format
      // Fastify multipart expects files with the same field name
      const fileData = {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.name || `image-${index}.jpg`,
      };
      console.log(`Adding image ${index + 1}:`, fileData);
      formData.append('images', fileData as any);
    });

    // Get auth token for this request
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    console.log('Auth token:', token ? 'Present' : 'Missing');

    const uploadUrl = `/items/${itemId}/images`;
    console.log('📡 Uploading to:', `${this.client.defaults.baseURL}${uploadUrl}`);
    
    try {
      // For React Native FormData, axios should automatically detect and set Content-Type
      // But we need to ensure it's not being overridden
      const config = {
        headers: {
          // DO NOT set Content-Type - let axios detect FormData and set it with boundary
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        timeout: 120000, // 2 minutes specifically for image uploads
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`📊 Upload progress: ${percentCompleted}% (${progressEvent.loaded}/${progressEvent.total} bytes)`);
          } else {
            console.log(`📊 Upload progress: ${progressEvent.loaded} bytes uploaded`);
          }
        },
      };
      
      // React Native FormData - axios should automatically detect and set Content-Type
      // The interceptor will remove any default Content-Type header
      const response = await this.client.post(uploadUrl, formData, config);
      console.log('✅ Upload successful:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Upload failed:', error.message);
      console.error('Error details:', {
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  async getItemImages(itemId: string) {
    const response = await this.client.get(`/items/${itemId}/images`);
    return response.data.data;
  }

  async deleteImage(imageId: string) {
    await this.client.delete(`/images/${imageId}`);
  }

  // AI API
  async analyzeItem(itemId: string) {
    const response = await this.client.post(`/items/${itemId}/analyze`);
    return response.data.data;
  }

  async getDraft(itemId: string) {
    const response = await this.client.get(`/items/${itemId}/draft`);
    return response.data.data;
  }
}

export const api = new ApiClient();

