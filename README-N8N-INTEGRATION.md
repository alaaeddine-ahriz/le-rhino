# Intégration du Chat avec n8n via Webhook

Ce guide explique comment connecter la fonctionnalité de chat de l'application Rhino IA avec n8n pour automatiser des flux de travail à l'aide de webhooks.

## Prérequis

- Une instance n8n fonctionnelle (auto-hébergée ou cloud)
- Accès au code source de l'application Rhino IA
- Node.js et npm installés

## Table des matières

1. [Configuration de n8n](#configuration-de-n8n)
2. [Modification du composant Chat](#modification-du-composant-chat)
3. [Création d'une API pour les webhooks](#création-dune-api-pour-les-webhooks)
4. [Configuration des flux de travail dans n8n](#configuration-des-flux-de-travail-dans-n8n)
5. [Tests et débogage](#tests-et-débogage)
6. [Cas d'utilisation avancés](#cas-dutilisation-avancés)

## Configuration de n8n

### Installation et démarrage de n8n

Si vous n'avez pas encore installé n8n, vous pouvez le faire avec les commandes suivantes :

```bash
npm install n8n -g
n8n start
```

Ou utiliser Docker :

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Accédez à l'interface n8n à l'adresse: `http://localhost:5678`

### Création d'un webhook dans n8n

1. Créez un nouveau workflow dans n8n
2. Ajoutez un nœud "Webhook" comme déclencheur
3. Configurez-le comme suit:
   - Méthode: POST
   - Chemin: chat-webhook (ou un nom de votre choix)
   - Authentification: Facultatif, mais recommandé (Header Auth)
   - Notez l'URL générée (ressemblera à `https://your-n8n-instance.com/webhook/chat-webhook`)

## Modification du composant Chat

Nous devons modifier le composant de chat pour envoyer les messages au webhook n8n. Voici les étapes pour y parvenir :

### 1. Créer un service de webhook

Créez un nouveau fichier à `src/lib/webhookService.ts` :

```typescript
// src/lib/webhookService.ts
interface WebhookPayload {
  userId: string;
  userEmail?: string;
  userName?: string;
  message: string;
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
        // Si vous avez configuré une authentification par en-tête dans n8n
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_N8N_WEBHOOK_KEY || ''}`,
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
```

### 2. Modifier le composant Chat pour utiliser le service webhook

Modifiez le fichier `src/app/chat/page.tsx` pour intégrer le service de webhook :

```typescript
// Importez le service webhook
import { sendToWebhook } from '@/lib/webhookService';

// Dans la fonction handleSendMessage, après avoir créé le message utilisateur
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
    sendToWebhook({
      userId: user.uid,
      userEmail: user.email || undefined,
      userName: user.displayName || undefined,
      message: input,
      timestamp: new Date(),
    }).catch(error => {
      console.error('Erreur lors de l\'envoi au webhook:', error);
    });
  }
  
  // Le reste du code pour obtenir la réponse...
};
```

## Création d'une API pour les webhooks

Pour recevoir des réponses de n8n, créez une API endpoint dans votre application.

### 1. Créer un endpoint API

Créez un nouveau dossier et fichier : `src/app/api/webhooks/chat/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Valider l'authentification si nécessaire
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.N8N_WEBHOOK_SECRET;
    
    if (expectedKey && (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== expectedKey)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Traiter les données provenant de n8n
    // Par exemple, vous pourriez vouloir enregistrer une réponse dans la base de données
    // ou envoyer une notification à l'utilisateur
    
    console.log('Webhook reçu de n8n:', data);
    
    // Vous pouvez implémenter ici la logique pour traiter la réponse n8n
    // Par exemple, ajouter un message dans la conversation

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    return NextResponse.json({ error: 'Erreur de traitement' }, { status: 500 });
  }
}
```

### 2. Configurer les variables d'environnement

Ajoutez les variables d'environnement nécessaires dans un fichier `.env.local` :

```
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/chat-webhook
NEXT_PUBLIC_N8N_WEBHOOK_KEY=your-webhook-auth-key
N8N_WEBHOOK_SECRET=your-incoming-webhook-secret
```

## Configuration des flux de travail dans n8n

### 1. Créer un flux de travail de base

Dans l'interface n8n, créez un flux de travail avec les composants suivants :

1. **Webhook** : Le point d'entrée qui reçoit les messages du chat
2. **Function** : Pour traiter les données reçues
   ```javascript
   // Exemple de code pour le nœud Function
   const data = $input.item.json;
   const message = data.message;
   
   // Analyser le message et préparer une réponse
   let response = {
     originalMessage: message,
     // Votre logique personnalisée ici
     processedResult: `J'ai traité votre message: "${message}"`,
     timestamp: new Date().toISOString()
   };
   
   return response;
   ```
3. **HTTP Request** : Pour envoyer la réponse à votre API de webhooks
   - Méthode: POST
   - URL: https://votre-app.com/api/webhooks/chat
   - Headers: 
     ```
     Content-Type: application/json
     Authorization: Bearer your-incoming-webhook-secret
     ```
   - Body: Données du nœud Function précédent

### 2. Exemples d'automatisations avancées

Vous pouvez enrichir votre flux de travail avec :

- **Intégration d'IA** : Utilisez les nœuds OpenAI ou LangChain pour générer des réponses
- **Extraction de données** : Traitez le texte pour extraire des informations structurées
- **Intégration de services tiers** : Google Sheets, Notion, Slack, etc.
- **Logique conditionnelle** : Traitez différemment les messages selon leur contenu

## Tests et débogage

### 1. Tester le webhook

Pour tester le webhook, vous pouvez utiliser l'onglet "Test" du nœud Webhook dans n8n ou envoyer une requête cURL :

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-webhook-key" \
  -d '{"userId":"test123","message":"Ceci est un test","timestamp":"2023-07-01T12:00:00Z"}' \
  https://your-n8n-instance.com/webhook/chat-webhook
```

### 2. Déboguer les problèmes courants

- **Problèmes CORS** : Assurez-vous que les en-têtes CORS sont correctement configurés
- **Erreurs d'authentification** : Vérifiez les clés et les en-têtes d'authentification
- **Problèmes de format de données** : Assurez-vous que le JSON envoyé est valide

## Cas d'utilisation avancés

### 1. Analyse de sentiment

Configurez n8n pour analyser le sentiment des messages et adapter les réponses en conséquence.

### 2. Classification automatique

Classifiez les messages des utilisateurs par catégorie et déclenchez différentes actions selon la catégorie.

### 3. Intégration multiservice

Connectez le chat à plusieurs services pour une expérience plus riche :
- Récupération de données météo
- Recherche d'informations
- Intégration avec votre CRM
- Gestion de tâches via Notion ou Trello

### 4. Notifications en temps réel

Configurez des notifications pour informer les utilisateurs des réponses ou des actions effectuées par n8n.

---

Avec cette intégration, votre application de chat Rhino IA peut exploiter la puissance de n8n pour automatiser des tâches, intégrer des services tiers et créer des flux de travail sophistiqués pour améliorer l'expérience utilisateur. 