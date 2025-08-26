import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  // avoid "Body exceeded 8mb limit" for base64 payloads
  api: { bodyParser: { sizeLimit: '8mb' } },
};

function stripDataUrlPrefix(b64: string) {
  const i = b64.indexOf(';base64,');
  return i !== -1 ? b64.slice(i + ';base64,'.length) : b64;
}

function normTag(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, mimeType } = req.body || {};
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Missing imageBase64' });
    }

    // Vision needs RAW base64 (no data URL prefix)
    const content = stripDataUrlPrefix(imageBase64);

    // ✅ The structure Vision requires
    const visionBody = {
      requests: [
        {
          image: { content }, // <-- REQUIRED
          features: [
            { type: 'LABEL_DETECTION', maxResults: 20 }, // <-- REQUIRED
            { type: 'WEB_DETECTION', maxResults: 10 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
          ],
          // imageContext can be added if you want language hints, etc.
        },
      ],
    };

    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_API_KEY}`;
    const vr = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visionBody),
    });

    const vjson = await vr.json();
    if (!vr.ok) {
      const msg = vjson?.error?.message || 'Vision API error';
      // surface Vision’s message to the client for your per-image inline error
      return res.status(400).json({ error: msg });
    }

    const resp = vjson?.responses?.[0] ?? {};
    const labelTags: string[] = (resp.labelAnnotations ?? []).map(
      (a: any) => a.description
    );
    const webGuess: string[] = (resp.webDetection?.bestGuessLabels ?? []).map(
      (x: any) => x.label
    );
    const webEntities: string[] = (resp.webDetection?.webEntities ?? [])
      .filter((e: any) => !!e.description)
      .map((e: any) => e.description);

    // Merge, de-dupe, and normalize to your slug style
    const tags = Array.from(
      new Set([...labelTags, ...webGuess, ...webEntities])
    )
      .map(normTag)
      .filter(Boolean);

    return res.status(200).json({ tags });
  } catch (err: any) {
    console.error('tags/suggest error', err);
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}
