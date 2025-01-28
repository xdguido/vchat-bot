import { streamText } from 'ai';
import { createOllama } from 'ollama-ai-provider';

const ollama = createOllama({
  // optional settings, e.g.
  baseURL: 'http://localhost:11434/api',
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: ollama('llama3.2:1b'),
    messages,
  });

  return result.toDataStreamResponse();
}
