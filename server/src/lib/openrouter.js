export async function callOpenRouter(messages, models) {
  let apiKey = process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.replace(/['"]/g, '').trim() : '';
  
  // Auto-prepend the prefix if the user pasted only the hex part on Render
  if (apiKey && !apiKey.startsWith('sk-or-v1-')) {
    apiKey = 'sk-or-v1-' + apiKey;
  }

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not configured.');
  }

  // Safe debugging to inspect key properties
  console.log(`[OpenRouter Debug] Key length: ${apiKey.length}, starts with: "${apiKey.substring(0, 18)}...", ends with: "...${apiKey.substring(apiKey.length - 5)}"`);



  let lastError = null;

  for (const model of models) {
    const start = Date.now();
    console.log(`[OpenRouter] Trying model: ${model}...`);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'FinTrack AI',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: messages
        })
      });

      const latency = ((Date.now() - start) / 1000).toFixed(2);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || `Status ${response.status}`;
        console.warn(`[OpenRouter] Model ${model} failed after ${latency}s: ${errMsg}`);
        continue; // Try next model
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) {
        console.log(`[OpenRouter] Success with model: ${model} in ${latency}s`);
        return text;
      } else {
        console.warn(`[OpenRouter] Model ${model} returned empty content in ${latency}s`);
      }
    } catch (err) {
      const latency = ((Date.now() - start) / 1000).toFixed(2);
      console.warn(`[OpenRouter] Request error for ${model} after ${latency}s: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(lastError ? `All models failed. Last error: ${lastError.message}` : 'All models failed to return content.');
}
