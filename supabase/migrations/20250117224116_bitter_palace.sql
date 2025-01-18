/*
  # Initial Schema Setup

  1. Tables
    - users: Store user profiles and progress
    - lessons_progress: Track lesson completion status

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lessons progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS lessons_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  lesson_id INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Drop users table policies
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can read own data'
    ) THEN
        DROP POLICY "Users can read own data" ON users;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can update own data'
    ) THEN
        DROP POLICY "Users can update own data" ON users;
    END IF;

    -- Drop lessons_progress table policies
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lessons_progress' AND policyname = 'Users can read own lesson progress'
    ) THEN
        DROP POLICY "Users can read own lesson progress" ON lessons_progress;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lessons_progress' AND policyname = 'Users can update own lesson progress'
    ) THEN
        DROP POLICY "Users can update own lesson progress" ON lessons_progress;
    END IF;
END $$;

-- Create new policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read own lesson progress"
  ON lessons_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress"
  ON lessons_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);