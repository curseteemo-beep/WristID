'use client';

import { useState } from 'react';
import type { JewelryUserInfo } from '@/lib/prompts';

const JEWELRY_TYPES = ['Anillo', 'Collar', 'Pulsera', 'Pendientes', 'Broche', 'Otro'];
const METALS = ['Oro', 'Oro blanco', 'Platino', 'Plata', 'Titanio', 'Acero', 'Otro'];
const METAL_PURITY = ['24k (999)', '22k (916)', '18k (750)', '14k (585)', '9k (375)', '950 Platino', '925 Plata'];
const STONES = ['Sin piedras', 'Diamantes', 'Rubíes', 'Esmeraldas', 'Zafiros', 'Perlas', 'Otras'];
const QUALITY = ['Excelente (D-F / VVS)', 'Muy buena (G-H / VS)', 'Buena (I-J / SI)', 'Comercial', 'Desconocida'];

interface JewelryModalProps {
  onSubmit: (info: JewelryUserInfo) => void;
  onCancel: () => void;
}

export default function JewelryModal({ onSubmit, onCancel }: JewelryModalProps) {
  const [form, setForm] = useState<JewelryUserInfo>({
    jewelryType: '',
    metal: '',
    metalPurity: '',
    stones: '',
    stoneQuality: '',
    stoneCount: '',
    weight: '',
    brand: '',
    dimensions: '',
  });

  const set = (key: keyof JewelryUserInfo, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const canSubmit = form.jewelryType && form.metal;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="luxury-card w-full max-w-lg mx-0 sm:mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-luxury-border">
          <div className="w-10 h-1 bg-luxury-border rounded-full mx-auto mb-4 sm:hidden" />
          <h2 className="text-xl font-bold text-center">
            <span className="text-gold-shimmer">Información adicional</span>
          </h2>
          <p className="text-luxury-muted text-sm text-center mt-1">
            Necesito más detalles para una tasación precisa
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Jewelry type */}
          <div>
            <label className="block text-xs font-semibold text-luxury-muted uppercase tracking-wider mb-2">
              Tipo de joya *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {JEWELRY_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => set('jewelryType', t)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                    form.jewelryType === t
                      ? 'bg-gold-400 text-luxury-black border-gold-400'
                      : 'border-luxury-border text-white hover:border-gold-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Metal */}
          <div>
            <label className="block text-xs font-semibold text-luxury-muted uppercase tracking-wider mb-2">
              Metal principal *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {METALS.map(m => (
                <button
                  key={m}
                  onClick={() => set('metal', m)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                    form.metal === m
                      ? 'bg-gold-400 text-luxury-black border-gold-400'
                      : 'border-luxury-border text-white hover:border-gold-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Purity */}
          <div>
            <label className="block text-xs font-semibold text-luxury-muted uppercase tracking-wider mb-2">
              Pureza / Ley
            </label>
            <div className="grid grid-cols-3 gap-2">
              {METAL_PURITY.map(p => (
                <button
                  key={p}
                  onClick={() => set('metalPurity', p)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all ${
                    form.metalPurity === p
                      ? 'bg-gold-400/20 text-gold-400 border-gold-400'
                      : 'border-luxury-border text-luxury-muted hover:border-gold-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Stones */}
          <div>
            <label className="block text-xs font-semibold text-luxury-muted uppercase tracking-wider mb-2">
              Piedras
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STONES.map(s => (
                <button
                  key={s}
                  onClick={() => set('stones', s)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                    form.stones === s
                      ? 'bg-gold-400/20 text-gold-400 border-gold-400'
                      : 'border-luxury-border text-white hover:border-gold-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Stone quality — only if stones selected */}
          {form.stones && form.stones !== 'Sin piedras' && (
            <div>
              <label className="block text-xs font-semibold text-luxury-muted uppercase tracking-wider mb-2">
                Calidad de piedras
              </label>
              <div className="space-y-2">
                {QUALITY.map(q => (
                  <button
                    key={q}
                    onClick={() => set('stoneQuality', q)}
                    className={`w-full py-2 px-4 rounded-xl text-sm text-left font-medium border transition-all ${
                      form.stoneQuality === q
                        ? 'bg-gold-400/20 text-gold-400 border-gold-400'
                        : 'border-luxury-border text-white hover:border-gold-400'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Optional text inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-luxury-muted uppercase tracking-wider mb-1">
                Peso (gramos)
              </label>
              <input
                type="number"
                placeholder="ej: 12.5"
                value={form.weight}
                onChange={e => set('weight', e.target.value)}
                className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-3 py-2 text-sm text-white placeholder-luxury-muted focus:border-gold-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-luxury-muted uppercase tracking-wider mb-1">
                Marca / Casa
              </label>
              <input
                type="text"
                placeholder="ej: Cartier"
                value={form.brand}
                onChange={e => set('brand', e.target.value)}
                className="w-full bg-luxury-dark border border-luxury-border rounded-xl px-3 py-2 text-sm text-white placeholder-luxury-muted focus:border-gold-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-luxury-border flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-luxury-border text-luxury-muted text-sm font-semibold hover:border-white hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => canSubmit && onSubmit(form)}
            disabled={!canSubmit}
            className={`flex-1 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all ${
              canSubmit
                ? 'btn-gold'
                : 'bg-luxury-border text-luxury-muted cursor-not-allowed'
            }`}
          >
            Tasar Ahora
          </button>
        </div>
      </div>
    </div>
  );
}
