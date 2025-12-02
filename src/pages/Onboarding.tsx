import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhotoUpload } from '@/components/shared/PhotoUpload';
import { LoadingSpinner, LoadingScreen } from '@/components/shared/LoadingSpinner';
import { CHALLENGES } from '@/types/database';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Check, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOTAL_STEPS = 6;

export default function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const { hasProfile, isLoading: profileLoading, createProfile } = useProfile();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    parent_name: '',
    child_name: '',
    child_birthdate: '',
    child_gender: '',
    main_challenge: '',
    child_photo_url: '',
  });

  if (authLoading || profileLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (hasProfile) {
    return <Navigate to="/home" replace />;
  }

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.parent_name.trim().length > 0;
      case 2:
        return formData.child_name.trim().length > 0;
      case 3:
        return formData.child_birthdate.length > 0;
      case 4:
        return true; // Gender is optional
      case 5:
        return formData.main_challenge.length > 0;
      case 6:
        return true; // Photo is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setSubmitting(true);

    try {
      await createProfile.mutateAsync({
        user_id: user.id,
        parent_name: formData.parent_name.trim(),
        child_name: formData.child_name.trim(),
        child_birthdate: formData.child_birthdate,
        child_gender: formData.child_gender || null,
        main_challenge: formData.main_challenge || null,
        child_photo_url: formData.child_photo_url || null,
      });

      toast.success(`Welcome, ${formData.parent_name}! 🎉`);
      navigate('/home');
    } catch (error) {
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <span className="text-6xl mb-4 block">👋</span>
              <h2 className="text-2xl font-bold">What's your name?</h2>
              <p className="text-muted-foreground mt-2">
                We'll use this to personalize your experience
              </p>
            </div>
            <Input
              placeholder="Your name"
              value={formData.parent_name}
              onChange={(e) => updateForm('parent_name', e.target.value)}
              autoFocus
              className="text-center text-lg"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <span className="text-6xl mb-4 block">👶</span>
              <h2 className="text-2xl font-bold">What's your child's name?</h2>
              <p className="text-muted-foreground mt-2">
                We'll personalize strategies just for them
              </p>
            </div>
            <Input
              placeholder="Child's name"
              value={formData.child_name}
              onChange={(e) => updateForm('child_name', e.target.value)}
              autoFocus
              className="text-center text-lg"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <span className="text-6xl mb-4 block">🎂</span>
              <h2 className="text-2xl font-bold">When was {formData.child_name} born?</h2>
              <p className="text-muted-foreground mt-2">
                This helps us suggest age-appropriate strategies
              </p>
            </div>
            <Input
              type="date"
              value={formData.child_birthdate}
              onChange={(e) => updateForm('child_birthdate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="text-center text-lg"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <span className="text-6xl mb-4 block">✨</span>
              <h2 className="text-2xl font-bold">Gender (optional)</h2>
              <p className="text-muted-foreground mt-2">
                This is completely optional
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {['Boy', 'Girl', 'Prefer not to say'].map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={formData.child_gender === option ? 'coral' : 'secondary'}
                  size="lg"
                  onClick={() => updateForm('child_gender', option)}
                  className="w-full"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <span className="text-6xl mb-4 block">💪</span>
              <h2 className="text-2xl font-bold">Biggest challenge right now?</h2>
              <p className="text-muted-foreground mt-2">
                We'll prioritize strategies for this
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {CHALLENGES.map((challenge) => (
                <Button
                  key={challenge.value}
                  type="button"
                  variant={formData.main_challenge === challenge.value ? 'coral' : 'secondary'}
                  size="lg"
                  onClick={() => updateForm('main_challenge', challenge.value)}
                  className="w-full"
                >
                  {challenge.label}
                </Button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <span className="text-6xl mb-4 block">📸</span>
              <h2 className="text-2xl font-bold">Add {formData.child_name}'s photo</h2>
              <p className="text-muted-foreground mt-2">
                Optional, but it makes the app feel more personal
              </p>
            </div>
            <div className="flex justify-center">
              <PhotoUpload
                currentUrl={formData.child_photo_url || null}
                onUpload={(url) => updateForm('child_photo_url', url)}
                onRemove={() => updateForm('child_photo_url', '')}
                bucket="child-photos"
                size="lg"
                placeholder="Add photo"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-6">
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-all',
                i < step ? 'bg-primary' : 'bg-secondary'
              )}
            />
          ))}
        </div>
      </div>

      {/* Back button */}
      {step > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="absolute top-4 left-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 animate-fade-in">
        {renderStep()}
      </div>

      {/* Footer */}
      <div className="px-6 pb-8">
        {step < TOTAL_STEPS ? (
          <Button
            variant="coral"
            size="xl"
            className="w-full"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Continue
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        ) : (
          <Button
            variant="coral"
            size="xl"
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <LoadingSpinner size="sm" className="text-primary-foreground" />
            ) : (
              <>
                <Heart className="w-5 h-5 mr-2" />
                Let's Start!
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
