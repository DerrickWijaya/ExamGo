'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Play, BarChart3 } from 'lucide-react';
import { getUserSimulationAnswers } from '@/lib/firestore';

interface SimulationListClientProps {
  simulationId: number;
  subtest: 'tps' | 'indo' | 'eng' | 'mat';
  totalQuestions: number;
}

interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timestamp: Date;
}

export default function SimulationListClient({ 
  simulationId, 
  subtest, 
  totalQuestions 
}: SimulationListClientProps) {
  const router = useRouter();
  const [userAnswers, setUserAnswers] = useState<Map<number, UserAnswer>>(new Map());
  const [loading, setLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  const subtestNames = {
    tps: 'Tes Potensi Skolastik',
    indo: 'Literasi Bahasa Indonesia',
    eng: 'Literasi Bahasa Inggris',
    mat: 'Penalaran Matematika'
  };

  useEffect(() => {
    const loadUserAnswers = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          const answers = await getUserSimulationAnswers(user.email, simulationId, subtest);
          
          const answersMap = new Map<number, UserAnswer>();
          answers.forEach(answer => {
            answersMap.set(parseInt(answer.questionId), answer);
          });
          
          setUserAnswers(answersMap);
          
          // Check if simulation has started (has timer in localStorage)
          const storageKey = `simulation_${simulationId}_${subtest}_timer`;
          const storedStartTime = localStorage.getItem(storageKey);
          setHasStarted(!!storedStartTime || answers.length > 0);
        }
      } catch (error) {
        console.error('Error loading user answers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserAnswers();
  }, [simulationId, subtest]);

  const handleQuestionClick = (questionNumber: number) => {
    router.push(`/simulation/${simulationId}/${subtest}/${questionNumber}`);
  };

  const handleStartSimulation = () => {
    // Start from question 1
    router.push(`/simulation/${simulationId}/${subtest}/1`);
  };

  const handleViewProgress = () => {
    // Navigate back to main simulation page
    router.push('/simulation');
  };

  const getQuestionStatus = (questionNumber: number) => {
    const answer = userAnswers.get(questionNumber);
    // For simulation: only show answered/unanswered (anonymous)
    return answer ? 'answered' : 'unanswered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-blue-500'; // Blue for answered (anonymous)
      default:
        return 'bg-gray-400'; // Gray for unanswered
    }
  };

  const getProgressStats = () => {
    const answered = userAnswers.size;
    return { answered, total: totalQuestions };
  };

  const questions = Array.from({ length: totalQuestions }, (_, i) => i + 1);
  const stats = getProgressStats();

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading progress...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Summary - Anonymous for simulation */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Progress Overview</h2>
            <div className="flex items-center space-x-2 text-blue-600">
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">
                {stats.answered}/{stats.total} Dijawab
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.answered}</div>
              <div className="text-sm text-gray-600">Sudah Dijawab</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.total - stats.answered}</div>
              <div className="text-sm text-gray-600">Belum Dijawab</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${(stats.answered / stats.total) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-center text-sm text-gray-600">
            <span>Progress: {Math.round((stats.answered / stats.total) * 100)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handleViewProgress}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <BarChart3 className="w-4 h-4" />
          <span>View All Simulations</span>
        </Button>

        {!hasStarted ? (
          <Button
            onClick={handleStartSimulation}
            className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3"
          >
            <Play className="w-4 h-4" />
            <span>Mulai Simulasi</span>
          </Button>
        ) : (
          <Button
            onClick={handleStartSimulation}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3"
          >
            <Clock className="w-4 h-4" />
            <span>Lanjutkan Simulasi</span>
          </Button>
        )}
      </div>

      {/* Warning for timed simulation */}
      {!hasStarted && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">Perhatian: Simulasi Berdasarkan Waktu</h3>
              <p className="text-yellow-700 text-sm">
                Setelah memulai, timer akan berjalan otomatis. Pastikan Anda siap sebelum memulai simulasi ini.
                Anda dapat melihat dan mengerjakan soal secara acak, namun waktu akan terus berjalan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Question Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {questions.map((questionNumber) => {
          const status = getQuestionStatus(questionNumber);
          
          return (
            <Card
              key={questionNumber}
              className="cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg border-0 bg-white"
              onClick={() => handleQuestionClick(questionNumber)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">
                    Soal {questionNumber}
                  </span>
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(status)}`}></div>
                </div>
                {/* Don't show selected answer for simulation (anonymous) */}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend - Updated for anonymous simulation */}
      <Card className="shadow-lg border-0 bg-gray-50">
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-3">Keterangan Status:</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-700">Sudah Dijawab</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-gray-700">Belum Dijawab</span>
            </div>
          </div>
          <div className="mt-3 p-2 bg-blue-100 rounded border border-blue-300">
            <p className="text-blue-800 text-xs font-medium">
              ℹ️ Simulasi bersifat anonim - status benar/salah tidak ditampilkan
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}