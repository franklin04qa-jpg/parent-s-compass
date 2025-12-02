import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Strategy, SavedStrategy, StrategyCategory } from '@/types/database';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export function useStrategies() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const { data: strategies = [], isLoading, error } = useQuery({
    queryKey: ['strategies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Strategy[];
    },
  });

  const { data: savedStrategies = [] } = useQuery({
    queryKey: ['saved-strategies', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      
      const { data, error } = await supabase
        .from('saved_strategies')
        .select('*')
        .eq('profile_id', profile.id);

      if (error) throw error;
      return data as SavedStrategy[];
    },
    enabled: !!profile,
  });

  const { data: myStrategies = [] } = useQuery({
    queryKey: ['my-strategies', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Strategy[];
    },
    enabled: !!user,
  });

  const createStrategy = useMutation({
    mutationFn: async (strategyData: Omit<Strategy, 'id' | 'created_at' | 'creator_id'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('strategies')
        .insert({
          ...strategyData,
          creator_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Strategy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      queryClient.invalidateQueries({ queryKey: ['my-strategies'] });
    },
  });

  const updateStrategy = useMutation({
    mutationFn: async ({ id, ...strategyData }: Partial<Strategy> & { id: string }) => {
      const { data, error } = await supabase
        .from('strategies')
        .update(strategyData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Strategy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      queryClient.invalidateQueries({ queryKey: ['my-strategies'] });
    },
  });

  const deleteStrategy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('strategies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      queryClient.invalidateQueries({ queryKey: ['my-strategies'] });
    },
  });

  const saveStrategy = useMutation({
    mutationFn: async (strategyId: string) => {
      if (!profile) throw new Error('No profile found');
      
      const { data, error } = await supabase
        .from('saved_strategies')
        .insert({
          profile_id: profile.id,
          strategy_id: strategyId,
        })
        .select()
        .single();

      if (error) throw error;
      return data as SavedStrategy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-strategies'] });
    },
  });

  const unsaveStrategy = useMutation({
    mutationFn: async (strategyId: string) => {
      if (!profile) throw new Error('No profile found');
      
      const { error } = await supabase
        .from('saved_strategies')
        .delete()
        .eq('profile_id', profile.id)
        .eq('strategy_id', strategyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-strategies'] });
    },
  });

  const markWorked = useMutation({
    mutationFn: async ({ strategyId, worked }: { strategyId: string; worked: boolean }) => {
      if (!profile) throw new Error('No profile found');
      
      const { data, error } = await supabase
        .from('saved_strategies')
        .update({ worked })
        .eq('profile_id', profile.id)
        .eq('strategy_id', strategyId)
        .select()
        .single();

      if (error) throw error;
      return data as SavedStrategy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-strategies'] });
    },
  });

  const filterStrategies = (category: StrategyCategory, childAgeMonths: number) => {
    return strategies.filter(
      (s) =>
        s.published &&
        s.category === category &&
        s.age_min <= childAgeMonths &&
        s.age_max >= childAgeMonths
    );
  };

  const getWeeklyBoost = () => {
    return strategies.find((s) => s.is_weekly_boost && s.published);
  };

  const isStrategySaved = (strategyId: string) => {
    return savedStrategies.some((s) => s.strategy_id === strategyId);
  };

  const getSavedStrategy = (strategyId: string) => {
    return savedStrategies.find((s) => s.strategy_id === strategyId);
  };

  return {
    strategies,
    myStrategies,
    savedStrategies,
    isLoading,
    error,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    saveStrategy,
    unsaveStrategy,
    markWorked,
    filterStrategies,
    getWeeklyBoost,
    isStrategySaved,
    getSavedStrategy,
  };
}
