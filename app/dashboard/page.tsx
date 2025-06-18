'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { User, BookOpen } from 'lucide-react';
import Header from '@/components/ui/header';
import { getUserByEmail } from '@/lib/firestore';

interface UserData {
  email: string;
  nama: string;
  universitas: string;
  jurusan: string;
  targetScore: string;
  createdAt?: string | Date;
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First try to get data from localStorage
        const storedData = localStorage.getItem('userData');
        if (storedData) {
          const localUserData = JSON.parse(storedData);
          setUserData(localUserData);
          
          // Also try to sync with Firebase to get latest data
          if (localUserData.email) {
            try {
              const firebaseUserData = await getUserByEmail(localUserData.email);
              if (firebaseUserData) {
                setUserData(firebaseUserData);
                // Update localStorage with latest Firebase data
                localStorage.setItem('userData', JSON.stringify(firebaseUserData));
              }
            } catch (error) {
              console.error('Error syncing with Firebase:', error);
              // Continue with localStorage data if Firebase fails
            }
          }
        } else {
          // No local data, redirect to login
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to default data for demo
        setUserData({
          email: 'demo@example.com',
          nama: 'Joko Aditya Purnama',
          universitas: 'Universitas Indonesia',
          jurusan: 'Teknik Informatika',
          targetScore: '720'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleExerciseClick = () => {
    router.push('/exercise');
  };

  const handleSimulationClick = () => {
    router.push('/simulation');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Data pengguna tidak ditemukan</p>
          <button 
            onClick={() => router.push('/login')}
            className="text-blue-500 hover:text-blue-600 underline"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* User Profile Section */}
        <div className="flex items-start space-x-8 mb-12">
          {/* Profile Picture */}
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center shadow-lg border-4 border-gray-200">
            <User className="w-16 h-16 text-gray-600" />
          </div>

          {/* User Info */}
          <div className="flex-1 bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nama: {userData.nama}
            </h2>
            <p className="text-gray-700 mb-1">
              Tujuan Universitas: {userData.universitas}
            </p>
            <p className="text-gray-700 mb-1">
              Tujuan Jurusan: {userData.jurusan}
            </p>
            <p className="text-gray-700 mb-1">
              Target score: {userData.targetScore || 'Belum ditentukan'}
            </p>
            <p className="text-gray-500 text-sm">
              Email: {userData.email}
            </p>
          </div>

          {/* Materi Belajar Section */}
          <div className="w-80 bg-white rounded-lg p-6 shadow-lg border border-gray-200">
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
        </div>

        {/* Exercise and Simulation Banners */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Simulation Banner */}
          <Card 
            className="cursor-pointer transform hover:scale-105 transition-transform duration-200 shadow-xl border-0 overflow-hidden"
            onClick={handleSimulationClick}
          >
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-gray-600 to-gray-800 h-64 flex flex-col justify-center items-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-center">
                  <h3 className="text-3xl font-bold mb-2">SIMULATION</h3>
                  <div className="w-16 h-1 bg-white mx-auto mb-2"></div>
                  <p className="text-lg">TEST YOUR SKILL</p>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white/30 rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-2 border-white/30 rounded-full"></div>
                <div className="absolute top-1/2 right-8 w-4 h-4 border-2 border-white/30 rounded-full"></div>
              </div>
            </CardContent>
          </Card>

          {/* Exercise Banner */}
          <Card 
            className="cursor-pointer transform hover:scale-105 transition-transform duration-200 shadow-xl border-0 overflow-hidden"
            onClick={handleExerciseClick}
          >
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-gray-600 to-gray-800 h-64 flex flex-col justify-center items-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-center">
                  <h3 className="text-3xl font-bold mb-2">EXERCISE</h3>
                  <div className="w-16 h-1 bg-white mx-auto mb-2"></div>
                  <p className="text-lg">HONE YOUR SKILL</p>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white/30 rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-2 border-white/30 rounded-full"></div>
                <div className="absolute top-1/2 right-8 w-4 h-4 border-2 border-white/30 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}