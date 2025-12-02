import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { BottomNav } from '@/components/shared/BottomNav';
import { LoadingScreen } from '@/components/shared/LoadingSpinner';

export function ParentLayout() {
  const { user, userType, loading: authLoading } = useAuth();
  const { hasProfile, isLoading: profileLoading } = useProfile();

  if (authLoading || profileLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (userType === 'creator') {
    return <Navigate to="/creator" replace />;
  }

  if (!hasProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Outlet />
      <BottomNav />
    </div>
  );
}
