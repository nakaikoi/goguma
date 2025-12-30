/**
 * API client for backend communication
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config/env.js';
import { supabase } from './supabase.js';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
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
        return Promise.reject(error);
      }
    );
  }

  // Items API
  async createItem() {
    const response = await this.client.post('/items');
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
    const formData = new FormData();
    images.forEach((image, index) => {
      // React Native FormData format
      formData.append('images[]', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.name || `image-${index}.jpg`,
      } as any);
    });

    // Get auth token for this request
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await this.client.post(`/items/${itemId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return response.data.data;
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

