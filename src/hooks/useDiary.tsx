import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DiaryEntry, EmotionType } from '@/types/database';
import { useProfile } from './useProfile';

export function useDiary() {
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading, error } = useQuery({
    queryKey: ['diary', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('profile_id', profile.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data as DiaryEntry[];
    },
    enabled: !!profile,
  });

  const createEntry = useMutation({
    mutationFn: async (entryData: {
      title: string;
      description: string;
      photo_url?: string | null;
      emotion: EmotionType;
      entry_date: string;
    }) => {
      if (!profile) throw new Error('No profile found');
      
      const { data, error } = await supabase
        .from('diary_entries')
        .insert({
          ...entryData,
          profile_id: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as DiaryEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary'] });
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, ...entryData }: Partial<DiaryEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('diary_entries')
        .update(entryData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as DiaryEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary'] });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary'] });
    },
  });

  return {
    entries,
    isLoading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
  };
}
