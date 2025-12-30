/**
 * Environment configuration for mobile app
 */

import Constants from 'expo-constants';

// Get environment variables from Expo Constants
// Expo loads EXPO_PUBLIC_* variables from app.config.js extra field
export const config = {
  supabaseUrl: Constants.expoConfig?.extra?.supabaseUrl || '',
  supabaseAnonKey: Constants.expoConfig?.extra?.supabaseAnonKey || '',
  apiUrl: Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api/v1',
};

// Validate required config
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.error('❌ Supabase configuration missing!');
  console.error('   Create .env file with:');
  console.error('   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  console.error('   EXPO_PUBLIC_API_URL=http://192.168.1.172:3000/api/v1');
  console.error('   Current values:', {
    supabaseUrl: config.supabaseUrl || 'MISSING',
    supabaseAnonKey: config.supabaseAnonKey ? '***set***' : 'MISSING',
    apiUrl: config.apiUrl,
  });
}

if (config.apiUrl === 'http://localhost:3000/api/v1') {
  console.warn('⚠️ Using default API URL. Update EXPO_PUBLIC_API_URL to your computer IP for phone testing');
}

