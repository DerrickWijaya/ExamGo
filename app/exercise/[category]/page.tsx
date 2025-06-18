import { Suspense } from 'react';
import Header from '@/components/ui/header';
import ExerciseListClient from './ExerciseListClient';

// Generate static params for the 4 categories
export async function generateStaticParams() {
  return [
    { category: 'tes-potensi-skolastik' },
    { category: 'literasi-bahasa-indonesia' },
    { category: 'literasi-bahasa-inggris' },
    { category: 'penalaran-matematika' }
  ];
}

// Get category title based on category ID (Server-side function)
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

// Determine total questions based on category (Server-side function)
function getTotalQuestions(category: string) {
  return category === 'tes-potensi-skolastik' ? 60 : 30;
}

export default function ExerciseListPage({ params }: { params: { category: string } }) {
  const categoryTitle = getCategoryTitle(params.category);
  const totalQuestions = getTotalQuestions(params.category);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {categoryTitle}
        </h1>

        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <ExerciseListClient 
            category={params.category}
            totalQuestions={totalQuestions}
          />
        </Suspense>
      </div>
    </div>
  );
}