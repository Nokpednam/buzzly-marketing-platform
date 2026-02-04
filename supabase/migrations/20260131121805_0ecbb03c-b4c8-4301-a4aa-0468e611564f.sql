-- Fix: Add explicit deny policies for profiles table INSERT and DELETE
-- This prevents any manual profile creation or deletion (profiles should only be managed via triggers)

-- Explicitly prevent users from inserting profiles (handled by handle_new_user trigger only)
CREATE POLICY "Prevent manual profile creation"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Explicitly prevent profile deletion (users should delete auth.users, not profiles directly)
CREATE POLICY "Prevent profile deletion"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (false);

-- Also update error_logs INSERT policy to only allow the user's own user_id
DROP POLICY IF EXISTS "Authenticated users can insert error logs" ON public.error_logs;

CREATE POLICY "Users can insert their own error logs"
  ON public.error_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);