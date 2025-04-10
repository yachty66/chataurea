'use client';
import { useState, useRef, useEffect } from 'react';
import Image from "next/image";

export default function Home() {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      // Add user message
      setMessages(prev => [...prev, { text: inputMessage, isUser: true }]);
      const userMessage = inputMessage;
      setInputMessage('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        // Create a new message for the AI response and start streaming
        setMessages(prev => [...prev, { text: '', isUser: false }]);
        setIsStreaming(true);
        setIsLoading(false); // Remove the thinking indicator

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        let accumulatedText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = new TextDecoder().decode(value);
          const chunks = text.split('data: ')
            .filter(chunk => chunk.trim())
            .map(chunk => chunk.replace(/\n/g, ''));

          for (const chunk of chunks) {
            accumulatedText += chunk;
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1].text = accumulatedText;
              return newMessages;
            });
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1].text === '') {
            newMessages.pop();
          }
          return [...newMessages, { 
            text: "Sorry, I encountered an error. Please try again.", 
            isUser: false 
          }];
        });
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4">
          {/* Logo in the middle */}
          {messages.length === 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Image
                src="/logo.png"
                alt="Aurea Logo"
                width={200}
                height={200}
                className="opacity-20"
              />
            </div>
          )}
          
          {/* Messages */}
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    message.isUser
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-black border border-gray-200'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {/* Only show thinking when loading and not streaming */}
            {isLoading && !isStreaming && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-black border border-gray-200 rounded-lg p-4">
                  Thinking...
                </div>
              </div>
            )}
            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Message input area */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 z-10">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-black text-black placeholder:text-gray-500"
              disabled={isLoading || isStreaming}
            />
            <button
              type="submit"
              className="rounded-lg bg-black px-6 py-4 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-400"
              disabled={isLoading || isStreaming}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}