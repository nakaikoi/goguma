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
      
      // Check if this is a Supabase auth callback
      if (url.includes('#access_token=') || url.includes('?access_token=')) {
        // Extract the URL fragment/query
        const urlParts = url.split('#');
        const fragment = urlParts[1] || url.split('?')[1];
        
        if (fragment) {
          // Parse the fragment to extract tokens
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          if (accessToken && refreshToken) {
            // Set the session with the tokens
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error('Error setting session:', error);
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

