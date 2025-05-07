"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sendToWebhook } from '@/lib/webhookService';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

export default function N8nDebugPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [sending, setSending] = useState(false);
  const [polling, setPolling] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Generate a session ID when the component mounts
    setSessionId(uuidv4());
    
    // Get the webhook URL from environment
    const url = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '';
    setWebhookUrl(url);
  }, []);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    setErrorMessage(null);
    setSending(true);
    setResponse(null);
    setRawResponse('');
    
    try {
      addLog(`Sending message to n8n: "${input}"`);
      
      const payload = {
        userId: user?.uid || 'debug-user',
        userEmail: user?.email || 'debug@example.com',
        userName: user?.displayName || 'Debug User',
        chatInput: input,
        sessionId: sessionId,
        timestamp: new Date(),
      };
      
      addLog(`Webhook payload: ${JSON.stringify(payload)}`);
      
      const webhookSent = await sendToWebhook(payload);
      
      if (!webhookSent) {
        throw new Error("Failed to send to webhook");
      }
      
      addLog('Message sent successfully, starting polling for response');
      startPolling();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(errorMsg);
      addLog(`Error: ${errorMsg}`);
    } finally {
      setSending(false);
    }
  };

  const startPolling = () => {
    setPolling(true);
    pollForResponse();
  };

  const pollForResponse = async () => {
    if (!polling) return;
    
    try {
      addLog('Checking for n8n response...');
      const response = await fetch('/api/webhooks/chat/check');
      const data = await response.json();
      
      addLog(`Poll response: ${JSON.stringify(data)}`);
      
      if (data.success && data.data) {
        setResponse(data.data);
        setRawResponse(data.data.message || 'No message content');
        setPolling(false);
        addLog('Response received! Polling stopped.');
      } else {
        // If no response yet, poll again in 2 seconds
        setTimeout(pollForResponse, 2000);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(`Polling error: ${errorMsg}`);
      addLog(`Polling error: ${errorMsg}`);
      setPolling(false);
    }
  };

  const handleResetSession = () => {
    setSessionId(uuidv4());
    setInput('');
    setResponse(null);
    setRawResponse('');
    setErrorMessage(null);
    setPolling(false);
    setLogs([]);
    addLog('Session reset with new session ID');
  };

  return (
    <div className="container py-8 max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle>n8n Webhook Debug</CardTitle>
          <CardDescription>
            Test and debug the n8n webhook integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!user && (
              <Alert>
                <AlertTitle>Not Logged In</AlertTitle>
                <AlertDescription>
                  You are not logged in. The debug tool will use default values for user information.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Session ID</h3>
                  <div className="flex gap-2">
                    <Input 
                      value={sessionId} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button onClick={handleResetSession} variant="outline" size="sm">
                      Reset
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Webhook URL</h3>
                  <Input 
                    value={webhookUrl} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Test Message</h3>
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter a test message to send to n8n"
                    disabled={sending || polling}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!input.trim() || sending || polling}
                  >
                    {sending ? 'Sending...' : polling ? 'Waiting...' : 'Send'}
                  </Button>
                </div>
              </div>
              
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              
              <Tabs defaultValue="response" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="response">Response</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                  <TabsTrigger value="logs">Debug Logs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="response">
                  <Card>
                    <CardHeader>
                      <CardTitle>Response from n8n</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {response ? (
                        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-96">
                          {JSON.stringify(response, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                          {polling ? 'Waiting for response from n8n...' : 'No response received yet'}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="raw">
                  <Card>
                    <CardHeader>
                      <CardTitle>Raw Response Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {rawResponse ? (
                        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-96 whitespace-pre-wrap">
                          {rawResponse}
                        </pre>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                          {polling ? 'Waiting for raw data...' : 'No raw data received yet'}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="logs">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Debug Logs</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setLogs([])}
                      >
                        Clear
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-96">
                        {logs.length > 0 ? (
                          <ul className="space-y-1 font-mono text-xs">
                            {logs.map((log, index) => (
                              <li key={index}>{log}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">No logs yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 