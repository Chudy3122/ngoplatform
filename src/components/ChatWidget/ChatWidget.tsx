// src/components/ChatWidget/ChatWidget.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { getAIResponse } from '@/lib/huggingface';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatWidget = () => {
    const [messages, setMessages] = useState<Message[]>([
      {
        id: "welcome",
        content: "Witaj! Jestem asystentem NGO Platform. Chętnie pomogę Ci odpowiedzieć na pytania i rozwieję wszelkie wątpliwości. W czym mogę Ci dzisiaj pomóc? 😊",
        isBot: true,
        timestamp: new Date()
      }
    ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getAIResponse(userMessage.content);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Przepraszam, wystąpił błąd. Spróbuj ponownie później.',
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <div className="flex items-center gap-2">
          <span className="text-blue-500 font-semibold text-lg">AI</span>
          <button 
            onClick={() => setIsOpen(true)}
            className="chat-widget-button bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 flex items-center justify-center"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </button>
        </div>
      ) : (
        <div className="w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col">
          <div className="p-4 bg-blue-500 text-white rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Chat Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-600 rounded-full p-1 transition-colors duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isBot
                      ? 'bg-gray-100'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {message.content}
                  <div className="text-xs mt-1 text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Napisz wiadomość..."
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                Wyślij
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;