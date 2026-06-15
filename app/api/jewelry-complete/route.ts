import { NextRequest, NextResponse } from 'next/server';
import { JEWELRY_COMPLETE_PROMPT, type JewelryUserInfo } from '@/lib/prompts';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function POST(req: NextRequest) {
  try {
    const { image, jewelryInfo } = await req.json() as { image: string; jewelryInfo: JewelryUserInfo };
    if (!image || !jewelryInfo) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const base64 = image.replace(/^data:image\/\w+;base64,/, '');
    const prompt = JEWELRY_COMPLETE_PROMPT(jewelryInfo);

    const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: base64 } },
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1200 },
      }),
    });

    const data = await res.json();
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: 'Respuesta inválida' }, { status: 502 });

    return NextResponse.json(JSON.parse(match[0]));
  } catch (err) {
    console.error('[jewelry-complete]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
