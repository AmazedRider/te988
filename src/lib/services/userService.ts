import supabase from '../../utils/supabase';

interface CreateUserData {
  id: string;
  email: string;
  username: string;
}

export const userService = {
  async createUser(userData: CreateUserData) {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          xp: 0
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('User already exists with this email');
      }
      throw error;
    }

    return data;
  },

  async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('xp, streak_days')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserXP(userId: string, xp: number) {
    const { error } = await supabase
      .from('users')
      .update({ xp })
      .eq('id', userId);

    if (error) throw error;
  },

  async resetDailyXP(userId: string) {
    const { error } = await supabase
      .from('users')
      .update({ xp: 0, streak_days: 0 })
      .eq('id', userId);

    if (error) throw error;
  }
};