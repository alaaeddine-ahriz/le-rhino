# Mise à jour de l'intégration n8n - Format des données

Ce document décrit le format mis à jour des données échangées entre l'application et n8n.

## Format des données envoyées à n8n

Les données envoyées par l'application au webhook n8n ont été mises à jour pour inclure:

```json
{
  "userId": "identifiant-utilisateur",
  "userEmail": "email@utilisateur.com",
  "userName": "Nom Utilisateur",
  "chatInput": "Message de l'utilisateur",
  "sessionId": "uuid-session-unique",
  "timestamp": "2023-07-01T12:00:00Z"
}
```

### Changements importants:

1. Le champ `message` a été renommé en `chatInput` pour plus de clarté
2. Un nouveau champ `sessionId` (UUID unique) a été ajouté pour suivre les conversations

## Réponses de n8n vers l'application

Les réponses de n8n vers le webhook de l'application doivent toujours contenir l'une des structures suivantes:

```json
{
  "processedResult": "Réponse au message"
}
```

ou

```json
{
  "response": "Réponse au message"
}
```

ou

```json
{
  "message": "Réponse au message"
}
```

## Configuration du workflow n8n

Pour mettre à jour votre workflow n8n:

1. Mettez à jour tous les nœuds qui utilisaient l'ancienne variable `msg.json.message` pour utiliser `msg.json.chatInput` à la place
2. Vous pouvez maintenant utiliser `msg.json.sessionId` pour suivre les conversations et maintenir le contexte
3. Assurez-vous que vos HTTP Request renvoient les réponses au format attendu

## Exemple de fonction n8n

Voici un exemple de fonction n8n mise à jour:

```javascript
// Dans un nœud Function de n8n
const data = $input.item.json;
const userInput = data.chatInput;  // Utilisation de chatInput au lieu de message
const sessionId = data.sessionId;  // Accès au nouveau sessionId

// Utilisation du sessionId pour gérer le contexte ou le stockage
// ...

// Préparation de la réponse
return {
  processedResult: `J'ai traité votre message: "${userInput}"`,
  originalSessionId: sessionId  // Vous pouvez également renvoyer le sessionId si nécessaire
};
```

## Test de l'intégration mise à jour

Pour tester avec curl:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "chatInput": "Ceci est un test",
    "sessionId": "01234567-89ab-cdef-0123-456789abcdef",
    "timestamp": "2023-07-01T12:00:00Z"
  }' \
  https://your-n8n-instance.com/webhook/chat-webhook
``` 