import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiary } from '@/hooks/useDiary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EmotionPicker } from '@/components/shared/EmotionPicker';
import { PhotoUpload } from '@/components/shared/PhotoUpload';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmotionType } from '@/types/database';
import { toast } from 'sonner';
import { ChevronLeft, Check } from 'lucide-react';

export default function DiaryNew() {
  const { createEntry } = useDiary();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emotion, setEmotion] = useState<EmotionType | null>(null);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim() && description.trim() && emotion;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) return;

    setSubmitting(true);

    try {
      await createEntry.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        emotion,
        entry_date: entryDate,
        photo_url: photoUrl,
      });

      toast.success('Moment saved! 🎉');
      navigate('/diary');
    } catch (error) {
      toast.error('Failed to save moment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between px-4 h-14">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h1 className="font-bold">New Moment</h1>
          <div className="w-16" />
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6 pb-32">
        {/* Title */}
        <div className="space-y-2 animate-fade-in">
          <Label htmlFor="title">What happened?</Label>
          <Input
            id="title"
            placeholder="Give it a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <Label htmlFor="description">Tell me more</Label>
          <Textarea
            id="description"
            placeholder="Describe the moment..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {/* Emotion */}
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Label>How did it feel?</Label>
          <EmotionPicker value={emotion} onChange={setEmotion} />
        </div>

        {/* Date */}
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <Label htmlFor="date">When?</Label>
          <Input
            id="date"
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Photo */}
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Label>Add a photo (optional)</Label>
          <PhotoUpload
            currentUrl={photoUrl}
            onUpload={setPhotoUrl}
            onRemove={() => setPhotoUrl(null)}
            bucket="diary-photos"
            size="lg"
            shape="rounded"
            placeholder="Add photo"
          />
        </div>
      </form>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          variant="coral"
          size="xl"
          className="w-full"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <LoadingSpinner size="sm" className="text-primary-foreground" />
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Save Moment
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
