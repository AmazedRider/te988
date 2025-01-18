import { create } from 'zustand';
import { toast } from 'sonner';
import supabase from '../utils/supabase';
import { userService } from '../lib/services/userService';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isGuest: false,
  loading: true,
  setUser: (user) => set({ user, loading: false, isGuest: false }),
  
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    toast.success('Welcome back!');
  },
  
  signUp: async (email, password, username) => {
    // First sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { username }
      }
    });
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned from signup');

    try {
      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create the user profile
      await userService.createUser({
        id: authData.user.id,
        email,
        username
      });

      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Error in profile creation:', error);
      // Clean up by signing out if profile creation fails
      await supabase.auth.signOut();
      const message = error instanceof Error ? error.message : 'Failed to create user profile';
      toast.error(message);
      throw new Error(message);
    }
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, isGuest: false });
  },

  continueAsGuest: () => {
    set({ user: null, isGuest: true, loading: false }); 
  },
}));