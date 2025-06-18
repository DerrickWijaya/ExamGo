'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createUser } from '@/lib/firestore';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    nama: '',
    universitas: '',
    jurusan: '',
    targetScore: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get email from URL parameters
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Create user in Firebase
      await createUser({
        email: formData.email,
        nama: formData.nama,
        universitas: formData.universitas,
        jurusan: formData.jurusan,
        targetScore: formData.targetScore
      });
      
      // Save user data to localStorage for immediate dashboard access
      const userDataWithTimestamp = {
        ...formData,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('userData', JSON.stringify(userDataWithTimestamp));
      
      // Show success popup
      setShowSuccessPopup(true);
      
      // Redirect to dashboard after showing popup
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setError('Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.nama && formData.universitas && formData.jurusan;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Isi Data Diri
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Lengkapi data berikut untuk melanjutkan pendaftaran
            </p>
          </CardHeader>
          
          <CardContent className="p-8 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-red-500 font-medium">
                  Nama<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nama"
                  type="text"
                  value={formData.nama}
                  onChange={(e) => handleInputChange('nama', e.target.value)}
                  required
                  className="h-12 bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-red-500 transition-all duration-200"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="universitas" className="text-red-500 font-medium">
                  Universitas<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="universitas"
                  type="text"
                  value={formData.universitas}
                  onChange={(e) => handleInputChange('universitas', e.target.value)}
                  required
                  className="h-12 bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-red-500 transition-all duration-200"
                  placeholder="Nama universitas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jurusan" className="text-red-500 font-medium">
                  Jurusan<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="jurusan"
                  type="text"
                  value={formData.jurusan}
                  onChange={(e) => handleInputChange('jurusan', e.target.value)}
                  required
                  className="h-12 bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-red-500 transition-all duration-200"
                  placeholder="Nama jurusan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetScore" className="text-red-500 font-medium">
                  Target Score SNBT
                </Label>
                <Input
                  id="targetScore"
                  type="number"
                  value={formData.targetScore}
                  onChange={(e) => handleInputChange('targetScore', e.target.value)}
                  className="h-12 bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-red-500 transition-all duration-200"
                  placeholder="Contoh: 750"
                  min="0"
                  max="1000"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-medium text-base transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading ? 'Mendaftar...' : 'Lanjutkan'}
              </Button>
            </form>

            {formData.email && (
              <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Email:</strong> {formData.email}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full shadow-2xl animate-in fade-in duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Pendaftaran Berhasil! 🎉
              </h2>
              <p className="text-gray-600 text-sm">
                Selamat bergabung! Anda akan diarahkan ke dashboard...
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}