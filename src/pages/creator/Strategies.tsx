import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStrategies } from '@/hooks/useStrategies';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { CATEGORY_CONFIG, StrategyCategory } from '@/types/database';
import { formatAgeRange } from '@/lib/age';
import { Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type FilterType = 'all' | 'weekly' | StrategyCategory;

export default function CreatorStrategies() {
  const { myStrategies, updateStrategy, deleteStrategy } = useStrategies();
  const [filter, setFilter] = useState<FilterType>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredStrategies = myStrategies.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'weekly') return s.is_weekly_boost;
    return s.category === filter;
  });

  const handleTogglePublished = async (id: string, published: boolean) => {
    try {
      await updateStrategy.mutateAsync({ id, published });
      toast.success(published ? 'Strategy published!' : 'Strategy unpublished');
    } catch (error) {
      toast.error('Failed to update strategy');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteStrategy.mutateAsync(deleteId);
      toast.success('Strategy deleted');
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete strategy');
    }
  };

  const FILTERS: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'weekly', label: '⭐ Weekly Boosts' },
    ...Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
      value: key as StrategyCategory,
      label: `${config.emoji} ${config.label}`,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Strategies</h1>
        <Button variant="coral" asChild>
          <Link to="/creator/strategy/new">
            <Plus className="w-4 h-4 mr-2" />
            New
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'coral' : 'secondary'}
            size="sm"
            onClick={() => setFilter(f.value)}
            className="shrink-0"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredStrategies.length > 0 ? (
          filteredStrategies.map((strategy) => {
            const categoryConfig = CATEGORY_CONFIG[strategy.category];
            return (
              <Card key={strategy.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs', categoryConfig.color)}>
                        {categoryConfig.emoji} {categoryConfig.label}
                      </span>
                      {strategy.is_weekly_boost && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-sunny-light text-sunny">
                          ⭐ Weekly Boost
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold">{strategy.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Ages {formatAgeRange(strategy.age_min, strategy.age_max)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-center gap-1">
                      <Switch
                        checked={strategy.published}
                        onCheckedChange={(checked) =>
                          handleTogglePublished(strategy.id, checked)
                        }
                      />
                      <span className="text-xs text-muted-foreground">
                        {strategy.published ? 'Live' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="secondary" size="sm" asChild className="flex-1">
                    <Link to={`/creator/strategy/edit/${strategy.id}`}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(strategy.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No strategies found</p>
            <Button variant="coral" asChild>
              <Link to="/creator/strategy/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Strategy
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Strategy?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the strategy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
