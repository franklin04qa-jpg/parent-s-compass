import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useStrategies } from '@/hooks/useStrategies';
import { ChildAvatar } from '@/components/shared/ChildAvatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatAge } from '@/lib/age';
import { LogOut, Star, CheckCircle } from 'lucide-react';

export default function Profile() {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { savedStrategies } = useStrategies();
  const navigate = useNavigate();

  if (!profile) return null;

  const workedStrategies = savedStrategies.filter((s) => s.worked);

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center animate-fade-in">
        <ChildAvatar
          photoUrl={profile.child_photo_url}
          name={profile.child_name}
          size="xl"
          className="mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold">{profile.parent_name}</h1>
        <p className="text-muted-foreground">
          Parent of {profile.child_name} ({formatAge(profile.child_birthdate)})
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 animate-slide-up">
        <Card className="p-4 text-center">
          <Star className="w-8 h-8 text-sunny mx-auto mb-2" />
          <p className="text-2xl font-bold">{savedStrategies.length}</p>
          <p className="text-sm text-muted-foreground">Saved Strategies</p>
        </Card>
        <Card className="p-4 text-center">
          <CheckCircle className="w-8 h-8 text-sage mx-auto mb-2" />
          <p className="text-2xl font-bold">{workedStrategies.length}</p>
          <p className="text-sm text-muted-foreground">Strategies That Worked</p>
        </Card>
      </div>

      {/* Info */}
      <Card className="p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="font-bold mb-3">Profile Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Child's name</span>
            <span className="font-medium">{profile.child_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Birthday</span>
            <span className="font-medium">
              {new Date(profile.child_birthdate).toLocaleDateString()}
            </span>
          </div>
          {profile.child_gender && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gender</span>
              <span className="font-medium">{profile.child_gender}</span>
            </div>
          )}
          {profile.main_challenge && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Main challenge</span>
              <span className="font-medium capitalize">{profile.main_challenge}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Sign Out */}
      <Button
        variant="destructive"
        size="lg"
        className="w-full animate-slide-up"
        style={{ animationDelay: '0.2s' }}
        onClick={signOut}
      >
        <LogOut className="w-5 h-5 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
