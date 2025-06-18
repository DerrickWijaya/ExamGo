import { Suspense } from 'react';
import Header from '@/components/ui/header';
import QuestionClient from './QuestionClient';

// Generate static params for all category/question combinations
export async function generateStaticParams() {
  const categories = [
    'tes-potensi-skolastik',
    'literasi-bahasa-indonesia', 
    'literasi-bahasa-inggris',
    'penalaran-matematika'
  ];

  const params = [];
  
  for (const category of categories) {
    const totalQuestions = category === 'tes-potensi-skolastik' ? 60 : 30;
    
    for (let i = 1; i <= totalQuestions; i++) {
      params.push({
        category: category,
        question: i.toString()
      });
    }
  }
  
  return params;
}

// Server-side functions
function getTotalQuestions(category: string) {
  return category === 'tes-potensi-skolastik' ? 60 : 30;
}

function getCategoryTitle(category: string) {
  switch (category) {
    case 'tes-potensi-skolastik':
      return 'Tes Potensi Skolastik';
    case 'literasi-bahasa-indonesia':
      return 'Literasi Bahasa Indonesia';
    case 'literasi-bahasa-inggris':
      return 'Literasi Bahasa Inggris';
    case 'penalaran-matematika':
      return 'Penalaran Matematika';
    default:
      return 'Exercise';
  }
}

export default function QuestionPage({ 
  params 
}: { 
  params: { category: string; question: string } 
}) {
  const totalQuestions = getTotalQuestions(params.category);
  const categoryTitle = getCategoryTitle(params.category);
  const currentQuestion = parseInt(params.question);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <QuestionClient 
            category={params.category}
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            categoryTitle={categoryTitle}
          />
        </Suspense>
      </div>
    </div>
  );
}