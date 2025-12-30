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
      await SecureStore.setItemAsync(key, value);
    } catch (error: any) {
      // If user interaction is not allowed, log but don't throw
      // This can happen during background token refresh
      if (error?.message?.includes('User interaction is not allowed')) {
        console.warn('SecureStore write denied (background):', key);
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
    // Suppress errors from background token refresh attempts
    // These are transient and will retry when the app is in foreground
  },
});

// Suppress console errors from background token refresh
// This is expected behavior when the app is in background
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  // Filter out the "Auto refresh tick failed" errors that are expected
  if (message.includes('Auto refresh tick failed') && 
      message.includes('User interaction is not allowed')) {
    // This is expected - Supabase tries to refresh tokens in background
    // but SecureStore requires user interaction
    return;
  }
  originalConsoleError.apply(console, args);
};

