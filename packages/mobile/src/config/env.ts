/**
 * Environment configuration for mobile app
 */

// These should be set via Expo Constants or .env file
// For now, using placeholder values that should be replaced

export const config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
};

// Validate required config
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.warn('⚠️ Supabase configuration missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

if (config.apiUrl === 'http://localhost:3000/api/v1') {
  console.warn('⚠️ Using default API URL. Set EXPO_PUBLIC_API_URL for production');
}

