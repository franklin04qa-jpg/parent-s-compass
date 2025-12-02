
-- Create enum for user types
CREATE TYPE public.user_type AS ENUM ('parent', 'creator');

-- Create enum for emotions
CREATE TYPE public.emotion_type AS ENUM ('happy', 'difficult', 'proud', 'frustrated', 'celebration');

-- Create enum for strategy categories
CREATE TYPE public.strategy_category AS ENUM ('meltdown', 'sleep', 'eating', 'listening', 'discipline');

-- Create profiles table for parents
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_name TEXT NOT NULL,
  child_name TEXT NOT NULL,
  child_birthdate DATE NOT NULL,
  child_gender TEXT,
  child_photo_url TEXT,
  main_challenge TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create diary_entries table
CREATE TABLE public.diary_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  emotion emotion_type NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create strategies table
CREATE TABLE public.strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category strategy_category NOT NULL,
  age_min INTEGER NOT NULL DEFAULT 0,
  age_max INTEGER NOT NULL DEFAULT 144,
  strategy_text TEXT NOT NULL,
  script_text TEXT,
  audio_url TEXT,
  is_weekly_boost BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved_strategies table
CREATE TABLE public.saved_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES public.strategies(id) ON DELETE CASCADE,
  worked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, strategy_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_strategies ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Diary entries policies
CREATE POLICY "Users can view their own diary entries"
  ON public.diary_entries FOR SELECT
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own diary entries"
  ON public.diary_entries FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own diary entries"
  ON public.diary_entries FOR UPDATE
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own diary entries"
  ON public.diary_entries FOR DELETE
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Strategies policies (public read for parents, creator can manage their own)
CREATE POLICY "Anyone can view published strategies"
  ON public.strategies FOR SELECT
  USING (published = true OR creator_id = auth.uid());

CREATE POLICY "Creators can insert strategies"
  ON public.strategies FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their strategies"
  ON public.strategies FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their strategies"
  ON public.strategies FOR DELETE
  USING (auth.uid() = creator_id);

-- Saved strategies policies
CREATE POLICY "Users can view their saved strategies"
  ON public.saved_strategies FOR SELECT
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can save strategies"
  ON public.saved_strategies FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their saved strategies"
  ON public.saved_strategies FOR UPDATE
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their saved strategies"
  ON public.saved_strategies FOR DELETE
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('child-photos', 'child-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('diary-photos', 'diary-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('strategy-audio', 'strategy-audio', true);

-- Storage policies for child-photos
CREATE POLICY "Anyone can view child photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'child-photos');

CREATE POLICY "Authenticated users can upload child photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'child-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own child photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'child-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for diary-photos
CREATE POLICY "Anyone can view diary photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'diary-photos');

CREATE POLICY "Authenticated users can upload diary photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'diary-photos' AND auth.role() = 'authenticated');

-- Storage policies for strategy-audio
CREATE POLICY "Anyone can view strategy audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'strategy-audio');

CREATE POLICY "Authenticated users can upload strategy audio"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'strategy-audio' AND auth.role() = 'authenticated');
