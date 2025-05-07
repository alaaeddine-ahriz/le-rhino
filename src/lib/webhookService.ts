// src/lib/webhookService.ts
interface WebhookPayload {
  chatInput: string;
  sessionId: string;
  // Optional fields
  userId?: string;
  userEmail?: string;
  userName?: string;
  timestamp?: Date;
}

export async function sendToWebhook(payload: WebhookPayload): Promise<any> {
  try {
    // Get webhook URL from environment
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('URL de webhook non configurée');
      return { success: false, error: 'Webhook URL not configured' };
    }

    console.log('Sending to webhook:', webhookUrl);
    console.log('Payload:', JSON.stringify(payload));

    // Simplify the payload to match the curl command
    const simplifiedPayload = {
      chatInput: payload.chatInput,
      sessionId: payload.sessionId
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simplifiedPayload),
    });

    // Get the response data
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = await response.text();
    }

    if (!response.ok) {
      console.error(`Webhook error: ${response.status}`, responseData);
      return { 
        success: false, 
        status: response.status,
        error: `Error sending to webhook: ${response.status}`,
        data: responseData
      };
    }

    // Return the complete response to allow direct integration in the chat
    return { 
      success: true, 
      status: response.status,
      data: responseData
    };
    
  } catch (error) {
    console.error('Error sending to webhook:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 