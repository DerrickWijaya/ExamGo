import { Suspense } from 'react';
import Header from '@/components/ui/header';
import SimulationQuestionClient from './SimulationQuestionClient';

// Generate static params for simulation questions with correct subtest structure
export async function generateStaticParams() {
  const params = [];
  const subtests = ['tps', 'indo', 'eng', 'mat'];
  const questionCounts = {
    tps: 90,
    indo: 25,
    eng: 20,
    mat: 20
  };
  
  // Generate for 3 simulations
  for (let simId = 1; simId <= 3; simId++) {
    for (const subtest of subtests) {
      const maxQuestions = questionCounts[subtest as keyof typeof questionCounts];
      for (let questionNum = 1; questionNum <= maxQuestions; questionNum++) {
        params.push({
          id: simId.toString(),
          subtest: subtest,
          question: questionNum.toString()
        });
      }
    }
  }
  
  return params;
}

export default function SimulationQuestionPage({ 
  params 
}: { 
  params: { id: string; subtest: string; question: string } 
}) {
  const currentQuestion = parseInt(params.question);
  const simulationId = parseInt(params.id);
  const subtest = params.subtest as 'tps' | 'indo' | 'eng' | 'mat';
  
  // Define question counts and time limits for each subtest (in seconds)
  const subtestConfig = {
    tps: { totalQuestions: 90, timeLimit: 90 * 60 }, // 90 minutes
    indo: { totalQuestions: 25, timeLimit: 37.5 * 60 }, // 37.5 minutes
    eng: { totalQuestions: 20, timeLimit: 30 * 60 }, // 30 minutes
    mat: { totalQuestions: 20, timeLimit: 37.5 * 60 } // 37.5 minutes
  };

  const config = subtestConfig[subtest];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <SimulationQuestionClient 
            simulationId={simulationId}
            subtest={subtest}
            currentQuestion={currentQuestion}
            totalQuestions={config.totalQuestions}
            timeLimit={config.timeLimit}
          />
        </Suspense>
      </div>
    </div>
  );
}