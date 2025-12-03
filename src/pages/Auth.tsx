import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner, LoadingScreen } from '@/components/shared/LoadingSpinner';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Auth() {
  const { user, userType, loading: authLoading, signIn } = useAuth();
  const { hasProfile, isLoading: profileLoading } = useProfile();
  
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

    const result = await signIn(email, password);

    if (result.error) {
      toast.error(result.error);
      setSubmitting(false);
      return;
    }

    toast.success('Welcome back!');
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="w-20 h-20 gradient-coral rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Heart className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Little Moments</h1>
          <p className="text-muted-foreground mt-2">Your parenting companion</p>
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
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Info */}
        <p className="mt-8 text-xs text-muted-foreground text-center max-w-xs">
          Track your parenting journey with personalized strategies and celebrate every moment.
        </p>
      </div>
    </div>
  );
}
