export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          xp: number;
          streak_days: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          xp?: number;
          streak_days?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          xp?: number;
          streak_days?: number;
          created_at?: string;
        };
      };
      lessons_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: number;
          completed: boolean;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: number;
          completed?: boolean;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: number;
          completed?: boolean;
          completed_at?: string | null;
        };
      };
    };
  };
}