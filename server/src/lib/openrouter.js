/**
 * Unified helper to call OpenRouter completions with automatic failover.
 * @param {Array} messages - Chat completions message list
 * @param {Array<string>} models - Prioritized list of model strings to attempt
 * @returns {Promise<string>} The first successful model completion content
 */
export async function callOpenRouter(messages, models) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable is not configured.');
  }

  let lastError = null;

  for (const model of models) {
    const start = Date.now();
    console.log(`[OpenRouter] Trying model: ${model}...`);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
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
