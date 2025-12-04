-- Add RLS policy to allow creators to view all profiles
CREATE POLICY "Creators can view all profiles"
ON public.profiles
FOR SELECT
USING (
  (SELECT (raw_user_meta_data->>'user_type') FROM auth.users WHERE id = auth.uid()) = 'creator'
);