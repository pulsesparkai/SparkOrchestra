import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from './auth-provider';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, LogIn, UserPlus, Zap, CheckCircle } from 'lucide-react';
import orchestraLogo from '@assets/Lo_1754349496969.png';

export function SupabaseAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message || 'Failed to sign in');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, username);
      
      if (error) {
        setError(error.message || 'Failed to create account');
      } else {
        setSuccess('Account created! Please check your email to verify your account.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setMagicLinkSent(true);
        setSuccess('Magic link sent! Check your email to sign in.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <Card className="w-full max-w-md bg-white border" style={{borderColor: '#e4e4e4'}}>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-black">Check Your Email</CardTitle>
          <CardDescription className="text-black opacity-70">
            We sent a magic link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-black opacity-70">
            Click the link in your email to sign in instantly. No password required!
          </p>
          
          <div className="p-4 border rounded-lg" style={{backgroundColor: 'rgba(255, 107, 53, 0.1)', borderColor: 'rgba(255, 107, 53, 0.2)'}}>
            <p className="text-sm" style={{color: '#ff6b35'}}>
              💡 Tip: Magic links are more secure than passwords and work on any device
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setMagicLinkSent(false);
              setEmail('');
            }}
            className="w-full text-black border-gray-300 hover:bg-gray-50"
          >
            Try Different Email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-white border" style={{borderColor: '#e4e4e4'}}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 mb-2 text-2xl font-bold text-black">
          <span style={{color: '#8B4513'}}>Welcome to</span>
          <img 
            src={orchestraLogo}
            alt="Orchestra" 
            className="h-32 w-auto"
          />
        </CardTitle>
        <CardDescription className="text-black opacity-70 mb-4">
          Sign in to manage your AI Team
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="magic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="magic" className="text-black data-[state=active]:bg-[#c85a3a] data-[state=active]:text-white">
              <Zap className="w-4 h-4 mr-2" />
              Magic Link
            </TabsTrigger>
            <TabsTrigger value="password" className="text-black data-[state=active]:bg-[#c85a3a] data-[state=active]:text-white">
              <Lock className="w-4 h-4 mr-2" />
              Password
            </TabsTrigger>
          </TabsList>

          {/* Magic Link Tab */}
          <TabsContent value="magic" className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-accent bg-accent/20">
                <AlertDescription style={{color: '#ff6b35'}}>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email" className="text-black">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="magic-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-white text-black border-gray-300 focus:border-gray-400 focus:ring-0"
                    style={{borderColor: '#d0d0d0'}}
                  />
                </div>
              </div>

              <Button
                onClick={handleMagicLink}
                disabled={isLoading || !email}
                className="w-full text-white"
                style={{
                  backgroundColor: '#c85a3a'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b54e30'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#c85a3a'}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending magic link...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Send Magic Link</span>
                  </div>
                )}
              </Button>

              <div className="text-center">
                <p className="text-xs text-black opacity-50">
                  ✨ No password needed • More secure • Works on any device
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password" className="space-y-4">
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="signin" className="text-black data-[state=active]:bg-[#c85a3a] data-[state=active]:text-white">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-black data-[state=active]:bg-[#c85a3a] data-[state=active]:text-white">Sign Up</TabsTrigger>
              </TabsList>

              {/* Sign In Form */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-black">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 bg-white text-black border-gray-300 focus:border-gray-400 focus:ring-0"
                        style={{borderColor: '#d0d0d0'}}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-black">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 bg-white text-black border-gray-300 focus:border-gray-400 focus:ring-0"
                        style={{borderColor: '#d0d0d0'}}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full text-white"
                    style={{backgroundColor: '#c85a3a'}}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b54e30'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#c85a3a'}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Form */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-accent bg-accent/20">
                      <AlertDescription style={{color: '#ff6b35'}}>{success}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-black">Username</Label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="pl-10 bg-white text-black border-gray-300 focus:border-gray-400 focus:ring-0"
                        style={{borderColor: '#d0d0d0'}}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-black">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 bg-white text-black border-gray-300 focus:border-gray-400 focus:ring-0"
                        style={{borderColor: '#d0d0d0'}}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-black">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="pl-10 bg-white text-black border-gray-300 focus:border-gray-400 focus:ring-0"
                        style={{borderColor: '#d0d0d0'}}
                      />
                    </div>
                    <p className="text-xs text-black opacity-50">Password must be at least 6 characters</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full text-white"
                    style={{backgroundColor: '#c85a3a'}}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b54e30'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#c85a3a'}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <UserPlus className="w-4 h-4" />
                        <span>Create Account</span>
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}