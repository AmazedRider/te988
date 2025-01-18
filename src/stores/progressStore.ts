import { create } from 'zustand';
import { userService } from '../lib/services/userService';
import { progressService } from '../lib/services/progressService';
import { toast } from 'sonner';

interface ProgressState {
  xp: number;
  streakDays: number;
  streakBonus: number;
  lessonProgress: Map<number, boolean>;
  loading: boolean;
  fetchProgress: (userId: string) => Promise<void>;
  completeLesson: (userId: string, lessonId: number) => Promise<void>;
  resetLessonProgress: (userId: string) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  xp: 0,
  streakDays: 0,
  streakBonus: 0,
  lessonProgress: new Map(),
  loading: false,

  fetchProgress: async (userId) => {
    set({ loading: true });
    try {
      const userData = await userService.getUserProgress(userId);
      const lessonsData = await progressService.getLessonProgress(userId);

      const progress = new Map(
        lessonsData?.map(({ lesson_id, completed }) => [lesson_id, completed]) || []
      );

      set({
        xp: userData?.xp || 0,
        streakDays: userData?.streak_days || 0,
        lessonProgress: progress,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
      set({ loading: false });
    }
  },

  completeLesson: async (userId, lessonId) => {
    try {
      await progressService.completeLesson(userId, lessonId);
      
      const newProgress = new Map(get().lessonProgress);
      newProgress.set(lessonId, true);
      
      // Base XP for completing a lesson
      const baseXP = 100;
      
      // Update XP and get streak information
      const result = await userService.updateUserXP(userId, get().xp + baseXP);

      // Show achievement toast
      const message = `🎉 Lesson Completed!\n+${baseXP} XP for completion${
        result.streakBonus > 0 
          ? `\n🔥 +${result.streakBonus} XP Streak Bonus! (${result.streakDays} day streak)`
          : ''
      }`;
      
      toast.success(message);

      set({
        lessonProgress: newProgress,
        xp: result.xp,
        streakDays: result.streakDays,
        streakBonus: result.streakBonus
      });
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error('Failed to update progress');
    }
  },

  resetLessonProgress: async (userId) => {
    try {
      await progressService.resetProgress(userId);
      await userService.resetDailyXP(userId);

      set({
        lessonProgress: new Map(),
        xp: 0,
        streakDays: 0,
        streakBonus: 0
      });
      
      toast.success('Progress reset successfully');
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast.error('Failed to reset progress');
    }
  },
}));