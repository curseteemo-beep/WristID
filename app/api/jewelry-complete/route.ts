import { NextRequest, NextResponse } from 'next/server';
import type { JewelryUserInfo } from '@/lib/prompts';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent';

function buildPrompt(info: JewelryUserInfo): string {
  return `You are a master gemologist and fine jewelry appraiser. The user provided these details about the jewelry in the image:
- Type: ${info.jewelryType}
- Metal: ${info.metal}${info.metalPurity ? ` (${info.metalPurity})` : ''}
- Stones: ${info.stones || 'None'}
- Stone quality: ${info.stoneQuality || 'Unknown'}
- Weight: ${info.weight || 'Unknown'} grams
- Brand: ${info.brand || 'Unknown'}

Respond ONLY with a raw JSON object — no markdown, no code fences:

{
  "type": "jewelry",
  "subtype": "${info.jewelryType}",
  "confidence": 80,
  "brand": "Unsigned Fine Jewelry",
  "description": "A beautiful piece...",
  "estimatedWeight": 12,
  "materials": {
    "metal": "18k Yellow Gold",
    "stones": "Round brilliant diamonds",
    "stoneQuality": "VS1, F color",
    "setting": "Pavé"
  },
  "pricing": {
    "materialValue": 3000,
    "retail": 8000,
    "market": 5500,
    "low": 4500,
    "high": 7000,
    "currency": "USD"
  },
  "comparisons": [
    { "category": "car", "equivalent": "2020 Honda Civic", "price": 5500 },
    { "category": "real_estate", "equivalent": "1 month rent in Manhattan", "price": 5000 },
    { "category": "experience", "equivalent": "7-day Caribbean cruise for two", "price": 5200 }
  ],
  "fun_fact": "Diamonds are the hardest natural substance on Earth.",
  "care_tips": ["Clean with warm soapy water", "Store separately", "Remove before exercise"]
}

RAW JSON ONLY. No markdown. No backticks.`;
}

function extractJSON(text: string): object | null {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { image, jewelryInfo } = await req.json() as { image: string; jewelryInfo: JewelryUserInfo };
    if (!image || !jewelryInfo) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const base64 = image.replace(/^data:image\/\w+;base64,/, '');

    const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: buildPrompt(jewelryInfo) },
            { inlineData: { mimeType: 'image/jpeg', data: base64 } },
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1200 },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: `Gemini error: ${data?.error?.message ?? res.status}` }, { status: 502 });
    }

    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const parsed = extractJSON(text);
    if (!parsed) return NextResponse.json({ error: 'Respuesta inválida', raw: text.slice(0, 200) }, { status: 502 });

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[jewelry-complete]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
