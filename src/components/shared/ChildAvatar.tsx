import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChildAvatarProps {
  photoUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ChildAvatar({ photoUrl, name, size = 'md', className }: ChildAvatarProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        'rounded-full bg-coral-light border-4 border-card shadow-soft overflow-hidden flex items-center justify-center',
        className
      )}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <User className={cn(iconSizes[size], 'text-coral')} />
      )}
    </div>
  );
}
