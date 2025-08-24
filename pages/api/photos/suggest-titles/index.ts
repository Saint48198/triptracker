import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: { bodyParser: { sizeLimit: '16mb' } }, // allow base64 images
};

type ReqBody = {
  imageBase64: string; // raw base64 (no data: prefix)
  mimeType?: string; // e.g. "image/jpeg"
  hints?: {
    tags?: string[];
    city?: string;
    state?: string;
    country?: string;
    datetimeOriginal?: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });

  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      hints = {},
    } = req.body as ReqBody;

    if (!imageBase64)
      return res.status(400).json({ error: 'imageBase64 required' });

    const prompt = [
      'You are helping name personal photos.',
      'Using the image and optional hints, propose 8 concise, creative, title-case photo titles.',
      'No trailing punctuation. Avoid quotes. No more than 5 words each.',
      'Return ONLY a JSON array of strings. No extra text.',
    ].join(' ');

    const hintText = [
      hints.tags?.length ? `Tags: ${hints.tags.join(', ')}` : '',
      hints.city || hints.state || hints.country
        ? `Location: ${[hints.city, hints.state, hints.country].filter(Boolean).join(', ')}`
        : '',
      hints.datetimeOriginal ? `Date: ${hints.datetimeOriginal}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    const body = {
      contents: [
        {
          parts: [
            { text: `${prompt}${hintText ? `\nHints: ${hintText}` : ''}` },
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
          ],
        },
      ],
    };

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!resp.ok) {
      const t = await resp.text();
      return res.status(502).json({ error: 'Gemini call failed', detail: t });
    }

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';

    // Expect a JSON array; try to parse. If model adds code fences, strip them.
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/, '')
      .trim();
    let suggestions: string[] = [];
    try {
      suggestions = JSON.parse(cleaned);
    } catch {
      // fallback: split by lines if not valid JSON
      suggestions = cleaned
        .split('\n')
        .map((s: string) => s.replace(/^-+\s*/, '').trim())
        .filter(Boolean);
    }

    // normalize
    suggestions = suggestions
      .map((s) => s.replace(/^"(.*)"$/, '$1').trim())
      .filter(Boolean);

    return res.status(200).json({ suggestions });
  } catch (err: any) {
    console.error('suggest-titles error:', err);
    return res.status(500).json({ error: 'Failed to generate suggestions' });
  }
}
