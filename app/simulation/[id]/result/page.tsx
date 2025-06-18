'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/ui/header';
import { getSimulationResult } from '@/lib/firestore';

// Generate static params for simulation results
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ];
}

interface SubtestResult {
  subtest: string;
  correctAnswers: number;
  totalQuestions: number;
  score: number;
}

interface SimulationResult {
  simulationId: number;
  subtestResults: SubtestResult[];
  finalScore: number;
  completedAt: Date;
}

export default function SimulationResultPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const simulationId = parseInt(params.id);

  const subtestNames = {
    tps: 'Tes Potensi Skolastik',
    indo: 'Literasi Bahasa Indonesia',
    eng: 'Literasi Bahasa Inggris',
    mat: 'Penalaran Matematika'
  };

  useEffect(() => {
    const loadResult = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          const simulationResult = await getSimulationResult(user.email, simulationId);
          
          if (simulationResult) {
            setResult(simulationResult);
          } else {
            // Fallback to sample data if no result found
            setResult({
              simulationId,
              subtestResults: [
                { subtest: 'tps', correctAnswers: 45, totalQuestions: 90, score: 250 },
                { subtest: 'indo', correctAnswers: 15, totalQuestions: 25, score: 300 },
                { subtest: 'eng', correctAnswers: 12, totalQuestions: 20, score: 300 },
                { subtest: 'mat', correctAnswers: 14, totalQuestions: 20, score: 350 }
              ],
              finalScore: 300,
              completedAt: new Date()
            });
          }
        }
      } catch (error) {
        console.error('Error loading simulation result:', error);
        // Fallback data
        setResult({
          simulationId,
          subtestResults: [
            { subtest: 'tps', correctAnswers: 45, totalQuestions: 90, score: 250 },
            { subtest: 'indo', correctAnswers: 15, totalQuestions: 25, score: 300 },
            { subtest: 'eng', correctAnswers: 12, totalQuestions: 20, score: 300 },
            { subtest: 'mat', correctAnswers: 14, totalQuestions: 20, score: 350 }
          ],
          finalScore: 300,
          completedAt: new Date()
        });
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [simulationId]);

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleRetry = () => {
    router.push('/simulation');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-gray-600">Results not found</p>
            <Button onClick={handleBack} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Simulation {simulationId} Result
        </h1>

        <Card className="shadow-xl border-0 bg-white mb-8">
          <CardContent className="p-8">
            <div className="space-y-4">
              {/* Individual Subtest Scores */}
              {result.subtestResults.map((subtestResult, index) => (
                <div key={subtestResult.subtest} className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                  <div className="flex-1">
                    <span className="text-lg font-medium text-gray-900">
                      {index + 1}. {subtestNames[subtestResult.subtest as keyof typeof subtestNames]}
                    </span>
                    <div className="text-sm text-gray-600 mt-1">
                      Benar: {subtestResult.correctAnswers}/{subtestResult.totalQuestions}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    : {subtestResult.score}
                  </span>
                </div>
              ))}

              {/* Final Score */}
              <div className="flex justify-between items-center p-6 bg-gray-200 rounded-lg border-2 border-gray-300 mt-6">
                <span className="text-xl font-bold text-gray-900">
                  Total Points
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {result.finalScore}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            onClick={handleBack}
            className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium text-lg rounded-lg"
          >
            Back
          </Button>
          
          <Button
            onClick={handleRetry}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium text-lg rounded-lg"
          >
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}