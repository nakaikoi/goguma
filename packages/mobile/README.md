# @goguma/mobile

React Native mobile app built with Expo.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. **Required environment variables:**
   - `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `EXPO_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3000/api/v1)

4. **Start Expo development server:**
```bash
npm start
```

5. **Run on device/simulator:**
```bash
npm run ios      # iOS simulator
npm run android  # Android emulator
```

## Features

- ✅ Magic link authentication (Supabase)
- ✅ Photo capture with camera or library
- ✅ Image upload to backend
- ✅ AI analysis trigger
- ✅ Listing draft viewing
- ✅ Navigation between screens

## Tech Stack

- **Framework:** React Native (Expo)
- **Navigation:** React Navigation
- **State Management:** Zustand
- **Authentication:** Supabase Auth
- **API Client:** Axios
- **Camera:** Expo Camera & Image Picker

## Project Structure

```
src/
├── screens/          # App screens
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   ├── CameraScreen.tsx
│   └── DraftScreen.tsx
├── components/       # Reusable components
├── services/         # API and Supabase clients
├── store/           # Zustand stores
├── navigation/      # Navigation setup
└── config/          # Configuration
