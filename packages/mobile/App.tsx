/**
 * Main app entry point
 * 
 * IMPORTANT: URL polyfill must be imported FIRST before any other imports
 * that might use URL (like Supabase)
 */

import 'react-native-url-polyfill/auto';
import { registerRootComponent } from 'expo';
import * as Linking from 'expo-linking';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { supabase } from './src/services/supabase';

function App() {
  useEffect(() => {
    // Handle deep links for authentication
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;
      console.log('Deep link received:', url);
      
      // Check if this is a Supabase auth callback
      // Supabase redirects with hash fragment: #access_token=...&refresh_token=...
      if (url.includes('#access_token=') || url.includes('?access_token=')) {
        // Extract the URL fragment/query
        const hashIndex = url.indexOf('#');
        const queryIndex = url.indexOf('?');
        const fragment = hashIndex !== -1 
          ? url.substring(hashIndex + 1)
          : queryIndex !== -1 
            ? url.substring(queryIndex + 1)
            : null;
        
        if (fragment) {
          // Parse the fragment to extract tokens
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          console.log('Extracted tokens:', { 
            hasAccessToken: !!accessToken, 
            hasRefreshToken: !!refreshToken 
          });
          
          if (accessToken && refreshToken) {
            // Set the session with the tokens
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error('Error setting session:', error);
            } else {
              console.log('Session set successfully');
            }
          }
        }
      }
    };

    // Get initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

// Register the app with Expo
registerRootComponent(App);

