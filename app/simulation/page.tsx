'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/ui/header';
import { getSimulationProgress, getSimulationResult } from '@/lib/firestore';

interface SimulationData {
  id: number;
  title: string;
  hasStarted: boolean;
  isCompleted: boolean;
  finalScore: number | null;
}

export default function SimulationPage() {
  const router = useRouter();
  const [simulations, setSimulations] = useState<SimulationData[]>([
    { id: 1, title: 'SIMULASI 1', hasStarted: false, isCompleted: false, finalScore: null },
    { id: 2, title: 'SIMULASI 2', hasStarted: false, isCompleted: false, finalScore: null },
    { id: 3, title: 'SIMULASI 3', hasStarted: false, isCompleted: false, finalScore: null }
  ]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSimulationData = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setUserEmail(user.email);
          
          // Load simulation progress and results for each simulation
          const updatedSimulations = await Promise.all(
            simulations.map(async (sim) => {
              try {
                // Check if simulation has been started
                const progress = await getSimulationProgress(user.email, sim.id);
                const result = await getSimulationResult(user.email, sim.id);
                
                return {
                  ...sim,
                  hasStarted: progress?.isStarted || false,
                  isCompleted: result !== null,
                  finalScore: result?.finalScore || null
                };
              } catch (error) {
                console.error(`Error loading data for simulation ${sim.id}:`, error);
                return sim;
              }
            })
          );
          
          setSimulations(updatedSimulations);
        }
      } catch (error) {
        console.error('Error loading simulation data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSimulationData();
  }, []);

  const handleStart = (simulationId: number) => {
    // Navigate to first subtest (TPS) of the simulation
    router.push(`/simulation/${simulationId}/tps/1`);
  };

  const handleContinue = (simulationId: number) => {
    // Navigate to first subtest (TPS) to continue
    router.push(`/simulation/${simulationId}/tps/1`);
  };

  const handleViewResult = (simulationId: number) => {
    router.push(`/simulation/${simulationId}/result`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading simulations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-gray-800 text-lg leading-relaxed mb-4">
            SIMULASI MENGGUNAKAN TIME LIMIT DENGAN LAMA WAKTU SESUAI MASING-MASING SUB TES MENGIKUTI SNBT.
          </p>
          <p className="text-gray-800 text-lg font-medium mb-4">
            ANDA DAPAT MENGULANG SIMULASI.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Format Simulasi (Urutan: TPS → Indo → Eng → Penalaran Matematika):</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• <strong>1. TPS (Tes Potensi Skolastik):</strong> 90 soal, 90 menit</li>
              <li>• <strong>2. Literasi Bahasa Indonesia:</strong> 25 soal, 37.5 menit</li>
              <li>• <strong>3. Literasi Bahasa Inggris:</strong> 20 soal, 30 menit</li>
              <li>• <strong>4. Penalaran Matematika:</strong> 20 soal, 37.5 menit</li>
            </ul>
            <div className="mt-3 p-2 bg-yellow-100 rounded border border-yellow-300">
              <p className="text-yellow-800 text-xs font-medium">
                ⚠️ Ketika waktu habis, simulasi akan otomatis berlanjut ke subtest berikutnya
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {simulations.map((simulation, index) => (
            <Card key={simulation.id} className="shadow-lg border-0 bg-white overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center">
                  {/* Simulation Image */}
                  <div className={`w-80 h-48 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center relative overflow-hidden ${
                    index === 0 ? 'border-4 border-blue-500' : ''
                  }`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10">
                      {/* Decorative elements similar to dashboard banners */}
                      <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white/30 rounded-full"></div>
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-2 border-white/30 rounded-full"></div>
                      <div className="absolute top-1/2 right-8 w-4 h-4 border-2 border-white/30 rounded-full"></div>
                    </div>
                  </div>

                  {/* Simulation Info */}
                  <div className="flex-1 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      {simulation.title}
                    </h2>
                    
                    <div className="space-y-4">
                      {!simulation.hasStarted ? (
                        <Button
                          onClick={() => handleStart(simulation.id)}
                          className="w-32 bg-blue-500 hover:bg-blue-600 text-white font-medium"
                        >
                          START
                        </Button>
                      ) : simulation.isCompleted ? (
                        <div className="flex space-x-4">
                          <Button
                            onClick={() => handleViewResult(simulation.id)}
                            className="w-32 bg-green-500 hover:bg-green-600 text-white font-medium"
                          >
                            VIEW RESULT
                          </Button>
                          <Button
                            onClick={() => handleStart(simulation.id)}
                            className="w-32 bg-gray-500 hover:bg-gray-600 text-white font-medium"
                          >
                            RETRY
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleContinue(simulation.id)}
                          className="w-32 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                        >
                          CONTINUE
                        </Button>
                      )}
                      
                      <div className="text-gray-700">
                        <span className="font-medium">SCORE: </span>
                        <span className={simulation.finalScore ? 'text-green-600 font-semibold' : ''}>
                          {simulation.finalScore || '-'}
                        </span>
                      </div>
                      
                      {simulation.hasStarted && !simulation.isCompleted && (
                        <div className="text-orange-600 text-sm font-medium">
                          ⚠️ Simulasi sedang berlangsung
                        </div>
                      )}
                      
                      {simulation.isCompleted && (
                        <div className="text-green-600 text-sm font-medium">
                          ✅ Simulasi selesai
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}