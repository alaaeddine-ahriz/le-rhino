"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { sendToWebhook } from '@/lib/webhookService';
import { v4 as uuidv4 } from 'uuid';

// Message type
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

/**
 * Extracts the actual text response from the n8n response data
 */
const extractResponseText = (data: any): string => {
  try {
    // If it's already a string, return it
    if (typeof data === 'string') {
      return data;
    }
    
    // If it's an array with objects that have an 'output' field (like [{"output":"text"}])
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0].output) {
      return data[0].output;
    }
    
    // If it's an object with an 'output' field
    if (typeof data === 'object' && data && data.output) {
      return data.output;
    }
    
    // If it's an object with a 'text' or 'message' field
    if (typeof data === 'object' && data) {
      if (data.text) return data.text;
      if (data.message) return data.message;
      if (data.response) return data.response;
    }
    
    // Fallback: stringify the entire object
    return JSON.stringify(data);
  } catch (error) {
    console.error('Error extracting response text:', error);
    return String(data);
  }
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not authenticated, redirect to sign in
    if (!user) {
      router.push('/auth/signin');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Initialisation du sessionId
  useEffect(() => {
    // Générer un UUID unique pour cette session de chat
    setSessionId(uuidv4());
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    const sentMessage = input;
    setInput('');
    setIsLoading(true);
    
    try {
      // Simplified payload matching the curl command
      const payload = {
        chatInput: sentMessage,
        sessionId: sessionId,
      };
      
      const result = await sendToWebhook(payload);
      
      if (!result.success) {
        throw new Error(result.error || "Échec de l'envoi au webhook");
      }
      
      // Extract the text from the response
      const responseText = extractResponseText(result.data);
      
      // Create AI message with the extracted text
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: responseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erreur lors de l\'envoi au webhook:', error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-6 flex flex-col h-[calc(100vh-64px)]">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className="flex items-start max-w-3/4">
              {message.sender === 'ai' && (
                <Avatar className="mr-2 mt-0.5">
                  <AvatarFallback>AI</AvatarFallback>
                  <AvatarImage src="/icons/ai-avatar.png" alt="AI" />
                </Avatar>
              )}
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {message.sender === 'user' && (
                <Avatar className="ml-2 mt-0.5">
                  <AvatarFallback>
                    {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                  </AvatarFallback>
                  <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
                </Avatar>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-muted">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
} 