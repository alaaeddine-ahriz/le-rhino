// src/lib/webhookService.ts
interface WebhookPayload {
  userId: string;
  userEmail?: string;
  userName?: string;
  chatInput: string;
  sessionId: string;
  timestamp: Date;
}

export async function sendToWebhook(payload: WebhookPayload): Promise<boolean> {
  try {
    // Remplacez cette URL par l'URL de votre webhook n8n
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('URL de webhook non configurée');
      return false;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pas d'authentification par en-tête
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de l'envoi au webhook: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi au webhook:', error);
    return false;
  }
} 