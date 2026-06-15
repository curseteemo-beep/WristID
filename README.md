# WristID 💎

Identificador de relojes y joyas de lujo con IA. Saca una foto y conoce el precio, historia y comparativas en segundos.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **OpenAI GPT-4o** via API Routes
- **PWA** instalable en móvil (Android / iOS)
- **Vercel** — deploy gratis

## Setup local

```bash
# 1. Instala dependencias
npm install

# 2. Variables de entorno
cp .env.example .env.local
# Edita .env.local y pon tu OPENAI_API_KEY

# 3. Dev server
npm run dev
# → http://localhost:3000
```

## Deploy en Vercel

1. Sube este repositorio a GitHub
2. Ve a [vercel.com](https://vercel.com) → Import Project → selecciona el repo
3. En **Environment Variables** añade:
   - `OPENAI_API_KEY` = tu clave de OpenAI
4. Click **Deploy** — listo ✓

## Funcionalidades

- 📷 Cámara nativa con viewfinder dorado + flash
- 🔄 Cambio cámara frontal/trasera
- 🖼️ Importar desde galería
- ⌚ Identificación de relojes con marca, modelo, referencia, año, condición
- 💎 Identificación de joyas con modal de preguntas adicionales
- 💰 Análisis de precio (retail, mercado, rango)
- 🚗 Comparativas creativas (coches, casas, experiencias)
- ✨ UX de lujo con estética negra y dorada
- 📱 PWA instalable

## Estructura

```
wristid/
├── app/
│   ├── api/
│   │   ├── identify/route.ts        # Identificación principal (GPT-4o)
│   │   └── jewelry-complete/route.ts # Tasación joyas con info adicional
│   ├── result/page.tsx              # Página de resultados
│   ├── layout.tsx
│   ├── page.tsx                     # Cámara principal
│   └── globals.css
├── components/
│   ├── Camera.tsx                   # Componente cámara
│   ├── ResultCard.tsx               # Tarjeta de resultado (3 tabs)
│   └── JewelryModal.tsx             # Modal info adicional joyas
├── lib/
│   └── prompts.ts                   # Prompts optimizados para GPT-4o
└── public/
    ├── manifest.json                # PWA manifest
    └── icons/
```

## Costes OpenAI aproximados

| Acción | Modelo | Tokens | Coste estimado |
|--------|--------|--------|----------------|
| Identificar reloj | gpt-4o | ~1500 | ~$0.006 |
| Tasar joya | gpt-4o | ~1500 | ~$0.006 |

Muy bajo coste por consulta — menos de $0.01 por análisis.
