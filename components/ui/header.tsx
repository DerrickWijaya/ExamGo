'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear user data and redirect to landing page
    localStorage.removeItem('userData');
    localStorage.removeItem('simulationData');
    router.push('/');
  };

  return (
    <header className="bg-gradient-to-b from-sky-300 to-white px-4 py-4 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold italic text-black font-maven-pro">ExamGo</h1>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <button 
              onClick={() => router.push('/exercise')}
              className="text-black font-medium hover:text-gray-700 transition-colors font-maven-pro"
            >
              Latihan
            </button>
            <button 
              onClick={() => router.push('/simulation')}
              className="text-black font-medium hover:text-gray-700 transition-colors font-maven-pro"
            >
              Simulasi
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="flex items-center">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-black text-black hover:bg-black hover:text-white font-maven-pro"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}