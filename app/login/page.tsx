'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { checkUserExists, getUserByEmail, storeEmailForRegistration } from '@/lib/firestore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');
    
    try {
      // Check if user exists in Firebase
      const userExists = await checkUserExists(email);
      
      if (userExists) {
        // User exists - get user data and redirect to dashboard
        const userData = await getUserByEmail(email);
        if (userData) {
          // Store user data in localStorage for dashboard access
          localStorage.setItem('userData', JSON.stringify(userData));
          router.push('/dashboard');
        }
      } else {
        // User doesn't exist - store email for registration and redirect to register
        await storeEmailForRegistration(email);
        router.push(`/register?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      console.error('Error during login process:', error);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Yuk, daftar atau masuk sekarang. <span className="text-red-500">GRATIS!</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-red-500 font-medium">
                Email<span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-red-500 transition-all duration-200"
                placeholder="Masukkan email Anda"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!email || isLoading}
              className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-medium text-base transition-colors duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Lanjutkan'}
            </Button>
          </form>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              Having trouble?{' '}
              <Link href="/contact" className="text-red-500 hover:text-red-600 font-medium underline transition-colors">
                Contact us
              </Link>
            </p>
          </div>

          <div className="text-center mt-4">
            <Link href="/" className="text-blue-500 hover:text-blue-600 font-medium underline transition-colors">
              Kembali ke Landing Page
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}