import { Suspense } from 'react';
import Header from '@/components/ui/header';
import SimulationListClient from './SimulationListClient';

// Generate static params for simulation subtests
export async function generateStaticParams() {
  const params = [];
  const subtests = ['tps', 'indo', 'eng', 'mat'];
  
  // Generate for 3 simulations
  for (let simId = 1; simId <= 3; simId++) {
    for (const subtest of subtests) {
      params.push({
        id: simId.toString(),
        subtest: subtest
      });
    }
  }
  
  return params;
}

// Get subtest title based on subtest ID (Server-side function)
function getSubtestTitle(subtest: string) {
  switch (subtest) {
    case 'tps':
      return 'Tes Potensi Skolastik';
    case 'indo':
      return 'Literasi Bahasa Indonesia';
    case 'eng':
      return 'Literasi Bahasa Inggris';
    case 'mat':
      return 'Penalaran Matematika';
    default:
      return 'Simulation';
  }
}

// Determine total questions based on subtest (Server-side function)
function getTotalQuestions(subtest: string) {
  switch (subtest) {
    case 'tps':
      return 90;
    case 'indo':
      return 25;
    case 'eng':
      return 20;
    case 'mat':
      return 20;
    default:
      return 20;
  }
}

// Get time limit in minutes
function getTimeLimit(subtest: string) {
  switch (subtest) {
    case 'tps':
      return 90;
    case 'indo':
      return 37.5;
    case 'eng':
      return 30;
    case 'mat':
      return 37.5;
    default:
      return 30;
  }
}

export default function SimulationListPage({ 
  params 
}: { 
  params: { id: string; subtest: string } 
}) {
  const subtestTitle = getSubtestTitle(params.subtest);
  const totalQuestions = getTotalQuestions(params.subtest);
  const timeLimit = getTimeLimit(params.subtest);
  const simulationId = parseInt(params.id);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Simulasi {simulationId} - {subtestTitle}
          </h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-800 font-medium">
              {totalQuestions} soal • {timeLimit} menit
            </p>
            <p className="text-blue-600 text-sm mt-1">
              Timer akan berjalan otomatis saat memulai
            </p>
          </div>
        </div>

        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <SimulationListClient 
            simulationId={simulationId}
            subtest={params.subtest as 'tps' | 'indo' | 'eng' | 'mat'}
            totalQuestions={totalQuestions}
          />
        </Suspense>
      </div>
    </div>
  );
}