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

// Type pour l'événement n8n
interface N8nResponseEvent extends CustomEvent {
  detail: {
    message: string;
  };
}

// Type pour la réponse de l'API
interface N8nApiResponse {
  success: boolean;
  data: {
    message: string;
    timestamp: string;
  } | null;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Salut jeune padawan, comment puis-je t\'aider aujourd\'hui ?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingResponses, setCheckingResponses] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
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

  // Fonction pour vérifier les nouvelles réponses
  const checkForNewResponses = async () => {
    if (checkingResponses) return;
    
    try {
      setCheckingResponses(true);
      const response = await fetch('/api/webhooks/chat/check');
      const data: N8nApiResponse = await response.json();
      
      if (data.success && data.data) {
        // Ajouter le message de réponse au chat
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: data.data.message,
          sender: 'ai',
          timestamp: new Date(data.data.timestamp),
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false); // Désactiver le chargement lorsqu'une réponse est reçue
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des réponses:', error);
    } finally {
      setCheckingResponses(false);
    }
  };

  // Configurer un polling pour vérifier régulièrement les nouvelles réponses
  useEffect(() => {
    // Si en attente d'une réponse, commencer le polling
    if (isLoading) {
      // Vérifier immédiatement
      checkForNewResponses();
      
      // Puis configurer un intervalle pour vérifier régulièrement
      pollingIntervalRef.current = setInterval(checkForNewResponses, 2000); // Vérifier toutes les 2 secondes
    } else {
      // Si pas en attente, arrêter le polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
    
    // Nettoyage lors du démontage du composant
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isLoading]);

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
    setInput('');
    setIsLoading(true);
    
    // Envoyer le message au webhook n8n
    if (user) {
      try {
        const webhookSent = await sendToWebhook({
          userId: user.uid,
          userEmail: user.email || undefined,
          userName: user.displayName || undefined,
          chatInput: input,
          sessionId: sessionId,
          timestamp: new Date(),
        });
        
        if (!webhookSent) {
          throw new Error("Échec de l'envoi au webhook");
        }
        
        // Ne pas désactiver isLoading - nous attendons la réponse de n8n
        // Le state sera mis à jour quand nous recevrons la réponse via le polling
        
      } catch (error) {
        console.error('Erreur lors de l\'envoi au webhook:', error);
        toast.error("Erreur lors de l'envoi du message");
        setIsLoading(false);
      }
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