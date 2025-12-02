import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStrategies } from '@/hooks/useStrategies';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner, LoadingScreen } from '@/components/shared/LoadingSpinner';
import { CATEGORY_CONFIG, StrategyCategory, Strategy } from '@/types/database';
import { uploadFile } from '@/lib/storage';
import { toast } from 'sonner';
import { ChevronLeft, Save, Upload } from 'lucide-react';
import { useRef } from 'react';

export default function StrategyForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myStrategies, createStrategy, updateStrategy, isLoading } = useStrategies();

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'meltdown' as StrategyCategory,
    age_min: 0,
    age_max: 144,
    strategy_text: '',
    script_text: '',
    audio_url: '',
    is_weekly_boost: false,
    published: true,
  });

  // Load existing strategy data if editing
  useEffect(() => {
    if (isEditing && myStrategies.length > 0) {
      const strategy = myStrategies.find((s) => s.id === id);
      if (strategy) {
        setFormData({
          title: strategy.title,
          category: strategy.category,
          age_min: strategy.age_min,
          age_max: strategy.age_max,
          strategy_text: strategy.strategy_text,
          script_text: strategy.script_text || '',
          audio_url: strategy.audio_url || '',
          is_weekly_boost: strategy.is_weekly_boost,
          published: strategy.published,
        });
      }
    }
  }, [isEditing, id, myStrategies]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const updateForm = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please select an audio file');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Audio must be less than 20MB');
      return;
    }

    setUploading(true);
    const { url, error } = await uploadFile('strategy-audio', file, user.id);
    setUploading(false);

    if (error) {
      toast.error(error);
      return;
    }

    if (url) {
      updateForm('audio_url', url);
      toast.success('Audio uploaded!');
    }
  };

  const canSubmit =
    formData.title.trim() &&
    formData.strategy_text.trim() &&
    formData.age_min <= formData.age_max;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);

    try {
      if (isEditing) {
        await updateStrategy.mutateAsync({
          id,
          ...formData,
          script_text: formData.script_text || null,
          audio_url: formData.audio_url || null,
        });
        toast.success('Strategy updated!');
      } else {
        await createStrategy.mutateAsync({
          ...formData,
          script_text: formData.script_text || null,
          audio_url: formData.audio_url || null,
        });
        toast.success('Strategy created!');
      }
      navigate('/creator/strategies');
    } catch (error) {
      toast.error('Failed to save strategy');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Edit Strategy' : 'New Strategy'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="e.g., The Calm Down Corner"
            value={formData.title}
            onChange={(e) => updateForm('title', e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={(v) => updateForm('category', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.emoji} {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Age Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age_min">Min Age (months)</Label>
            <Input
              id="age_min"
              type="number"
              min={0}
              max={144}
              value={formData.age_min}
              onChange={(e) => updateForm('age_min', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age_max">Max Age (months)</Label>
            <Input
              id="age_max"
              type="number"
              min={0}
              max={144}
              value={formData.age_max}
              onChange={(e) => updateForm('age_max', parseInt(e.target.value) || 144)}
            />
          </div>
        </div>

        {/* Strategy Text */}
        <div className="space-y-2">
          <Label htmlFor="strategy_text">Strategy</Label>
          <Textarea
            id="strategy_text"
            placeholder="Describe the strategy in detail..."
            value={formData.strategy_text}
            onChange={(e) => updateForm('strategy_text', e.target.value)}
            rows={6}
          />
        </div>

        {/* Script Text */}
        <div className="space-y-2">
          <Label htmlFor="script_text">What to Say (Script) - Optional</Label>
          <Textarea
            id="script_text"
            placeholder="Exact words parents can use..."
            value={formData.script_text}
            onChange={(e) => updateForm('script_text', e.target.value)}
            rows={4}
          />
        </div>

        {/* Audio Upload */}
        <div className="space-y-2">
          <Label>Audio Guide (Optional)</Label>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="hidden"
          />
          <div className="flex gap-2 items-center">
            <Button
              type="button"
              variant="secondary"
              onClick={() => audioInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Audio
                </>
              )}
            </Button>
            {formData.audio_url && (
              <span className="text-sm text-sage">✓ Audio uploaded</span>
            )}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Boost</Label>
              <p className="text-sm text-muted-foreground">
                Featured on parent home screen
              </p>
            </div>
            <Switch
              checked={formData.is_weekly_boost}
              onCheckedChange={(v) => updateForm('is_weekly_boost', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Published</Label>
              <p className="text-sm text-muted-foreground">
                Visible to parents
              </p>
            </div>
            <Switch
              checked={formData.published}
              onCheckedChange={(v) => updateForm('published', v)}
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="coral"
          size="xl"
          className="w-full"
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <LoadingSpinner size="sm" className="text-primary-foreground" />
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              {isEditing ? 'Save Changes' : 'Create Strategy'}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
