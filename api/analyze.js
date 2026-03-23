export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).end();

  const { keyword } = req.body;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: 'You are a keyword research agent. Return only valid JSON, no markdown.',
      messages: [{
        role: 'user',
        content: `Analyze the keyword: "${keyword}". Return JSON with these fields:
          volume (number), difficulty (1-100), cpc (string e.g. "$2.40"),
          intent ("Informational" or "Commercial" or "Transactional"),
          related_keywords (array of 5 strings),
          top_insights (array of 3 short insight strings),
          recommendations (array of 3 short action strings)`
      }]
    })
  });

  const data = await response.json();
  const text = data.content[0].text;
  const clean = text.replace(/```json|```/g, '').trim();
  res.status(200).json(JSON.parse(clean));
}
