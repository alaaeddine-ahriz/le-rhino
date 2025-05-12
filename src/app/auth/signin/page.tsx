"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle, user } = useAuth();
  const router = useRouter();

  // Redirect to chat if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/chat');
    }
  }, [user, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(email, password);
      toast.success('Connexion réussie !');
      router.push('/chat');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Échec de la connexion';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      await signInWithGoogle();
      toast.success('Connexion avec Google réussie !');
      router.push('/chat');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Échec de la connexion avec Google';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // If the user is logged in, we're redirecting, so don't render the form
  if (user) {
    return null;
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-128px)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>Entrez votre email ci-dessous pour vous connecter à votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">E-mail</label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Connexion'}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou continuez avec</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Connexion avec Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Vous n&apos;avez pas de compte ?{' '}
            <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Créer un compte
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 