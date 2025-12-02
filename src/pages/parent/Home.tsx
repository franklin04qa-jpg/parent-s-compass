import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useDiary } from '@/hooks/useDiary';
import { useStrategies } from '@/hooks/useStrategies';
import { ChildAvatar } from '@/components/shared/ChildAvatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatAge, calculateAge } from '@/lib/age';
import { CATEGORY_CONFIG, EMOTION_CONFIG, StrategyCategory, Strategy } from '@/types/database';
import { Plus, ChevronRight, Play, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const HELP_BUTTONS: { category: StrategyCategory; text: (name: string) => string }[] = [
  { category: 'meltdown', text: (name) => `${name} is having a meltdown` },
  { category: 'sleep', text: () => 'Bedtime problems' },
  { category: 'listening', text: () => "Won't listen to me" },
  { category: 'eating', text: () => "Won't eat" },
  { category: 'discipline', text: () => 'I need to calm down' },
];

export default function ParentHome() {
  const { profile } = useProfile();
  const { entries } = useDiary();
  const { filterStrategies, getWeeklyBoost } = useStrategies();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<StrategyCategory | null>(null);
  const [filteredStrategies, setFilteredStrategies] = useState<Strategy[]>([]);

  if (!profile) return null;

  const childAge = calculateAge(profile.child_birthdate);
  const weeklyBoost = getWeeklyBoost();
  const recentEntries = entries.slice(0, 3);

  const handleHelpClick = (category: StrategyCategory) => {
    const strategies = filterStrategies(category, childAge.totalMonths);
    setFilteredStrategies(strategies);
    setSelectedCategory(category);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-in">
        <ChildAvatar
          photoUrl={profile.child_photo_url}
          name={profile.child_name}
          size="lg"
        />
        <div>
          <h1 className="text-2xl font-bold">
            Hi {profile.parent_name}! 👋
          </h1>
          <p className="text-muted-foreground">
            {profile.child_name} is {formatAge(profile.child_birthdate)}
          </p>
        </div>
      </div>

      {/* Quick Help Section */}
      <section className="animate-slide-up">
        <h2 className="text-lg font-bold mb-3">Need help right now?</h2>
        <div className="space-y-2">
          {HELP_BUTTONS.map(({ category, text }) => {
            const config = CATEGORY_CONFIG[category];
            return (
              <Button
                key={category}
                variant="secondary"
                size="xl"
                className="w-full justify-start gap-3 h-16"
                onClick={() => handleHelpClick(category)}
              >
                <span className="text-2xl">{config.emoji}</span>
                <span className="font-medium">{text(profile.child_name)}</span>
              </Button>
            );
          })}
        </div>
      </section>

      {/* Weekly Boost */}
      {weeklyBoost && (
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sunny" />
            Weekly Boost
          </h2>
          <Card
            className="p-4 cursor-pointer hover:shadow-soft transition-shadow gradient-coral text-primary-foreground"
            onClick={() => navigate(`/strategy/${weeklyBoost.id}`)}
          >
            <h3 className="font-bold text-lg">{weeklyBoost.title}</h3>
            <p className="text-sm opacity-90 line-clamp-2 mt-1">
              {weeklyBoost.strategy_text}
            </p>
            {weeklyBoost.audio_url && (
              <div className="flex items-center gap-2 mt-3">
                <Play className="w-4 h-4" />
                <span className="text-sm">Listen to audio</span>
              </div>
            )}
          </Card>
        </section>
      )}

      {/* Recent Diary Moments */}
      <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Recent Moments</h2>
          <Link to="/diary" className="text-sm text-primary font-semibold flex items-center">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentEntries.length > 0 ? (
          <div className="space-y-2">
            {recentEntries.map((entry) => {
              const emotionConfig = EMOTION_CONFIG[entry.emotion];
              return (
                <Card key={entry.id} className="p-3 flex items-center gap-3">
                  <span className="text-2xl">{emotionConfig.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(entry.entry_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-3">
              No moments captured yet
            </p>
          </Card>
        )}

        <Button
          variant="coral"
          size="lg"
          className="w-full mt-3"
          onClick={() => navigate('/diary/new')}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Moment
        </Button>
      </section>

      {/* Strategies Sheet */}
      <Sheet open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selectedCategory && (
                <>
                  <span className="text-2xl">{CATEGORY_CONFIG[selectedCategory].emoji}</span>
                  {CATEGORY_CONFIG[selectedCategory].label} Strategies
                </>
              )}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(70vh-100px)]">
            {filteredStrategies.length > 0 ? (
              filteredStrategies.map((strategy) => (
                <Card
                  key={strategy.id}
                  className="p-4 cursor-pointer hover:shadow-soft transition-shadow"
                  onClick={() => {
                    setSelectedCategory(null);
                    navigate(`/strategy/${strategy.id}`);
                  }}
                >
                  <h3 className="font-bold">{strategy.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {strategy.strategy_text}
                  </p>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No strategies found for {profile.child_name}'s age group yet.
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
