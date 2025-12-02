import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useDiary } from '@/hooks/useDiary';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EMOTION_CONFIG, EmotionType } from '@/types/database';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const EMOTION_FILTERS: (EmotionType | 'all')[] = ['all', 'happy', 'difficult', 'celebration', 'frustrated', 'proud'];

export default function Diary() {
  const { profile } = useProfile();
  const { entries, deleteEntry } = useDiary();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<EmotionType | 'all'>('all');
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  if (!profile) return null;

  const filteredEntries = filter === 'all'
    ? entries
    : entries.filter((e) => e.emotion === filter);

  const selectedEntryData = entries.find((e) => e.id === selectedEntry);

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📖 {profile.child_name}'s Journal</h1>
        <Button
          variant="coral"
          size="icon-lg"
          onClick={() => navigate('/diary/new')}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {EMOTION_FILTERS.map((emotionFilter) => {
          const isAll = emotionFilter === 'all';
          const config = isAll ? null : EMOTION_CONFIG[emotionFilter];
          return (
            <Button
              key={emotionFilter}
              variant={filter === emotionFilter ? 'coral' : 'secondary'}
              size="sm"
              onClick={() => setFilter(emotionFilter)}
              className="shrink-0"
            >
              {isAll ? 'All' : `${config?.emoji} ${config?.label}`}
            </Button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry, index) => {
            const emotionConfig = EMOTION_CONFIG[entry.emotion];
            return (
              <Card
                key={entry.id}
                className={cn(
                  'p-4 cursor-pointer hover:shadow-soft transition-all animate-fade-in',
                  emotionConfig.color.split(' ')[0]
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setSelectedEntry(entry.id)}
              >
                <div className="flex gap-3">
                  <span className="text-3xl">{emotionConfig.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold">{entry.title}</h3>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {format(new Date(entry.entry_date), 'MMM d')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {entry.description}
                    </p>
                  </div>
                </div>
                {entry.photo_url && (
                  <img
                    src={entry.photo_url}
                    alt=""
                    className="w-full h-32 object-cover rounded-lg mt-3"
                  />
                )}
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📔</span>
            <p className="text-muted-foreground mb-4">
              {filter === 'all'
                ? 'No moments captured yet'
                : `No ${EMOTION_CONFIG[filter as EmotionType].label.toLowerCase()} moments yet`}
            </p>
            <Button variant="coral" onClick={() => navigate('/diary/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Moment
            </Button>
          </div>
        )}
      </div>

      {/* Entry Detail Modal */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-md">
          {selectedEntryData && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">
                    {EMOTION_CONFIG[selectedEntryData.emotion].emoji}
                  </span>
                  {selectedEntryData.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedEntryData.entry_date), 'EEEE, MMMM d, yyyy')}
                </p>
                {selectedEntryData.photo_url && (
                  <img
                    src={selectedEntryData.photo_url}
                    alt=""
                    className="w-full rounded-lg"
                  />
                )}
                <p className="text-foreground whitespace-pre-wrap">
                  {selectedEntryData.description}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    deleteEntry.mutate(selectedEntryData.id);
                    setSelectedEntry(null);
                  }}
                >
                  Delete Entry
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
