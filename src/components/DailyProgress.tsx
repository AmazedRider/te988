import React, { useEffect } from 'react';
import { Flame, Star, LogIn, Trophy } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useProgressStore } from '../stores/progressStore';
import { useThemeStore } from '../stores/themeStore';

export function DailyProgress() {
  const { user, isGuest } = useAuthStore();
  const { xp, streakDays, streakBonus, fetchProgress } = useProgressStore();
  const theme = useThemeStore(state => state.theme);
  
  const dailyGoal = 300;
  const progress = Math.min((xp / dailyGoal) * 100, 100);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (user) {
      fetchProgress(user.id);
    }
  }, [user, fetchProgress]);

  if (isGuest) {
    return (
      <div className={`p-6 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogIn className="h-6 w-6 text-primary" />
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Guest Mode</span>
          </div>
          <button 
            onClick={() => useAuthStore.setState({ isGuest: false })}
            className="text-sm text-primary hover:underline"
          >
            Sign in to save progress
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Flame className="h-6 w-6 text-orange-500" />
            <div>
              <div className="font-semibold">{streakDays} Day Streak!</div>
              {streakBonus > 0 && (
                <div className="text-sm text-yellow-500">
                  +{streakBonus} XP Bonus
                </div>
              )}
            </div>
          </div>
          <div className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Star className="h-6 w-6 text-yellow-500" />
            <div>
              <div className="font-semibold">{xp} XP Today</div>
              <div className="text-sm text-gray-400">
                Goal: {dailyGoal} XP
              </div>
            </div>
          </div>
        </div>
        {xp >= dailyGoal && (
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Daily Goal Achieved!
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Daily Progress</span>
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{xp}/{dailyGoal} XP</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}