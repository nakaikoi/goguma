/**
 * Supabase client for mobile app
 */

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { config } from '../config/env';

// Custom storage adapter for SecureStore
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
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

