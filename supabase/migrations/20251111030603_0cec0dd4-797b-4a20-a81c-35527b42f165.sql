-- Add INSERT policy to profiles table to allow users to create their own profile
-- This complements the existing SELECT and UPDATE policies
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);