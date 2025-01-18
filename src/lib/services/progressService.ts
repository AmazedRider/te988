import supabase from '../../utils/supabase';

export const progressService = {
  async getLessonProgress(userId: string) {
    const { data, error } = await supabase
      .from('lessons_progress')
      .select('lesson_id, completed')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async completeLesson(userId: string, lessonId: number) {
    try {
      // Upsert the lesson progress
      const { data, error } = await supabase
        .from('lessons_progress')
        .upsert(
          {
            user_id: userId,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString()
          },
          { onConflict: 'user_id,lesson_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error completing lesson:', error);
      throw error;
    }
  },

  async resetProgress(userId: string) {
    const { error } = await supabase
      .from('lessons_progress')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }
};