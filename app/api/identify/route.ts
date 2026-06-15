import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { IDENTIFY_PROMPT } from '@/lib/prompts';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Strip data URI prefix if present, keep only base64
    const base64 = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1200,
      temperature: 0.2, // Low temp = more consistent/accurate IDs
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: base64, detail: 'high' },
            },
            {
              type: 'text',
              text: IDENTIFY_PROMPT,
            },
          ],
        },
      ],
    });

    const rawContent = response.choices[0]?.message?.content ?? '';

    // Parse JSON — strip any accidental markdown fences
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Model returned non-JSON response', raw: rawContent },
        { status: 502 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    if (message.includes('insufficient_quota') || message.includes('billing')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Check your OpenAI billing.' },
        { status: 402 }
      );
    }

    console.error('[identify]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
