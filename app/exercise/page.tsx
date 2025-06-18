'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, BookOpen, Calculator, Globe } from 'lucide-react';
import Header from '@/components/ui/header';

const exerciseCategories = [
  {
    id: 'tes-potensi-skolastik',
    title: 'Tes Potensi Skolastik',
    icon: Brain,
    color: 'from-pink-400 to-pink-600',
    items: [
      'Kemampuan Penalaran Umum',
      'Pengetahuan Kuantitatif',
      'Penalaran Deduktif',
      'Penalaran Kuantitatif',
      'Pengetahuan dan Pemahaman Umum',
      'Kemampuan Memahami Bacaan dan Menulis',
      'Pengetahuan Memahami Bacaan dan Menulis'
    ]
  },
  {
    id: 'literasi-bahasa-indonesia',
    title: 'Literasi Bahasa Indonesia',
    icon: BookOpen,
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'literasi-bahasa-inggris',
    title: 'Literasi Bahasa Inggris',
    icon: Globe,
    color: 'from-green-400 to-green-600'
  },
  {
    id: 'penalaran-matematika',
    title: 'Penalaran Matematika',
    icon: Calculator,
    color: 'from-purple-400 to-purple-600'
  }
];

export default function ExercisePage() {
  const router = useRouter();

  const handleCategoryClick = (categoryId: string, categoryTitle: string) => {
    router.push(`/exercise/${categoryId}?title=${encodeURIComponent(categoryTitle)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Pilih Kategori Soal
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {exerciseCategories.map((category) => {
            const IconComponent = category.icon;
            
            return (
              <Card
                key={category.id}
                className="cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-xl border-0 overflow-hidden bg-white"
                onClick={() => handleCategoryClick(category.id, category.title)}
              >
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {category.title}
                    </h2>
                  </div>

                  {category.items && (
                    <ul className="space-y-2 text-sm text-gray-700">
                      {category.items.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-gray-400 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}