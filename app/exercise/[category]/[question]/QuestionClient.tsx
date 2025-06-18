'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { getQuestion, saveUserExerciseAnswer, getUserExerciseAnswers } from '@/lib/firestore';

interface QuestionClientProps {
  category: string;
  currentQuestion: number;
  totalQuestions: number;
  categoryTitle: string;
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

interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timestamp: Date;
}

export default function QuestionClient({ 
  category, 
  currentQuestion, 
  totalQuestions, 
  categoryTitle 
}: QuestionClientProps) {
  const router = useRouter();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userAnswers, setUserAnswers] = useState<Map<number, UserAnswer>>(new Map());

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
        setError('');
        
        console.log(`Loading question ${currentQuestion} from category ${category}`);
        
        // Load question and user's previous answers in parallel
        const [questionData, previousAnswers] = await Promise.all([
          getQuestion(category, currentQuestion),
          getUserExerciseAnswers(userEmail, category)
        ]);
        
        if (!questionData) {
          setError(`Question ${currentQuestion} not found. Please check if the question exists in Firebase.`);
          return;
        }
        
        // Validate question structure
        if (!questionData.question || !questionData.options) {
          setError('Invalid question data structure');
          return;
        }
        
        // Validate options structure
        const { A, B, C, D, E } = questionData.options;
        if (!A || !B || !C || !D || !E) {
          setError('Invalid options structure - missing one or more options (A, B, C, D, E)');
          return;
        }
        
        console.log('Question loaded successfully:', questionData);
        setQuestion(questionData);
        
        // Process user's previous answers
        const answersMap = new Map<number, UserAnswer>();
        previousAnswers.forEach(answer => {
          answersMap.set(parseInt(answer.questionId), answer);
        });
        setUserAnswers(answersMap);
        
        // Set selected answer if user has already answered this question
        const existingAnswer = answersMap.get(currentQuestion);
        if (existingAnswer) {
          setSelectedAnswer(existingAnswer.selectedAnswer);
          console.log(`Found existing answer for question ${currentQuestion}: ${existingAnswer.selectedAnswer}`);
        } else {
          setSelectedAnswer('');
          console.log(`No existing answer found for question ${currentQuestion}`);
        }
        
      } catch (error) {
        console.error('Error loading question and answers:', error);
        setError('Failed to load question. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadQuestionAndAnswers();
  }, [category, currentQuestion, userEmail]);

  const handlePrevious = async () => {
    // Save answer if selected
    if (selectedAnswer && userEmail) {
      try {
        await saveUserExerciseAnswer(userEmail, category, currentQuestion, selectedAnswer);
        // Update local answers map
        const newAnswers = new Map(userAnswers);
        newAnswers.set(currentQuestion, {
          questionId: currentQuestion.toString(),
          selectedAnswer,
          isCorrect: false, // This will be determined by the server
          timestamp: new Date()
        });
        setUserAnswers(newAnswers);
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }

    if (currentQuestion > 1) {
      router.push(`/exercise/${category}/${currentQuestion - 1}`);
    }
  };

  const handleNext = async () => {
    // Save answer if selected
    if (selectedAnswer && userEmail) {
      try {
        await saveUserExerciseAnswer(userEmail, category, currentQuestion, selectedAnswer);
        // Update local answers map
        const newAnswers = new Map(userAnswers);
        newAnswers.set(currentQuestion, {
          questionId: currentQuestion.toString(),
          selectedAnswer,
          isCorrect: false, // This will be determined by the server
          timestamp: new Date()
        });
        setUserAnswers(newAnswers);
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }

    if (currentQuestion < totalQuestions) {
      router.push(`/exercise/${category}/${currentQuestion + 1}`);
    }
  };

  const handleViewProgress = async () => {
    // Save answer if selected
    if (selectedAnswer && userEmail) {
      try {
        await saveUserExerciseAnswer(userEmail, category, currentQuestion, selectedAnswer);
        // Update local answers map
        const newAnswers = new Map(userAnswers);
        newAnswers.set(currentQuestion, {
          questionId: currentQuestion.toString(),
          selectedAnswer,
          isCorrect: false, // This will be determined by the server
          timestamp: new Date()
        });
        setUserAnswers(newAnswers);
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }
    
    router.push(`/exercise/${category}`);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading question...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
          <p className="text-red-600 font-medium mb-2">Error Loading Question</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
        <div className="space-y-2">
          <p className="text-gray-600 text-sm">Please check:</p>
          <ul className="text-gray-500 text-sm space-y-1">
            <li>• Document ID "{currentQuestion}" exists in collection "qextps"</li>
            <li>• Question has proper structure with "question" and "options" fields</li>
            <li>• Options contain all 5 choices: A, B, C, D, E</li>
          </ul>
        </div>
        <Button 
          onClick={() => router.push(`/exercise/${category}`)}
          className="mt-4"
          variant="outline"
        >
          Back to Question List
        </Button>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Question not found</p>
        <Button 
          onClick={() => router.push(`/exercise/${category}`)}
          className="mt-4"
          variant="outline"
        >
          Back to Question List
        </Button>
      </div>
    );
  }

  return (
    <>
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
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedAnswer === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
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
          disabled={currentQuestion === 1}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <Button
          onClick={handleViewProgress}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600"
        >
          <BarChart3 className="w-4 h-4" />
          <span>View Progress</span>
        </Button>

        <Button
          onClick={handleNext}
          disabled={currentQuestion === totalQuestions}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Question Counter */}
      <div className="text-center mt-4">
        <span className="text-gray-600">
          Soal {currentQuestion} dari {totalQuestions}
        </span>
      </div>
    </>
  );
}