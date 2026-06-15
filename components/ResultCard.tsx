'use client';

import { useState } from 'react';

export interface IdentificationResult {
  type: 'watch' | 'jewelry' | 'unknown';
  confidence: number;
  brand?: string;
  model?: string;
  reference?: string;
  year?: string;
  condition?: string;
  description?: string;
  materials?: {
    case?: string;
    bracelet?: string;
    crystal?: string;
    dial?: string;
    metal?: string;
    stones?: string;
    stoneQuality?: string;
    setting?: string;
  };
  complications?: string[];
  pricing?: {
    retail?: number;
    market?: number;
    low?: number;
    high?: number;
    materialValue?: number;
    currency?: string;
  };
  comparisons?: Array<{
    category: string;
    equivalent: string;
    price: number;
  }>;
  fun_fact?: string;
  care_tips?: string[];
  error?: string;
}

interface ResultCardProps {
  result: IdentificationResult;
  imageUrl: string;
  onBack: () => void;
}

const CONDITION_LABELS: Record<string, { label: string; color: string }> = {
  new:       { label: 'Nuevo',       color: 'text-emerald-400' },
  excellent: { label: 'Excelente',   color: 'text-green-400'   },
  good:      { label: 'Bueno',       color: 'text-blue-400'    },
  fair:      { label: 'Regular',     color: 'text-yellow-400'  },
  poor:      { label: 'Deteriorado', color: 'text-red-400'     },
};

const COMPARISON_ICONS: Record<string, string> = {
  car:         '🚗',
  real_estate: '🏠',
  experience:  '✈️',
};

