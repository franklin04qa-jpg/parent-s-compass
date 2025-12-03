import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from 'sonner';
import { Plus, Users, Copy, Check, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Profile } from '@/types/database';

export default function Families() {
  const { session } = useAuth();
  const [email, setEmail] = useState('');
  const [parentName, setParentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch existing families (profiles)
  const { data: families, isLoading: familiesLoading, refetch } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });

  const createAccount = async () => {
    if (!email) {
      toast.error('Email is required');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-parent-account', {
        body: { email, parentName },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult({
        email: data.email,
        password: data.password,
      });

      toast.success('Parent account created successfully!');
      setEmail('');
      setParentName('');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (result) {
      navigator.clipboard.writeText(`Email: ${result.email}\nPassword: ${result.password}`);
      setCopied(true);
      toast.success('Credentials copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Family Management</h1>
        <p className="text-muted-foreground">Create and manage parent accounts</p>
      </div>

      {/* Create Account Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Parent Account
          </CardTitle>
          <CardDescription>
            Create a new parent account. They'll receive login credentials to access the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Parent Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="parent@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentName">Parent Name (optional)</Label>
              <Input
                id="parentName"
                type="text"
                placeholder="For your reference"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <Button
            onClick={createAccount}
            disabled={loading || !email}
            variant="coral"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Account
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Success Result */}
      {result && (
        <Card className="border-sage bg-sage/5">
          <CardHeader>
            <CardTitle className="text-sage flex items-center gap-2">
              <Check className="w-5 h-5" />
              Account Created Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-card rounded-lg p-4 font-mono text-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-semibold">{result.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Password:</span>
                <span className="font-semibold">{result.password}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={copyCredentials}
                variant="secondary"
                size="sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Credentials
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Send these credentials to the parent. They'll complete their profile on first login.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Existing Families */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Existing Families
          </CardTitle>
          <CardDescription>
            Parents who have completed their profile setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          {familiesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : families && families.length > 0 ? (
            <div className="divide-y divide-border">
              {families.map((family) => (
                <div key={family.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{family.parent_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Child: {family.child_name}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(family.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No families registered yet</p>
              <p className="text-sm text-muted-foreground">Create a parent account above to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
