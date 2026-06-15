import { NextRequest, NextResponse } from 'next/server';
import { IDENTIFY_PROMPT } from '@/lib/prompts';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: 'No image' }, { status: 400 });

    // Strip data URI prefix → raw base64
    const base64 = image.replace(/^data:image\/\w+;base64,/, '');

    const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: IDENTIFY_PROMPT },
            { inlineData: { mimeType: 'image/jpeg', data: base64 } },
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1200 },
      }),
    });

    const data = await res.json();
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: 'Respuesta inválida del modelo' }, { status: 502 });

    return NextResponse.json(JSON.parse(match[0]));
  } catch (err) {
    console.error('[identify]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
