'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Brain, Target } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-b from-sky-300 to-white px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold italic text-black font-maven-pro">ExamGo</h1>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-6">
              <span className="text-black font-medium cursor-not-allowed opacity-50 font-maven-pro">Latihan</span>
              <span className="text-black font-medium cursor-not-allowed opacity-50 font-maven-pro">Simulasi</span>
            </nav>
          </div>

          {/* Auth Button */}
          <div className="flex items-center">
            <Button
              onClick={handleLogin}
              className="bg-red-500 hover:bg-red-600 text-white font-maven-pro"
            >
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gray-200 py-16">
        <div className="max-w-6xl mx-auto px-4 flex items-center">
          {/* Left Side - Materi Belajar */}
          <div className="w-1/4 bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Materi Belajar</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Kumpulan Soal Penalaran Umum</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Kumpulan Soal PBU, PBK, dan LBI</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Kumpulan Soal PK & PM</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Kumpulan Soal Literasi dalam Bahasa Inggris</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Simulasi UTBK</span>
              </li>
            </ul>
          </div>

          {/* Right Side - Hero Content */}
          <div className="flex-1 ml-8 relative">
            {/* Background with Indonesia map silhouette */}
            <div className="bg-gray-400 rounded-lg p-8 h-80 relative overflow-hidden">
              {/* Decorative elements representing Indonesia map */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-8 left-16 w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="absolute top-12 left-24 w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="absolute top-16 left-32 w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="absolute top-20 left-40 w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="absolute top-24 left-48 w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="absolute top-28 left-56 w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="absolute top-32 left-64 w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="absolute top-36 left-72 w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="absolute top-40 left-80 w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="absolute top-44 left-88 w-2 h-2 bg-yellow-500 rounded-full"></div>
                
                {/* More decorative dots */}
                <div className="absolute top-20 left-20 w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="absolute top-36 left-28 w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="absolute top-48 left-36 w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="absolute top-52 left-44 w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="absolute top-56 left-52 w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="absolute top-60 left-60 w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="absolute top-64 left-68 w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="absolute top-68 left-76 w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>

              {/* Hero Text */}
              <div className="relative z-10 text-white">
                <h2 className="text-4xl font-bold mb-4">LEARN TO YOUR UTMOST BEST!</h2>
                <div className="bg-black bg-opacity-50 p-4 rounded-lg max-w-md">
                  <p className="text-sm leading-relaxed">
                    ExamGo adalah website untuk membantu para siswa dalam menghadapi ujian SNBT dengan cara menyediakan berbagai materi pembelajaran dengan kategori yang berbeda beserta latihannya dan simulasinya.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Kenapa sih mesti belajar online di ExamGo?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="text-center shadow-lg border-0">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Bisa diakses kapan aja</h3>
                <p className="text-gray-600 text-sm">
                  Jelas lah, kalo dengan belajar atau log kapanpun engga buka eksampun! Tinton aja sampe kenyang.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="text-center shadow-lg border-0">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mind-transforming!</h3>
                <p className="text-gray-600 text-sm">
                  ExamGo ga cuma ngasih kalian soal aja atau inti materi aja bagus dibalik, jadi dengan kalian cerdas berbuat itu lebih di mana aja.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="text-center shadow-lg border-0">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Yaudah lah, ayo gass</h3>
                <p className="text-gray-600 text-sm">
                  Mau belajar atau sih di mana sih belajar. Tapi belajar sendiri buat sampe bisa juga ga sama ExamGo, ya gak??
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}