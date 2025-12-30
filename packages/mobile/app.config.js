/**
 * Expo app configuration with environment variables
 */

require('dotenv').config();

module.exports = {
  expo: {
    name: "Goguma",
    slug: "goguma",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    splash: {
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.goguma.app"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      },
      package: "com.goguma.app"
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Allow Goguma to access your camera to take photos of items."
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Allow Goguma to access your photos to select images."
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "your-project-id"
      },
      // Environment variables - loaded from .env file
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
    },
    sdkVersion: "54.0.0"
  }
};

