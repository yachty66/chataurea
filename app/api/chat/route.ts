import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const message = body.message;

  // Set up Server-Sent Events response headers
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Start the streaming response
  const response = new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });

  // Process the stream
  (async () => {
    try {
      const ollama_response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemma3:4b',
          messages: [{
            role: 'user',
            content: message
          }],
          stream: true // Enable streaming
        }),
      });

      const reader = ollama_response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Parse the chunk and extract the content
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              // Send the content with proper SSE format
              await writer.write(
                encoder.encode(`data: ${json.message.content}\n\n`)
              );
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      await writer.write(
        encoder.encode(`data: Error: ${error}\n\n`)
      );
    } finally {
      await writer.close();
    }
  })();

  return response;
}