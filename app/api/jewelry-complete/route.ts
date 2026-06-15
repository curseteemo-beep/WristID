import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { JEWELRY_COMPLETE_PROMPT, type JewelryUserInfo } from '@/lib/prompts';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, jewelryInfo } = body as { image: string; jewelryInfo: JewelryUserInfo };

    if (!image || !jewelryInfo) {
      return NextResponse.json({ error: 'Missing image or jewelry info' }, { status: 400 });
    }

    const base64 = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
    const prompt = JEWELRY_COMPLETE_PROMPT(jewelryInfo);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1200,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: base64, detail: 'high' } },
            { type: 'text', text: prompt },
          ],
        },
      ],
    });

    const rawContent = response.choices[0]?.message?.content ?? '';
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid model response' }, { status: 502 });
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[jewelry-complete]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
