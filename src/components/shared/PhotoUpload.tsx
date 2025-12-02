import { useState, useRef } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/lib/storage';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PhotoUploadProps {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  bucket: 'child-photos' | 'diary-photos';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'rounded';
  placeholder?: string;
}

export function PhotoUpload({
  currentUrl,
  onUpload,
  onRemove,
  bucket,
  className,
  size = 'md',
  shape = 'circle',
  placeholder = 'Add photo',
}: PhotoUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    const { url, error } = await uploadFile(bucket, file, user.id);
    setUploading(false);

    if (error) {
      toast.error(error);
      return;
    }

    if (url) {
      onUpload(url);
      toast.success('Photo uploaded!');
    }
  };

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          sizeClasses[size],
          shape === 'circle' ? 'rounded-full' : 'rounded-xl',
          'bg-secondary border-2 border-dashed border-border flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-primary hover:bg-secondary/80',
          uploading && 'opacity-50 pointer-events-none'
        )}
      >
        {currentUrl ? (
          <img
            src={currentUrl}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            {uploading ? (
              <Upload className="w-6 h-6 animate-pulse" />
            ) : (
              <Camera className="w-6 h-6" />
            )}
            {size !== 'sm' && (
              <span className="text-xs text-center px-1">{placeholder}</span>
            )}
          </div>
        )}
      </div>

      {currentUrl && onRemove && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
