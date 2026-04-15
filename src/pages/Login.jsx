import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login, signup, isLoadingAuth, isAuthenticated } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await signup(email.trim(), password, fullName.trim() || email.trim());
      }
      navigate('/');
    } catch (error) {
      toast({
        title: 'Authentication failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 px-4">
      <Card className="max-w-md w-full p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <Label htmlFor="full-name">Full name</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="mt-1 rounded-lg"
              />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 rounded-lg"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 rounded-lg"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl h-11" disabled={isLoadingAuth}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
        <div className="mt-4 text-sm text-center text-slate-600">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button className="text-sky-600 hover:underline" onClick={() => setMode('signup')}>
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="text-sky-600 hover:underline" onClick={() => setMode('login')}>
                Sign in
              </button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
