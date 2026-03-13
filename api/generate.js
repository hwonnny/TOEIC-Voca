export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { existing } = req.body;

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
        messages: [{
          role: 'user',
          content: `토익 700점 수준의 영단어 5개를 생성해줘.
다음 단어는 이미 있으니 반드시 제외해줘: ${existing || '없음'}

반드시 아래 JSON 배열 형식으로만 응답해. 다른 텍스트 없이 JSON만:
[{"word":"단어","pos":"noun|verb|adjective|adverb 중 하나","meaning":"한국어 뜻","example":"영어 예시 문장"}]

조건: 토익 빈출 단어, 비즈니스/일상 영어 예문, 품사는 noun/verb/adjective/adverb 중 하나`
        }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text.trim().replace(/```json|```/g, '').trim();
    const words = JSON.parse(text);

    res.status(200).json({ words });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '단어 생성 실패' });
  }
}
