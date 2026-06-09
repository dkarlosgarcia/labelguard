import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();

const COMPLIANCE_PROMPT = `You are a TTB (Alcohol and Tobacco Tax and Trade Bureau) label compliance checker.
Analyze the provided alcohol beverage label image and extract the following fields.

Return ONLY a valid JSON object. No markdown, no explanation, no code fences. Raw JSON only.

{
  "brand_name": "extracted value or null",
  "class_type": "extracted value or null",
  "alcohol_content": "extracted value or null",
  "net_contents": "extracted value or null",
  "country_of_origin": "extracted value or null",
  "government_warning": {
    "present": true or false,
    "exact_text": "the full warning text as it appears on the label, or null",
    "format_valid": true or false,
    "format_issues": "description of any format problems, or null"
  },
  "image_quality": "good" or "acceptable" or "poor",
  "image_quality_notes": "brief description of any issues affecting readability, or null"
}

Government Warning Validation Rules (all must be true for format_valid to be true):
1. The warning must begin with exactly "GOVERNMENT WARNING:" in all caps
2. "GOVERNMENT WARNING:" must appear to be bold or emphasized
3. The warning must contain both alcohol consumption warnings (birth defects/health problems AND driving/machinery impairment)
4. The warning text must not be in a font so small it is clearly intended to obscure it

For country_of_origin: only extract if explicitly stated on the label. If not present, return null.
For image_quality: "good" means clearly readable, "acceptable" means some issues but key fields readable, "poor" means significant issues preventing reliable extraction.`;

function evaluateCompliance(fields) {
  const warning = fields.government_warning;

  if (!warning.present || !warning.format_valid) {
    return {
      status: 'FAIL',
      reason: 'Government warning statement is missing or incorrectly formatted',
      color: 'red'
    };
  }

  const required = ['brand_name', 'class_type', 'alcohol_content', 'net_contents'];
  const missing = required.filter(f => !fields[f]);

  if (missing.length === 0) {
    return { status: 'PASS', reason: 'All required fields present and compliant', color: 'green' };
  } else if (missing.length <= 2) {
    return { status: 'WARNING', reason: `Missing fields: ${missing.join(', ')}`, color: 'yellow' };
  } else {
    return { status: 'FAIL', reason: `Too many missing fields: ${missing.join(', ')}`, color: 'red' };
  }
}

router.post('/analyze', async (req, res) => {
  try {
    const { imageBase64, mediaType } = req.body;

    if (!imageBase64 || !mediaType) {
      return res.status(400).json({ error: 'imageBase64 and mediaType are required' });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const start = Date.now();

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: imageBase64 }
          },
          { type: 'text', text: COMPLIANCE_PROMPT }
        ]
      }]
    });

    const raw = response.content[0].text;
    const fields = JSON.parse(raw);
    const result = evaluateCompliance(fields);
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);

    res.json({ fields, result, elapsed });

  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
});

export { router as analyzeRoute };
