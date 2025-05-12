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

// Base64 encoded small rhino icon as fallback
const RHINO_FALLBACK_IMAGE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1ob3JuIj48cGF0aCBkPSJNMTIgNmE0IDQgMCAwIDEgOCAwYzAgMS41LS44NCAyLjktMi4yNSAzLjYzLS40My4yMy0uNTUuODEtLjI0IDEuMTdMMjIgMTUiLz48cGF0aCBkPSJNMTIgNmE0IDQgMCAwIDAtOCAwYzAgMS41Ljg0IDIuOSAyLjI1IDMuNjMuNDMuMjMuNTUuODEuMjQgMS4xN0wyIDE1Ii8+PHBhdGggZD0iTTE4IDEyYS41LjUgMCAxIDEtMS4wMSAwIC41LjUgMCAwIDEgMSAwWiIvPjxwYXRoIGQ9Ik03IDE1Yy0xLjUgMC0zIC41LTQgMmgyYy41LTEgMS41LTEuNSAyLTEuNXMxLjUuNSAyIDEuNWgyYy0xLTEuNS0yLjUtMi00LTJaIi8+PHBhdGggZD0iTTIyIDE3YzAgMiAwIDQtMyA0YzAgMC0nLTEuODktNy0zcy0xLTMuVzLTQtMnY0YzAgMS41LTEgNC00IDJoMTYiLz48L3N2Zz4=";

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
const extractResponseText = (data: unknown): string => {
  try {
    // If it's already a string, return it
    if (typeof data === 'string') {
      return data;
    }
    
    // Type guard to check if data is an object
    if (data && typeof data === 'object') {
    // If it's an array with objects that have an 'output' field (like [{"output":"text"}])
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
        const firstItem = data[0] as Record<string, unknown>;
        if (typeof firstItem.output === 'string') {
          return firstItem.output;
    }
      }
      
      // If it's an object with various fields
      const typedData = data as Record<string, unknown>;
    
    // If it's an object with an 'output' field
      if (typedData.output && typeof typedData.output === 'string') {
        return typedData.output;
    }
    
    // If it's an object with a 'text' or 'message' field
      if (typedData.text && typeof typedData.text === 'string') return typedData.text;
      if (typedData.message && typeof typedData.message === 'string') return typedData.message;
      if (typedData.response && typeof typedData.response === 'string') return typedData.response;
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
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-gray-900">

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] text-center p-6 space-y-5 text-muted-foreground">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                <img 
                  src="/rhino.svg" 
                  alt="Le Rhino" 
                  className="w-16 h-16 object-contain" 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = RHINO_FALLBACK_IMAGE;
                  }}
                />
              </div>
              <h3 className="font-medium text-lg">Bienvenue dans le chat</h3>
              <p className="text-sm max-w-md">Posez vos questions sur le contenu de vos cours et obtenez des réponses précises basées sur vos documents.</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${
                message.sender === 'user' ? 'pl-12 sm:pl-24' : 'pr-12 sm:pr-24'
              } animate-in fade-in duration-300`}
            >
              <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start max-w-[90%] group`}>
                  {message.sender === 'ai' && (
                    <Avatar className="mr-3 mt-1 h-7 w-7 flex-shrink-0">
                      <AvatarFallback>🦏</AvatarFallback>
                      <AvatarImage 
                        src="/rhino.svg" 
                        alt="Le Rhino" 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = RHINO_FALLBACK_IMAGE;
                        }}
                      />
                    </Avatar>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="pr-12 sm:pr-24 animate-in fade-in duration-300">
              <div className="flex justify-start">
                <div className="flex items-start max-w-[90%]">
                  <Avatar className="mr-3 mt-1 h-7 w-7 flex-shrink-0">
                    <AvatarFallback>🦏</AvatarFallback>
                    <AvatarImage 
                      src="/rhino.svg" 
                      alt="Le Rhino" 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = RHINO_FALLBACK_IMAGE;
                      }}
                    />
                  </Avatar>
                  <div className="flex items-center space-x-2 px-3 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="border-t dark:border-gray-800 bg-white dark:bg-gray-900 p-3 md:p-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              disabled={isLoading}
              className="flex-1 rounded-full border border-gray-300 dark:border-gray-700 focus-visible:ring-1 focus-visible:ring-primary dark:bg-gray-800 h-12 px-4"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()} 
              className="rounded-full h-10 w-10 p-0 flex items-center justify-center bg-primary hover:bg-primary/90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              <span className="sr-only">Envoyer</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 