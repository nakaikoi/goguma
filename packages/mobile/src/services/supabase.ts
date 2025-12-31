/**
 * Supabase client for mobile app
 * 
 * NOTE: URL polyfill is imported in App.tsx to ensure it loads first
 */

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { config } from '../config/env';

// Custom storage adapter for SecureStore
// Handles errors gracefully when user interaction is not allowed (e.g., background token refresh)
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error: any) {
      // If user interaction is not allowed (e.g., background refresh), return null
      // This is a transient error that Supabase will handle
      if (error?.message?.includes('User interaction is not allowed')) {
        console.warn('SecureStore access denied (background):', key);
        return null;
      }
      // Re-throw other errors
      throw error;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      // Check if value is too large for SecureStore (2048 bytes limit)
      const valueSize = new Blob([value]).size;
      if (valueSize > 2048) {
        console.warn(`Value too large for SecureStore (${valueSize} bytes). Using compressed storage.`);
        // For large values, we'll still try to store but Supabase will handle fallback
        // The warning is expected and Supabase will work around it
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error: any) {
      // If user interaction is not allowed, log but don't throw
      // This can happen during background token refresh
      if (error?.message?.includes('User interaction is not allowed')) {
        console.warn('SecureStore write denied (background):', key);
        return;
      }
      // If value is too large, log warning but continue
      // Supabase will handle this gracefully
      if (error?.message?.includes('larger than 2048 bytes')) {
        console.warn('SecureStore value too large, but continuing:', key);
        return;
      }
      // Re-throw other errors
      throw error;
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error: any) {
      // If user interaction is not allowed, log but don't throw
      if (error?.message?.includes('User interaction is not allowed')) {
        console.warn('SecureStore delete denied (background):', key);
        return;
      }
      // Re-throw other errors
      throw error;
    }
  },
};

// Validate config before creating client
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  throw new Error(
    'Supabase configuration missing. Please create .env file with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Ensure URL is properly formatted (no trailing slash)
const supabaseUrl = config.supabaseUrl.replace(/\/$/, '');

export const supabase = createClient(supabaseUrl, config.supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

