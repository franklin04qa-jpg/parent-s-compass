import { EmotionType, EMOTION_CONFIG } from '@/types/database';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmotionPickerProps {
  value: EmotionType | null;
  onChange: (emotion: EmotionType) => void;
}

export function EmotionPicker({ value, onChange }: EmotionPickerProps) {
  const emotions = Object.entries(EMOTION_CONFIG) as [EmotionType, typeof EMOTION_CONFIG[EmotionType]][];

  return (
    <div className="flex flex-wrap gap-2">
      {emotions.map(([emotion, config]) => (
        <Button
          key={emotion}
          type="button"
          variant="emotion"
          onClick={() => onChange(emotion)}
          className={cn(
            'flex-1 min-w-[60px] h-16 flex-col gap-1 rounded-xl',
            value === emotion
              ? `${config.color} border-current scale-105 shadow-soft`
              : 'bg-secondary border-transparent'
          )}
        >
          <span className="text-2xl">{config.emoji}</span>
          <span className="text-xs font-medium">{config.label}</span>
        </Button>
      ))}
    </div>
  );
}
