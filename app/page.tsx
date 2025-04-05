'use client';
import { useState } from 'react';
import Image from "next/image";

export default function Home() {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      setMessages([...messages, { text: inputMessage, isUser: true }]);
      setInputMessage('');
      // Here you would typically make an API call to your backend
      // For now, we'll just simulate a response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "This is a sample response. Connect to your backend to get real responses!", 
          isUser: false 
        }]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
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
      </div>

      {/* Message input area */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-3xl mx-auto flex gap-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            className="rounded-lg bg-black px-6 py-4 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}