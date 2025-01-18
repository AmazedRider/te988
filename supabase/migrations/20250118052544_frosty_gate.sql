/*
  # Add streak tracking and timestamps

  1. Changes
    - Add streak_days to users table
    - Add completed_at timestamp to lessons_progress
    - Update RLS policies for better security

  2. Security
    - Update policies to handle all CRUD operations
    - Ensure proper user data isolation
*/

-- Add streak_days to users if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'streak_days'
  ) THEN
    ALTER TABLE users ADD COLUMN streak_days INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add completed_at to lessons_progress if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons_progress' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE lessons_progress ADD COLUMN completed_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Drop existing policies safely
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read own data" ON users;
    DROP POLICY IF EXISTS "Users can update own data" ON users;
    DROP POLICY IF EXISTS "Enable insert for users" ON users;
    DROP POLICY IF EXISTS "Users can read own lesson progress" ON lessons_progress;
    DROP POLICY IF EXISTS "Users can update own lesson progress" ON lessons_progress;
    DROP POLICY IF EXISTS "Users can insert own lesson progress" ON lessons_progress;
END $$;

-- Create new policies for users table
CREATE POLICY "Enable insert for users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

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

-- Create new policies for lessons_progress table
CREATE POLICY "Users can read own lesson progress"
  ON lessons_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson progress"
  ON lessons_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress"
  ON lessons_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);