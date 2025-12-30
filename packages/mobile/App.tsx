/**
 * Main app entry point
 * 
 * IMPORTANT: URL polyfill must be imported FIRST before any other imports
 * that might use URL (like Supabase)
 */

import 'react-native-url-polyfill/auto';
import { registerRootComponent } from 'expo';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

// Register the app with Expo
registerRootComponent(App);