const formatUSD = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function ResultCard({ result, imageUrl, onBack }: ResultCardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'value'>('overview');

  if (result.type === 'unknown' || result.error) {
    return (
      <div className="min-h-screen bg-luxury-black flex flex-col items-center justify-center px-6 gap-6">
        <div className="w-20 h-20 rounded-full bg-luxury-card border border-red-500/30 flex items-center justify-center">
          <span className="text-4xl">🔍</span>
        </div>
        <h2 className="text-xl font-bold text-center">No se pudo identificar</h2>
        <p className="text-luxury-muted text-sm text-center max-w-xs">
          {result.error || 'La imagen no es suficientemente clara. Intenta con mejor iluminación y ángulo.'}
        </p>
        <button onClick={onBack} className="btn-gold px-8 py-3 text-sm">
          Intentar de nuevo
        </button>
      </div>
    );
  }

  const cond = result.condition ? CONDITION_LABELS[result.condition] : null;
  const marketPrice = result.pricing?.market ?? 0;

  const confidenceOffset = 251.2 - (251.2 * (result.confidence / 100));

  return (
    <div className="min-h-screen bg-luxury-black pb-safe">
      {/* Hero image */}
      <div className="relative w-full h-56 sm:h-72 overflow-hidden">
        <img src={imageUrl} alt="Item identificado" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Confidence ring */}
        <div className="absolute top-4 right-4 w-14 h-14">
          <svg viewBox="0 0 90 90" className="w-full h-full -rotate-90">
            <circle cx="45" cy="45" r="40" fill="none" stroke="#2A2A2A" strokeWidth="6" />
            <circle
              cx="45" cy="45" r="40"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="6"
              strokeDasharray="251.2"
              strokeDashoffset={confidenceOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gold-400">{result.confidence}%</span>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-4 left-4 right-16">
          <p className="text-gold-400 text-xs font-semibold uppercase tracking-widest mb-1">
            {result.type === 'watch' ? '⌚ Reloj' : '💎 Joya'} identificado
          </p>
          <h1 className="text-2xl font-bold leading-tight">
            {result.brand || 'Desconocido'}
          </h1>
          {result.model && (
            <p className="text-luxury-muted text-sm mt-0.5">{result.model}</p>
          )}
        </div>
      </div>

      {/* Quick stats row */}
      <div className="flex border-b border-luxury-border">
        {marketPrice > 0 && (
          <div className="flex-1 px-4 py-3 border-r border-luxury-border">
            <p className="text-luxury-muted text-xs uppercase tracking-wider">Mercado</p>
            <p className="text-gold-400 font-bold text-lg">{formatUSD(marketPrice)}</p>
          </div>
        )}
        {result.year && (
          <div className="flex-1 px-4 py-3 border-r border-luxury-border">
            <p className="text-luxury-muted text-xs uppercase tracking-wider">Año</p>
            <p className="font-bold">{result.year}</p>
          </div>
        )}
        {cond && (
          <div className="flex-1 px-4 py-3">
            <p className="text-luxury-muted text-xs uppercase tracking-wider">Estado</p>
            <p className={`font-bold ${cond.color}`}>{cond.label}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-luxury-border">
        {(['overview', 'details', 'value'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? 'text-gold-400 border-b-2 border-gold-400'
                : 'text-luxury-muted'
            }`}
          >
            {tab === 'overview' ? 'Resumen' : tab === 'details' ? 'Detalles' : 'Valor'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 py-5 space-y-4">
        {activeTab === 'overview' && (
          <>
            {/* Description */}
            {result.description && (
              <div className="luxury-card p-4">
                <p className="text-sm text-white/80 leading-relaxed">{result.description}</p>
              </div>
            )}

            {/* Reference & year chips */}
            <div className="flex flex-wrap gap-2">
              {result.reference && <span className="tag-chip">Ref: {result.reference}</span>}
              {result.year && <span className="tag-chip">{result.year}</span>}
              {result.complications?.map(c => (
                <span key={c} className="tag-chip">{c}</span>
              ))}
            </div>

            {/* Fun fact */}
            {result.fun_fact && (
              <div className="luxury-card p-4 border-l-2 border-gold-400">
                <p className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-1">
                  ✦ Dato curioso
                </p>
                <p className="text-sm text-white/70 leading-relaxed">{result.fun_fact}</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'details' && (
          <>
            {/* Materials */}
            {result.materials && (
              <div className="luxury-card p-4 space-y-3">
                <h3 className="text-xs font-semibold text-luxury-muted uppercase tracking-wider">Materiales</h3>
                {Object.entries(result.materials).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-start">
                    <span className="text-luxury-muted text-sm capitalize">
                      {k === 'case' ? 'Caja' : k === 'bracelet' ? 'Brazalete' :
                       k === 'crystal' ? 'Cristal' : k === 'dial' ? 'Esfera' :
                       k === 'metal' ? 'Metal' : k === 'stones' ? 'Piedras' :
                       k === 'stoneQuality' ? 'Calidad' : k === 'setting' ? 'Engaste' : k}
                    </span>
                    <span className="text-white text-sm text-right max-w-[55%]">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Care tips (jewelry) */}
            {result.care_tips && result.care_tips.length > 0 && (
              <div className="luxury-card p-4 space-y-2">
                <h3 className="text-xs font-semibold text-luxury-muted uppercase tracking-wider mb-3">
                  Consejos de cuidado
                </h3>
                {result.care_tips.map((tip, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-gold-400 mt-0.5">•</span>
                    <p className="text-sm text-white/70">{tip}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'value' && (
          <>
            {/* Pricing breakdown */}
            {result.pricing && (
              <div className="luxury-card p-4 space-y-3 gold-glow">
                <h3 className="text-xs font-semibold text-luxury-muted uppercase tracking-wider">
                  Análisis de precio (USD)
                </h3>
                {result.pricing.materialValue !== undefined && result.pricing.materialValue > 0 && (
                  <div className="flex justify-between">
                    <span className="text-luxury-muted text-sm">Valor material</span>
                    <span className="font-semibold">{formatUSD(result.pricing.materialValue)}</span>
                  </div>
                )}
                {result.pricing.retail !== undefined && result.pricing.retail > 0 && (
                  <div className="flex justify-between">
                    <span className="text-luxury-muted text-sm">Precio boutique</span>
                    <span className="font-semibold">{formatUSD(result.pricing.retail)}</span>
                  </div>
                )}
                <div className="border-t border-luxury-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">Precio de mercado</span>
                    <span className="text-gold-400 text-xl font-bold">
                      {formatUSD(result.pricing.market ?? 0)}
                    </span>
                  </div>
                  {result.pricing.low !== undefined && result.pricing.high !== undefined && (
                    <div className="flex justify-between mt-1">
                      <span className="text-luxury-muted text-xs">
                        Rango: {formatUSD(result.pricing.low)} — {formatUSD(result.pricing.high)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Comparisons */}
            {result.comparisons && result.comparisons.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-luxury-muted uppercase tracking-wider px-1">
                  Equivale a...
                </h3>
                {result.comparisons.map((c, i) => (
                  <div key={i} className="luxury-card p-4 flex items-center gap-4">
                    <div className="text-3xl flex-shrink-0">
                      {COMPARISON_ICONS[c.category] ?? '💡'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium leading-snug">{c.equivalent}</p>
                      <p className="text-gold-400 text-xs mt-0.5 font-semibold">
                        {c.price > 0 ? formatUSD(c.price) : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA */}
      <div className="px-4 pb-8 pt-2">
        <button onClick={onBack} className="w-full btn-gold py-4 text-sm">
          Identificar otro
        </button>
      </div>
    </div>
  );
}
