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
  isUpdating: boolean;
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
  isUpdating: false,

  fetchProgress: async (userId) => {
    set({ loading: true });
    try {
      const [userData, lessonsData] = await Promise.all([
        userService.getUserProgress(userId),
        progressService.getLessonProgress(userId)
      ]);

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
      throw error;
    }
  },

  completeLesson: async (userId, lessonId) => {
    if (get().isUpdating) {
      throw new Error('Progress update already in progress');
    }

    set({ isUpdating: true });
    const previousProgress = new Map(get().lessonProgress);
    const previousXP = get().xp;
    
    try {
      // Optimistically update the UI
      const newProgress = new Map(previousProgress);
      newProgress.set(lessonId, true);
      set({ lessonProgress: newProgress });

      // Make the API calls
      await progressService.completeLesson(userId, lessonId);
      
      // Base XP for completing a lesson
      const baseXP = 100;
      
      // Update XP and get streak information
      const result = await userService.updateUserXP(userId, previousXP + baseXP);

      // Show achievement toast
      const message = result.streakBonus > 0
        ? `Lesson Completed! +${baseXP} XP for completion\n🔥 +${result.streakBonus} XP Streak Bonus! (${result.streakDays} day streak)`
        : `Lesson Completed! +${baseXP} XP for completion`;
      
      toast.success(message);

      set({
        xp: result.xp,
        streakDays: result.streakDays,
        streakBonus: result.streakBonus,
        isUpdating: false
      });
    } catch (error) {
      // Revert optimistic updates on error
      set({
        lessonProgress: previousProgress,
        xp: previousXP,
        isUpdating: false
      });
      console.error('Error completing lesson:', error);
      throw error;
    }
  },

  resetLessonProgress: async (userId) => {
    if (get().isUpdating) {
      throw new Error('Progress update already in progress');
    }

    set({ isUpdating: true });
    try {
      await Promise.all([
        progressService.resetProgress(userId),
        userService.resetDailyXP(userId)
      ]);

      set({
        lessonProgress: new Map(),
        xp: 0,
        streakDays: 0,
        streakBonus: 0,
        isUpdating: false
      });
      
      toast.success('Progress reset successfully');
    } catch (error) {
      set({ isUpdating: false });
      console.error('Error resetting progress:', error);
      throw error;
    }
  },
}));
