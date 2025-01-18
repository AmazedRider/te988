import { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import supabase from '../../utils/supabase';

export function useSupabaseSession() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);
}