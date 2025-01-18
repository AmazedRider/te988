import React, { useState, useEffect } from 'react';
import { User, Key, RotateCcw, LogOut, LogIn } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useProgressStore } from '../../stores/progressStore';
import supabase from '../../utils/supabase';
import { toast } from 'sonner';

interface ProfileProps {
  onClose: () => void;
}

export function Profile({ onClose }: ProfileProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [username, setUsername] = useState<string>('');
  const { user, isGuest } = useAuthStore();
  const resetProgress = useProgressStore(state => state.resetLessonProgress);
  const signOut = useAuthStore(state => state.signOut);

  useEffect(() => {
    async function fetchUsername() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUsername(data.username || 'Anonymous');
      } catch (error) {
        console.error('Error fetching username:', error);
        setUsername('Anonymous');
      }
    }

    fetchUsername();
  }, [user]);

  const handleResetProgress = async () => {
    if (!user || !isResetting) {
      setIsResetting(true);
      return;
    }

    try {
      await resetProgress(user.id);
      setIsResetting(false);
      toast.success('Progress reset successfully');
    } catch (error) {
      console.error('Error resetting progress:', error);
      setIsResetting(false);
      toast.error('Failed to reset progress');
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    
    try {
      setIsResettingPassword(true);
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) throw error;
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      toast.error('Failed to send password reset email. Please try again.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await signOut();
      onClose();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (isGuest) {
    return (
      <div className="w-full max-w-md mx-auto bg-white/10 rounded-xl backdrop-blur-md p-8 shadow-2xl border border-white/10">
        <div className="space-y-8">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-primary/20 rounded-xl shadow-inner">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Guest Mode</h2>
              <p className="text-gray-300 mt-1">You are logged in as a guest</p>
            </div>
          </div>

          <div>
            <button
              onClick={() => useAuthStore.setState({ isGuest: false })}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 active:scale-[0.98] transform transition-all duration-200 font-medium shadow-lg shadow-primary/25"
            >
              <LogIn className="w-5 h-5" />
              Sign in to save progress
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="w-full max-w-md mx-auto bg-white/10 rounded-xl backdrop-blur-md p-8 shadow-2xl border border-white/10">
      <div className="space-y-8">
        <div className="flex items-start space-x-5">
          <div className="p-4 bg-primary/20 rounded-xl shadow-inner">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Profile</h2>
            <p className="text-lg font-medium text-primary mt-2">{username}</p>
            <p className="text-gray-400 text-sm mt-1">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleResetPassword}
            disabled={isResettingPassword}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-primary text-white rounded-lg 
              hover:bg-primary/90 active:scale-[0.98] transform transition-all duration-200 font-medium
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              shadow-lg shadow-primary/25"
          >
            <Key className="w-5 h-5" />
            {isResettingPassword ? 'Sending reset email...' : 'Reset Password'}
          </button>

          <button
            onClick={handleResetProgress}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-500 text-white rounded-lg 
              hover:bg-red-600 active:scale-[0.98] transform transition-all duration-200 font-medium
              shadow-lg shadow-red-500/25"
          >
            <RotateCcw className="w-5 h-5" />
            {isResetting ? 'Click again to confirm' : 'Reset Progress'}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-600 text-white rounded-lg 
              hover:bg-gray-700 active:scale-[0.98] transform transition-all duration-200 font-medium
              shadow-lg shadow-gray-600/25"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}