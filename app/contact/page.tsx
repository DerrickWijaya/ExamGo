'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Butuh Bantuan?
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Tim support kami siap membantu Anda
          </p>
        </CardHeader>
        
        <CardContent className="p-8 pt-0 space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Mail className="h-6 w-6 text-red-500" />
            <div>
              <p className="font-medium text-gray-900">Email Support</p>
              <p className="text-sm text-gray-600">examgo@gmail.com</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Phone className="h-6 w-6 text-red-500" />
            <div>
              <p className="font-medium text-gray-900">Telepon</p>
              <p className="text-sm text-gray-600">+62 123 456 7890</p>
            </div>
          </div>

          <div className="pt-4">
            <Link href="/">
              <Button variant="outline" className="w-full">
                Kembali ke Halaman Utama
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}