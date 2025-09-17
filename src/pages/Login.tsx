import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowRight } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate sending magic link
    setTimeout(() => {
      setMagicLinkSent(true);
      setIsLoading(false);
      showSuccess('Magic link sent to your email!');
    }, 1000);
  };

  const handleMagicLinkLogin = () => {
    // Mock magic link login
    login(email);
    showSuccess('Successfully logged in!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Food Business account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!magicLinkSent ? (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  'Sending...'
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <Mail className="mx-auto h-8 w-8 text-green-600 mb-2" />
                <p className="text-sm text-green-800">
                  Magic link sent to <strong>{email}</strong>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Check your email and click the link to sign in
                </p>
              </div>
              
              {/* Mock magic link button for demo */}
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-3">
                  For demo purposes, click below to simulate magic link:
                </p>
                <Button 
                  onClick={handleMagicLinkLogin}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Use Magic Link (Demo)
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setMagicLinkSent(false)}
                className="text-xs"
              >
                Use different email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;