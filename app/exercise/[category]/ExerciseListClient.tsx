'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import { getUserExerciseAnswers } from '@/lib/firestore';

interface ExerciseListClientProps {
  category: string;
  totalQuestions: number;
}

interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timestamp: Date;
}

export default function ExerciseListClient({ category, totalQuestions }: ExerciseListClientProps) {
  const router = useRouter();
  const [userAnswers, setUserAnswers] = useState<Map<number, UserAnswer>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserAnswers = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          const answers = await getUserExerciseAnswers(user.email, category);
          
          const answersMap = new Map<number, UserAnswer>();
          answers.forEach(answer => {
            answersMap.set(parseInt(answer.questionId), answer);
          });
          
          setUserAnswers(answersMap);
        }
      } catch (error) {
        console.error('Error loading user answers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserAnswers();
  }, [category]);

  const handleQuestionClick = (questionNumber: number) => {
    router.push(`/exercise/${category}/${questionNumber}`);
  };

  const handleViewProgress = () => {
    router.push('/exercise');
  };

  const getQuestionStatus = (questionNumber: number) => {
    const answer = userAnswers.get(questionNumber);
    if (!answer) return 'unanswered'; // Red - not answered
    return answer.isCorrect ? 'correct' : 'incorrect'; // Green - correct, Red - incorrect
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct':
        return 'bg-green-500';
      case 'incorrect':
        return 'bg-red-500';
      default:
        return 'bg-red-500'; // Default red for unanswered
    }
  };

  const getProgressStats = () => {
    const answered = userAnswers.size;
    const correct = Array.from(userAnswers.values()).filter(answer => answer.isCorrect).length;
    return { answered, correct, total: totalQuestions };
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
      {/* Progress Summary */}
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
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.answered}</div>
              <div className="text-sm text-gray-600">Dijawab</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
              <div className="text-sm text-gray-600">Benar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.answered - stats.correct}</div>
              <div className="text-sm text-gray-600">Salah</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${(stats.answered / stats.total) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress: {Math.round((stats.answered / stats.total) * 100)}%</span>
            <span>Akurasi: {stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleViewProgress}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Kembali ke Kategori</span>
        </Button>
      </div>

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
                {userAnswers.has(questionNumber) && (
                  <div className="mt-2 text-sm text-gray-600">
                    Jawaban: {userAnswers.get(questionNumber)?.selectedAnswer}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <Card className="shadow-lg border-0 bg-gray-50">
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-3">Keterangan Status:</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-700">Benar</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-700">Salah / Belum Dijawab</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}