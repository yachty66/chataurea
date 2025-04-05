import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message;

    const response = await fetch('http://localhost:11434/api/chat', {
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
        stream: false // We'll handle streaming later for simplicity
      }),
    });

    const data = await response.json();
    return NextResponse.json({ response: data.message.content });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to get response from Ollama' }, { status: 500 });
  }
}