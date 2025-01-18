/*
  # Fix Users Table RLS Policies
  
  1. Changes
    - Add INSERT policy for authenticated users
    - Fix SELECT policy to allow reading own data
    - Add UPDATE policy for own data
    
  2. Security
    - Ensures users can only access their own data
    - Allows initial user creation during signup
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policies
CREATE POLICY "Enable insert for authenticated users only" 
ON users FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read access for users to own data" 
ON users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Enable update for users to own data" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);