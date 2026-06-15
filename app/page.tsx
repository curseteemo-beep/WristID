'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import JewelryModal from '@/components/JewelryModal';
import type { JewelryUserInfo } from '@/lib/prompts';

// Dynamic import — camera uses browser APIs
const Camera = dynamic(() => import('@/components/Camera'), { ssr: false });

type AppState = 'camera' | 'jewelry_modal' | 'analyzing';

export default function Home() {
  const router = useRouter();
  const [state, setState] = useState<AppState>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = useCallback(async (base64: string) => {
    setCapturedImage(base64);
    setState('analyzing');
    setError(null);

    try {
      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error del servidor' }));
        throw new Error(err.error || `Error ${res.status}`);
      }

      const data = await res.json();

      // Jewelry that needs more info → show modal
      if (data.jewelry_needs_info) {
        setState('jewelry_modal');
        return;
      }

      // Store result in sessionStorage and navigate
      sessionStorage.setItem('wristid_result', JSON.stringify(data));
      sessionStorage.setItem('wristid_image', base64);
      router.push('/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setState('camera');
    }
  }, [router]);

  const handleJewelrySubmit = useCallback(async (info: JewelryUserInfo) => {
    if (!capturedImage) return;
    setState('analyzing');

    try {
      const res = await fetch('/api/jewelry-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: capturedImage, jewelryInfo: info }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error del servidor' }));
        throw new Error(err.error || `Error ${res.status}`);
      }

      const data = await res.json();
      sessionStorage.setItem('wristid_result', JSON.stringify(data));
      sessionStorage.setItem('wristid_image', capturedImage);
      router.push('/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setState('camera');
    }
  }, [capturedImage, router]);

  return (
    <main className="h-screen w-full flex flex-col bg-luxury-black overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-safe py-4 border-b border-luxury-border flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Wrist<span className="text-gold-shimmer">ID</span>
          </h1>
          <p className="text-luxury-muted text-[11px] tracking-widest uppercase">
            Luxury Identifier
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-luxury-muted text-xs">IA activa</span>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 flex-shrink-0">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-400 text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">✕</button>
        </div>
      )}

      {/* Camera area */}
      <div className="flex-1 relative overflow-hidden">
        <Camera
          onCapture={handleCapture}
          isAnalyzing={state === 'analyzing'}
        />
      </div>

      {/* Bottom hint */}
      {state === 'camera' && (
        <div className="flex-shrink-0 text-center pb-safe py-3 pointer-events-none">
          <p className="text-luxury-muted text-xs tracking-wider">
            Apunta a un reloj o joya y pulsa ⬤
          </p>
        </div>
      )}

      {/* Jewelry info modal */}
      {state === 'jewelry_modal' && (
        <JewelryModal
          onSubmit={handleJewelrySubmit}
          onCancel={() => setState('camera')}
        />
      )}
    </main>
  );
}
