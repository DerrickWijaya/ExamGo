'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { 
  getSimulationQuestion, 
  saveUserSimulationAnswer, 
  getUserSimulationAnswers,
  saveSimulationProgress,
  getSimulationProgress,
  calculateAndSaveSimulationResult
} from '@/lib/firestore';

interface SimulationQuestionClientProps {
  simulationId: number;
  subtest: 'tps' | 'indo' | 'eng' | 'mat';
  currentQuestion: number;
  totalQuestions: number;
  timeLimit: number;
}

interface Question {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
}

export default function SimulationQuestionClient({ 
  simulationId, 
  subtest,
  currentQuestion, 
  totalQuestions,
  timeLimit
}: SimulationQuestionClientProps) {
  const router = useRouter();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userAnswers, setUserAnswers] = useState<Map<number, string>>(new Map());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const subtestNames = {
    tps: 'Tes Potensi Skolastik',
    indo: 'Literasi Bahasa Indonesia',
    eng: 'Literasi Bahasa Inggris',
    mat: 'Penalaran Matematika'
  };

  const nextSubtest = {
    tps: 'indo',
    indo: 'eng',
    eng: 'mat',
    mat: null
  };

  useEffect(() => {
    // Get user email from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      setUserEmail(user.email);
    }
  }, []);

  useEffect(() => {
    const loadQuestionAndAnswers = async () => {
      if (!userEmail) return;
      
      try {
        setLoading(true);
        
        // Load question
        const questionData = await getSimulationQuestion(simulationId, subtest, currentQuestion);
        setQuestion(questionData);
        
        // Load user's previous answers for this subtest
        const previousAnswers = await getUserSimulationAnswers(userEmail, simulationId, subtest);
        const answersMap = new Map<number, string>();
        previousAnswers.forEach(answer => {
          answersMap.set(parseInt(answer.questionId), answer.selectedAnswer);
        });
        setUserAnswers(answersMap);
        
        // Set selected answer if user has already answered this question
        const existingAnswer = answersMap.get(currentQuestion);
        if (existingAnswer) {
          setSelectedAnswer(existingAnswer);
        } else {
          setSelectedAnswer('');
        }
        
        // Initialize timer for this subtest
        const storageKey = `simulation_${simulationId}_${subtest}_timer`;
        const storedStartTime = localStorage.getItem(storageKey);
        
        if (storedStartTime) {
          // Continue existing timer
          const startTime = parseInt(storedStartTime);
          const now = Date.now();
          const elapsed = Math.floor((now - startTime) / 1000);
          const remaining = Math.max(0, timeLimit - elapsed);
          
          setTimeLeft(remaining);
          startTimeRef.current = startTime;
          
          if (remaining <= 0) {
            setIsTimeUp(true);
            handleTimeUp();
            return;
          }
        } else {
          // Start new timer
          const now = Date.now();
          localStorage.setItem(storageKey, now.toString());
          setTimeLeft(timeLimit);
          startTimeRef.current = now;
        }
        
      } catch (error) {
        console.error('Error loading question and answers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestionAndAnswers();
  }, [simulationId, subtest, currentQuestion, userEmail, timeLimit]);

  useEffect(() => {
    if (isTimeUp || !startTimeRef.current) return;

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start countdown timer
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current!) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);
      
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        setIsTimeUp(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        handleTimeUp();
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTimeRef.current, timeLimit, isTimeUp]);

  const handleTimeUp = async () => {
    // Save current answer if selected
    if (selectedAnswer && userEmail) {
      try {
        await saveUserSimulationAnswer(userEmail, simulationId, subtest, currentQuestion, selectedAnswer);
      } catch (error) {
        console.error('Error saving answer on time up:', error);
      }
    }

    // Clear timer from localStorage
    const storageKey = `simulation_${simulationId}_${subtest}_timer`;
    localStorage.removeItem(storageKey);

    // Move to next subtest or show results
    const next = nextSubtest[subtest];
    if (next) {
      router.push(`/simulation/${simulationId}/${next}/1`);
    } else {
      // Last subtest completed, calculate results and go to result page
      try {
        await calculateAndSaveSimulationResult(userEmail, simulationId);
        router.push(`/simulation/${simulationId}/result`);
      } catch (error) {
        console.error('Error calculating results:', error);
        router.push(`/simulation/${simulationId}/result`);
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) {
      return '0:00';
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePrevious = async () => {
    // Save answer if selected
    if (selectedAnswer && userEmail && !isTimeUp) {
      try {
        await saveUserSimulationAnswer(userEmail, simulationId, subtest, currentQuestion, selectedAnswer);
        // Update local answers map
        const newAnswers = new Map(userAnswers);
        newAnswers.set(currentQuestion, selectedAnswer);
        setUserAnswers(newAnswers);
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }

    if (currentQuestion > 1 && !isTimeUp) {
      router.push(`/simulation/${simulationId}/${subtest}/${currentQuestion - 1}`);
    }
  };

  const handleNext = async () => {
    // Save answer if selected
    if (selectedAnswer && userEmail && !isTimeUp) {
      try {
        await saveUserSimulationAnswer(userEmail, simulationId, subtest, currentQuestion, selectedAnswer);
        // Update local answers map
        const newAnswers = new Map(userAnswers);
        newAnswers.set(currentQuestion, selectedAnswer);
        setUserAnswers(newAnswers);
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }

    if (currentQuestion < totalQuestions && !isTimeUp) {
      router.push(`/simulation/${simulationId}/${subtest}/${currentQuestion + 1}`);
    } else if (currentQuestion === totalQuestions && !isTimeUp) {
      // Last question of current subtest, move to next subtest or results
      const next = nextSubtest[subtest];
      if (next) {
        // Clear current subtest timer
        const storageKey = `simulation_${simulationId}_${subtest}_timer`;
        localStorage.removeItem(storageKey);
        router.push(`/simulation/${simulationId}/${next}/1`);
      } else {
        // Last subtest completed, calculate results and go to result page
        try {
          await calculateAndSaveSimulationResult(userEmail, simulationId);
          router.push(`/simulation/${simulationId}/result`);
        } catch (error) {
          console.error('Error calculating results:', error);
          router.push(`/simulation/${simulationId}/result`);
        }
      }
    }
  };

  const handleViewProgress = async () => {
    // Save answer if selected
    if (selectedAnswer && userEmail && !isTimeUp) {
      try {
        await saveUserSimulationAnswer(userEmail, simulationId, subtest, currentQuestion, selectedAnswer);
        // Update local answers map
        const newAnswers = new Map(userAnswers);
        newAnswers.set(currentQuestion, selectedAnswer);
        setUserAnswers(newAnswers);
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }
    
    router.push(`/simulation/${simulationId}/${subtest}`);
  };

  const handleAnswerSelect = (answer: string) => {
    if (!isTimeUp) {
      setSelectedAnswer(answer);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading question...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Question not found</p>
      </div>
    );
  }

  return (
    <>
      {/* Subtest Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Simulasi {simulationId} - {subtestNames[subtest]}
        </h1>
        <div className={`inline-block px-6 py-2 rounded-lg font-bold text-lg ${
          timeLeft <= 300 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
        }`}>
          Waktu tersisa: {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question Content */}
      <Card className="mb-8 shadow-xl border-0 bg-white">
        <CardContent className="p-8">
          <div className="mb-6">
            <p className="text-gray-800 leading-relaxed mb-6">
              {question.question}
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {Object.entries(question.options).map(([option, text]) => (
              <label
                key={option}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                  isTimeUp 
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    : selectedAnswer === option
                    ? 'border-blue-500 bg-blue-50 cursor-pointer'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  disabled={isTimeUp}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-medium text-gray-900">{option}.</span>
                <span className="text-gray-700">{text}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestion === 1 || isTimeUp}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <Button
          onClick={handleViewProgress}
          disabled={isTimeUp}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600"
        >
          <BarChart3 className="w-4 h-4" />
          <span>View Progress</span>
        </Button>

        <Button
          onClick={handleNext}
          disabled={isTimeUp}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <span>{currentQuestion === totalQuestions ? (nextSubtest[subtest] ? 'Next Subtest' : 'Finish') : 'Next'}</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Question Counter */}
      <div className="text-center mt-4">
        <span className="text-gray-600">
          Soal {currentQuestion} dari {totalQuestions}
        </span>
      </div>

      {/* Progress Indicator */}
      <div className="mt-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Time Up Overlay */}
      {isTimeUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-600 mb-4">
                Waktu Habis!
              </h2>
              <p className="text-gray-600 mb-4">
                Waktu untuk {subtestNames[subtest]} telah habis. 
                {nextSubtest[subtest] ? ' Melanjutkan ke subtest berikutnya...' : ' Menampilkan hasil...'}
              </p>
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}