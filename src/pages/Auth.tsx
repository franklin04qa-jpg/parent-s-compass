import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner, LoadingScreen } from '@/components/shared/LoadingSpinner';
import { UserType } from '@/types/database';
import { toast } from 'sonner';
import { Heart, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Auth() {
  const { user, userType, loading: authLoading, signIn, signUp } = useAuth();
  const { hasProfile, isLoading: profileLoading } = useProfile();
  
  const [activeTab, setActiveTab] = useState<UserType>('parent');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  if (authLoading || profileLoading) {
    return <LoadingScreen />;
  }

  // Redirect if already logged in
  if (user) {
    if (userType === 'creator') {
      return <Navigate to="/creator" replace />;
    }
    if (hasProfile) {
      return <Navigate to="/home" replace />;
    }
    return <Navigate to="/onboarding" replace />;
  }

  const validateForm = () => {
    try {
      authSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        err.errors.forEach((e) => {
          if (e.path[0] === 'email') fieldErrors.email = e.message;
          if (e.path[0] === 'password') fieldErrors.password = e.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);

    let result;
    if (isSignUp) {
      result = await signUp(email, password, activeTab);
      if (!result.error) {
        toast.success('Account created! Please check your email to confirm.');
      }
    } else {
      result = await signIn(email, password);
      if (!result.error) {
        toast.success('Welcome back!');
      }
    }

    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="w-20 h-20 gradient-coral rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Heart className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Little Moments</h1>
          <p className="text-muted-foreground mt-2">Your parenting companion</p>
        </div>

        {/* Tab Toggle */}
        <div className="w-full max-w-sm bg-secondary rounded-xl p-1 flex mb-6 animate-slide-up">
          <button
            onClick={() => setActiveTab('parent')}
            className={cn(
              'flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2',
              activeTab === 'parent'
                ? 'bg-card shadow-soft text-foreground'
                : 'text-muted-foreground'
            )}
          >
            <Heart className="w-4 h-4" />
            Parent
          </button>
          <button
            onClick={() => setActiveTab('creator')}
            className={cn(
              'flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2',
              activeTab === 'creator'
                ? 'bg-card shadow-soft text-foreground'
                : 'text-muted-foreground'
            )}
          >
            <Sparkles className="w-4 h-4" />
            Creator
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 animate-slide-up">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="coral"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <LoadingSpinner size="sm" className="text-primary-foreground" />
            ) : isSignUp ? (
              `Create ${activeTab === 'parent' ? 'Parent' : 'Creator'} Account`
            ) : (
              'Sign In'
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-semibold hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </form>

        {/* Info */}
        <p className="mt-8 text-xs text-muted-foreground text-center max-w-xs">
          {activeTab === 'parent'
            ? 'Track your parenting journey, get personalized strategies, and celebrate every moment.'
            : 'Share your expertise and help parents navigate their journey with actionable strategies.'}
        </p>
      </div>
    </div>
  );
}
