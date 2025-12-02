export type UserType = 'parent' | 'creator';

export type EmotionType = 'happy' | 'difficult' | 'proud' | 'frustrated' | 'celebration';

export type StrategyCategory = 'meltdown' | 'sleep' | 'eating' | 'listening' | 'discipline';

export interface Profile {
  id: string;
  user_id: string;
  parent_name: string;
  child_name: string;
  child_birthdate: string;
  child_gender: string | null;
  child_photo_url: string | null;
  main_challenge: string | null;
  created_at: string;
}

export interface DiaryEntry {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  photo_url: string | null;
  emotion: EmotionType;
  entry_date: string;
  created_at: string;
}

export interface Strategy {
  id: string;
  creator_id: string;
  title: string;
  category: StrategyCategory;
  age_min: number;
  age_max: number;
  strategy_text: string;
  script_text: string | null;
  audio_url: string | null;
  is_weekly_boost: boolean;
  published: boolean;
  created_at: string;
}

export interface SavedStrategy {
  id: string;
  profile_id: string;
  strategy_id: string;
  worked: boolean;
  created_at: string;
}

export const EMOTION_CONFIG: Record<EmotionType, { emoji: string; label: string; color: string }> = {
  happy: { emoji: '😊', label: 'Happy', color: 'bg-sunny-light text-sunny' },
  difficult: { emoji: '😢', label: 'Difficult', color: 'bg-destructive/10 text-destructive' },
  proud: { emoji: '💪', label: 'Proud', color: 'bg-lavender-light text-lavender' },
  frustrated: { emoji: '😤', label: 'Frustrated', color: 'bg-coral-light text-coral' },
  celebration: { emoji: '🎉', label: 'Celebration', color: 'bg-sage-light text-sage' },
};

export const CATEGORY_CONFIG: Record<StrategyCategory, { emoji: string; label: string; color: string }> = {
  meltdown: { emoji: '😤', label: 'Meltdowns', color: 'bg-coral-light text-coral' },
  sleep: { emoji: '😴', label: 'Sleep', color: 'bg-lavender-light text-lavender' },
  eating: { emoji: '🍽️', label: 'Eating', color: 'bg-sage-light text-sage' },
  listening: { emoji: '🗣️', label: 'Listening', color: 'bg-sky-light text-sky' },
  discipline: { emoji: '❤️', label: 'Discipline', color: 'bg-sunny-light text-sunny' },
};

export const CHALLENGES = [
  { value: 'tantrums', label: 'Tantrums & Meltdowns' },
  { value: 'sleep', label: 'Sleep Issues' },
  { value: 'listening', label: "Won't Listen" },
  { value: 'eating', label: 'Picky Eating' },
  { value: 'discipline', label: 'Discipline Struggles' },
];
