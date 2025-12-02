import { useParams, useNavigate } from 'react-router-dom';
import { useStrategies } from '@/hooks/useStrategies';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CATEGORY_CONFIG } from '@/types/database';
import { formatAgeRange } from '@/lib/age';
import { ChevronLeft, Star, Check, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useState, useRef } from 'react';

export default function StrategyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { strategies, isStrategySaved, getSavedStrategy, saveStrategy, unsaveStrategy, markWorked } = useStrategies();
  
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const strategy = strategies.find((s) => s.id === id);
  const isSaved = id ? isStrategySaved(id) : false;
  const savedData = id ? getSavedStrategy(id) : null;

  if (!strategy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Strategy not found</p>
      </div>
    );
  }

  const categoryConfig = CATEGORY_CONFIG[strategy.category];

  const handleSave = async () => {
    if (!id) return;

    try {
      if (isSaved) {
        await unsaveStrategy.mutateAsync(id);
        toast.success('Removed from saved');
      } else {
        await saveStrategy.mutateAsync(id);
        toast.success('Saved to your collection!');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleWorked = async () => {
    if (!id || !isSaved) return;

    try {
      await markWorked.mutateAsync({ strategyId: id, worked: !savedData?.worked });
      toast.success(savedData?.worked ? 'Unmarked' : 'Marked as worked! 🎉');
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center px-4 h-14">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Title & Meta */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('px-3 py-1 rounded-full text-sm font-medium', categoryConfig.color)}>
              {categoryConfig.emoji} {categoryConfig.label}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{strategy.title}</h1>
          <p className="text-muted-foreground mt-2">
            Best for ages {formatAgeRange(strategy.age_min, strategy.age_max)}
          </p>
        </div>

        {/* Strategy Text */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {strategy.strategy_text}
          </p>
        </div>

        {/* Script Section */}
        {strategy.script_text && (
          <Card className="p-4 bg-sage-light border-sage animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <h3 className="font-bold text-sage mb-2 flex items-center gap-2">
              💬 What to say exactly:
            </h3>
            <p className="text-foreground italic whitespace-pre-wrap">
              "{strategy.script_text}"
            </p>
          </Card>
        )}

        {/* Audio Player */}
        {strategy.audio_url && (
          <Card className="p-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <audio
              ref={audioRef}
              src={strategy.audio_url}
              onEnded={() => setPlaying(false)}
            />
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={toggleAudio}
            >
              {playing ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause Audio
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Listen to Audio Guide
                </>
              )}
            </Button>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border space-y-2">
        <div className="flex gap-2">
          <Button
            variant={isSaved ? 'coral' : 'secondary'}
            size="lg"
            className="flex-1"
            onClick={handleSave}
          >
            <Star className={cn('w-5 h-5 mr-2', isSaved && 'fill-current')} />
            {isSaved ? 'Saved' : 'Save This'}
          </Button>
          
          {isSaved && (
            <Button
              variant={savedData?.worked ? 'sage' : 'secondary'}
              size="lg"
              className="flex-1"
              onClick={handleWorked}
            >
              <Check className="w-5 h-5 mr-2" />
              {savedData?.worked ? 'Worked!' : 'This Worked!'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
