'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface CameraProps {
  onCapture: (base64: string) => void;
  isAnalyzing: boolean;
}

export default function Camera({ onCapture, isAnalyzing }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [flash, setFlash] = useState(false);

  const startCamera = useCallback(async (mode: 'environment' | 'user' = 'environment') => {
    // Stop existing stream
    streamRef.current?.getTracks().forEach(t => t.stop());

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setCameraError(null);
    } catch {
      setCameraError('No se pudo acceder a la cámara. Usa el botón de galería.');
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [facingMode, startCamera]);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    // Compress to ~800px wide, 0.85 quality
    const scale = Math.min(1, 800 / canvas.width);
    const compressed = document.createElement('canvas');
    compressed.width = canvas.width * scale;
    compressed.height = canvas.height * scale;
    const cctx = compressed.getContext('2d')!;
    cctx.drawImage(canvas, 0, 0, compressed.width, compressed.height);

    const base64 = compressed.toDataURL('image/jpeg', 0.85);
    onCapture(base64);
  }, [onCapture]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 800 / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        onCapture(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [onCapture]);

  const flipCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Flash overlay */}
      {flash && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none" />
      )}

      {/* Video feed */}
      {cameraActive && !cameraError ? (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Viewfinder overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-72 h-72">
              {/* Corner brackets */}
              <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold-400" />
              <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold-400" />
              <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold-400" />
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold-400" />

              {/* Scan line — only visible when not analyzing */}
              {!isAnalyzing && (
                <div className="absolute inset-x-0 overflow-hidden h-full">
                  <div className="scan-line" />
                </div>
              )}
            </div>
          </div>

          {/* Analyzing overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4 z-10">
              <div className="w-16 h-16 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-gold-400 font-semibold text-lg tracking-widest uppercase">
                Analizando...
              </p>
              <p className="text-luxury-muted text-sm">IA procesando la imagen</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center px-8">
          <div className="w-20 h-20 rounded-full bg-luxury-card border border-luxury-border flex items-center justify-center">
            <svg className="w-10 h-10 text-luxury-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          {cameraError && (
            <p className="text-red-400 text-sm">{cameraError}</p>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-gold px-8 py-3 text-sm"
          >
            Abrir Galería
          </button>
        </div>
      )}

      {/* Bottom controls */}
      {cameraActive && !isAnalyzing && (
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8 px-8">
          {/* Gallery */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-full bg-luxury-card border border-luxury-border flex items-center justify-center"
            aria-label="Abrir galería"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Shutter */}
          <button
            onClick={capture}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #F5E07A 50%, #B8960C 100%)',
              boxShadow: '0 0 0 4px rgba(212, 175, 55, 0.3)',
            }}
            aria-label="Capturar foto"
          >
            <div className="w-14 h-14 rounded-full bg-white/20" />
          </button>

          {/* Flip camera */}
          <button
            onClick={flipCamera}
            className="w-12 h-12 rounded-full bg-luxury-card border border-luxury-border flex items-center justify-center"
            aria-label="Cambiar cámara"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}
