import { Link } from 'react-router-dom';
import { useStrategies } from '@/hooks/useStrategies';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, FileText, Users, TrendingUp } from 'lucide-react';

export default function CreatorDashboard() {
  const { myStrategies } = useStrategies();

  const publishedCount = myStrategies.filter((s) => s.published).length;
  const weeklyBoostCount = myStrategies.filter((s) => s.is_weekly_boost).length;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold">Creator Dashboard 🎨</h1>
        <p className="text-muted-foreground mt-1">
          Create strategies to help parents navigate parenting challenges
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 animate-slide-up">
        <Button variant="coral" size="lg" asChild className="flex-1">
          <Link to="/creator/strategy/new">
            <Plus className="w-5 h-5 mr-2" />
            New Strategy
          </Link>
        </Button>
        <Button variant="secondary" size="lg" asChild className="flex-1">
          <Link to="/creator/strategies">
            <FileText className="w-5 h-5 mr-2" />
            Manage All
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <Card className="p-4">
          <FileText className="w-8 h-8 text-primary mb-2" />
          <p className="text-2xl font-bold">{myStrategies.length}</p>
          <p className="text-sm text-muted-foreground">Total Strategies</p>
        </Card>
        <Card className="p-4">
          <TrendingUp className="w-8 h-8 text-sage mb-2" />
          <p className="text-2xl font-bold">{publishedCount}</p>
          <p className="text-sm text-muted-foreground">Published</p>
        </Card>
      </div>

      {/* Recent Strategies */}
      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-lg font-bold mb-3">Recent Strategies</h2>
        {myStrategies.length > 0 ? (
          <div className="space-y-2">
            {myStrategies.slice(0, 5).map((strategy) => (
              <Card key={strategy.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{strategy.title}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {strategy.category} • {strategy.published ? 'Published' : 'Draft'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/creator/strategy/edit/${strategy.id}`}>Edit</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't created any strategies yet
            </p>
            <Button variant="coral" asChild>
              <Link to="/creator/strategy/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Strategy
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
