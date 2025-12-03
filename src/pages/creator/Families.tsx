import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from 'sonner';
import { Plus, Users, Copy, Check, Calendar, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Profile } from '@/types/database';
import { formatAge } from '@/lib/age';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function Families() {
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

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const createAccount = async () => {
    if (!email) {
      toast.error('Email is required');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const tempPassword = generatePassword();

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: tempPassword,
        options: {
          data: {
            user_type: 'parent',
            first_login: true,
            parent_name: parentName || ''
          },
          emailRedirectTo: window.location.origin + '/'
        }
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Failed to create user');
      }

      setResult({
        email: email,
        password: tempPassword,
      });

      toast.success('Parent account created successfully!');
      setEmail('');
      setParentName('');
      refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      toast.error(errorMessage);
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

  const getChildAge = (birthdate: string) => {
    return formatAge(birthdate);
  };

  const getFamilyStatus = (family: Profile) => {
    if (family.child_name) {
      return { label: 'Active', variant: 'default' as const };
    }
    return { label: 'Pending Onboarding', variant: 'secondary' as const };
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
              <CheckCircle className="w-5 h-5" />
              Account Created Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-card rounded-lg p-4 font-mono text-sm space-y-2 border">
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
              Send these credentials to the parent. They'll need to change their password on first login.
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
            Parents who have registered accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {familiesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : families && families.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parent Name</TableHead>
                    <TableHead>Child Name</TableHead>
                    <TableHead>Child Age</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {families.map((family) => {
                    const status = getFamilyStatus(family);
                    return (
                      <TableRow key={family.id}>
                        <TableCell className="font-medium">
                          {family.parent_name || '—'}
                        </TableCell>
                        <TableCell>
                          {family.child_name || (
                            <span className="text-muted-foreground italic">Not completed</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {family.child_birthdate ? (
                            getChildAge(family.child_birthdate)
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(family.created_at), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>
                            {status.label === 'Active' ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {status.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
