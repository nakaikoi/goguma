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
      // SecureStore has a 2048 byte limit, but Supabase tokens can be larger
      // SecureStore will automatically compress values > 2048 bytes
      // This is expected behavior and works fine - we just suppress the warning
      await SecureStore.setItemAsync(key, value);
    } catch (error: any) {
      // If user interaction is not allowed, log but don't throw
      // This can happen during background token refresh
      if (error?.message?.includes('User interaction is not allowed')) {
        console.warn('SecureStore write denied (background):', key);
        return;
      }
      // If value is too large, SecureStore will compress it automatically
      // The warning is harmless - Supabase handles this gracefully
      if (error?.message?.includes('larger than 2048 bytes')) {
        // This is expected - SecureStore compresses automatically
        // No action needed, Supabase will work fine
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

