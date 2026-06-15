import { NextRequest, NextResponse } from 'next/server';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const PROMPT = `You are a world expert in luxury watches and fine jewelry with 30+ years of experience at Sotheby's and Christie's auction houses.

Analyze the image and respond ONLY with a raw JSON object — absolutely no markdown, no code fences, no explanation text before or after.

Use this exact structure:
{
  "type": "watch",
  "confidence": 85,
  "brand": "Rolex",
  "model": "Submariner Date",
  "reference": "126610LN",
  "year": "2021",
  "condition": "excellent",
  "description": "Classic Rolex Submariner in Oystersteel with black ceramic bezel and dial.",
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
    { "category": "car", "equivalent": "2022 BMW 3 Series 330i", "price": 43000 },
    { "category": "real_estate", "equivalent": "Down payment on a Miami studio apartment", "price": 13500 },
    { "category": "experience", "equivalent": "2-week luxury safari in Kenya for two", "price": 12000 }
  ],
  "fun_fact": "The Submariner was the first watch water resistant to 100m, launched in 1953.",
  "jewelry_needs_info": false
}

type must be "watch", "jewelry", or "unknown".
If it is jewelry and you cannot determine materials or stones, set "jewelry_needs_info": true.
If you cannot identify the object, return: {"type":"unknown","confidence":0,"error":"Cannot identify"}
RAW JSON ONLY.`;

function extractJSON(text: string): object | null {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: 'No image' }, { status: 400 });

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
            { type: 'text', text: PROMPT },
            { type: 'image_url', image_url: { url: base64 } },
          ],
        }],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[identify] Groq error:', JSON.stringify(data));
      return NextResponse.json(
        { error: `Groq API error: ${data?.error?.message ?? res.status}` },
        { status: 502 }
      );
    }

    const text: string = data.choices?.[0]?.message?.content ?? '';
    const parsed = extractJSON(text);

    if (!parsed) {
      console.error('[identify] could not parse JSON:', text.slice(0, 300));
      return NextResponse.json({ error: 'Respuesta inválida del modelo' }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[identify]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
