#!/usr/bin/env node
/**
 * Test if ANTHROPIC_API_KEY is valid by sending a minimal messages API request.
 * Usage: ANTHROPIC_API_KEY=sk-ant-... node scripts/test-anthropic-api-key.mjs
 */

const key = process.env.ANTHROPIC_API_KEY;
if (!key) {
  console.error('Missing ANTHROPIC_API_KEY. Set it in env:');
  console.error('  export ANTHROPIC_API_KEY=sk-ant-...');
  console.error('  node scripts/test-anthropic-api-key.mjs');
  process.exit(1);
}

const url = 'https://api.anthropic.com/v1/messages';
const body = {
  model: 'claude-3-5-haiku-20241022',
  max_tokens: 10,
  messages: [{ role: 'user', content: 'Say "ok"' }],
};

try {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error('API key test failed:', res.status, res.statusText);
    if (data.error) console.error('Error:', data.error.message || JSON.stringify(data.error));
    process.exit(1);
  }

  const text = data.content?.[0]?.text ?? '';
  console.log('Anthropic API key is working.');
  console.log('Response:', text.trim() || '(empty)');
} catch (err) {
  console.error('Request failed:', err.message);
  process.exit(1);
}
