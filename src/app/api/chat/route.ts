import { streamText } from 'ai';
import { createOllama } from 'ollama-ai-provider';

const ollama = createOllama({
  // optional settings, e.g.
  baseURL: 'http://localhost:11434/api',
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, model } = await req.json();

  const result = streamText({
    model: ollama(model),
    messages,
  });

  return result.toDataStreamResponse();
}
