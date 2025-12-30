/**
 * Authentication store using Zustand
 */

import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { supabase } from '../services/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      set({ loading: true });
      const { data: { session } } = await supabase.auth.getSession();
      set({
        user: session?.user ?? null,
        session: session,
        initialized: true,
        loading: false,
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          user: session?.user ?? null,
          session: session,
        });
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ initialized: true, loading: false });
    }
  },

  signIn: async (email: string) => {
    try {
      set({ loading: true });
      
      // Get the redirect URL - use Expo development URL for Expo Go, or custom scheme for standalone
      let redirectUrl: string;
      
      // Check if we're in Expo Go (development)
      if (Constants.executionEnvironment === 'storeClient') {
        // For Expo Go, use the exp:// scheme with the current development URL
        const expoUrl = Constants.expoConfig?.hostUri || Constants.linkingUri;
        if (expoUrl) {
          // Convert exp://192.168.1.172:8081 to exp://192.168.1.172:8081/--/auth/callback
          redirectUrl = `exp://${expoUrl.split('://')[1]?.split('/')[0]}/--/auth/callback`;
        } else {
          // Fallback to goguma:// scheme
          redirectUrl = 'goguma://auth/callback';
        }
      } else {
        // For standalone builds, use the custom scheme
        redirectUrl = 'goguma://auth/callback';
      }
      
      console.log('Using redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

