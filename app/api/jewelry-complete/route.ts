import { NextRequest, NextResponse } from 'next/server';
import type { JewelryUserInfo } from '@/lib/prompts';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

function buildPrompt(info: JewelryUserInfo): string {
  return `You are a master gemologist and fine jewelry appraiser with 30+ years valuing pieces for Sotheby's. The user provided these details:
- Type: ${info.jewelryType}
- Metal: ${info.metal}${info.metalPurity ? ` (${info.metalPurity})` : ''}
- Stones: ${info.stones || 'None'}
- Stone quality: ${info.stoneQuality || 'Unknown'}
- Weight: ${info.weight || 'Unknown'} grams
- Brand: ${info.brand || 'Unknown / unsigned'}

Respond ONLY with a raw JSON object — no markdown, no code fences:
{
  "type": "jewelry",
  "subtype": "${info.jewelryType}",
  "confidence": 80,
  "brand": "Unsigned Fine Jewelry",
  "description": "Description here.",
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
  "fun_fact": "Interesting fact about this gem or jewelry type.",
  "care_tips": ["Clean with warm soapy water", "Store separately", "Remove before exercise"]
}
RAW JSON ONLY.`;
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

    const base64 = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        temperature: 0.1,
        max_tokens: 1200,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: buildPrompt(jewelryInfo) },
            { type: 'image_url', image_url: { url: base64 } },
          ],
        }],
      }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: `Groq error: ${data?.error?.message ?? res.status}` }, { status: 502 });

    const text: string = data.choices?.[0]?.message?.content ?? '';
    const parsed = extractJSON(text);
    if (!parsed) return NextResponse.json({ error: 'Respuesta inválida' }, { status: 502 });

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[jewelry-complete]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
