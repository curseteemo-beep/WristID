'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ResultCard, { type IdentificationResult } from '@/components/ResultCard';

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [image, setImage] = useState<string>('');

  useEffect(() => {
    const raw = sessionStorage.getItem('wristid_result');
    const img = sessionStorage.getItem('wristid_image');

    if (!raw || !img) {
      router.replace('/');
      return;
    }

    try {
      setResult(JSON.parse(raw));
      setImage(img);
    } catch {
      router.replace('/');
    }
  }, [router]);

  const handleBack = () => {
    sessionStorage.removeItem('wristid_result');
    sessionStorage.removeItem('wristid_image');
    router.push('/');
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <ResultCard result={result} imageUrl={image} onBack={handleBack} />;
}
