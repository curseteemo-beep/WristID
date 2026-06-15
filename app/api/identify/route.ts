import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const PROMPT = `You are a world expert in luxury watches and fine jewelry. Analyze the image carefully.

Respond ONLY with a raw JSON object — no markdown, no code fences, no explanation. Just the JSON:

{
  "type": "watch",
  "confidence": 85,
  "brand": "Rolex",
  "model": "Submariner Date",
  "reference": "126610LN",
  "year": "2021",
  "condition": "excellent",
  "description": "Classic Rolex Submariner in stainless steel with black dial and ceramic bezel.",
  "materials": {
    "case": "Oystersteel",
    "bracelet": "Oyster bracelet",
    "crystal": "Sapphire crystal",
    "dial": "Black"
  },
  "complications": ["Date", "Water resistance 300m"],
  "pricing": {
    "retail": 10800,
    "market": 13500,
    "low": 12000,
    "high": 15000,
    "currency": "USD"
  },
  "comparisons": [
    { "category": "car", "equivalent": "2022 BMW 3 Series", "price": 43000 },
    { "category": "real_estate", "equivalent": "Down payment on a Miami condo", "price": 13500 },
    { "category": "experience", "equivalent": "2-week luxury safari in Kenya", "price": 12000 }
  ],
  "fun_fact": "The Submariner was the first watch to be water resistant to 100m, introduced in 1953.",
  "jewelry_needs_info": false
}

If it is jewelry and you cannot determine materials or stones, set "jewelry_needs_info": true.
If you cannot identify anything, return: {"type":"unknown","confidence":0,"error":"Cannot identify"}

Remember: RAW JSON ONLY. No markdown. No backticks.`;

function extractJSON(text: string): object | null {
  // Remove markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  // Try direct parse first
  try { return JSON.parse(cleaned); } catch {}

  // Find first { ... } block
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: 'No image' }, { status: 400 });

    const base64 = image.replace(/^data:image\/\w+;base64,/, '');

    const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: PROMPT },
            { inlineData: { mimeType: 'image/jpeg', data: base64 } },
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1200 },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[identify] Gemini API error:', JSON.stringify(data));
      return NextResponse.json({ error: `Gemini API error: ${data?.error?.message ?? res.status}` }, { status: 502 });
    }

    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    console.log('[identify] raw text:', text.slice(0, 300));

    const parsed = extractJSON(text);
    if (!parsed) {
      console.error('[identify] could not parse JSON from:', text);
      return NextResponse.json({ error: 'Respuesta inválida del modelo', raw: text.slice(0, 200) }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[identify]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
