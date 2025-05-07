# Structure des données n8n et configuration correcte

Ce document explique comment configurer correctement n8n pour qu'il communique avec votre application.

## Structure typique des données n8n

n8n utilise souvent une structure de données imbriquée. Lorsque n8n envoie des données à un webhook, elles peuvent être structurées comme suit:

```json
{
  "executionId": "123456",
  "data": {
    "results": [
      {
        "json": {
          "response": "Voici la réponse que vous cherchez"
        }
      }
    ]
  }
}
```

Notre application est maintenant capable de détecter et d'extraire automatiquement les données de réponse même dans cette structure imbriquée.

## Configuration du nœud HTTP Request dans n8n

Pour configurer correctement le nœud HTTP Request dans n8n:

1. **Ajoutez un nœud HTTP Request** à votre workflow
2. **Configurez les paramètres suivants**:
   - **Méthode**: POST
   - **URL**: `http://votre-application.com/api/webhooks/chat` (remplacez par l'URL de votre serveur)
   - **Headers**: 
     ```
     {
       "Content-Type": "application/json"
     }
     ```
   - **Body**: Vous avez plusieurs options pour le format du corps:

### Option 1: Format simple (recommandé)

```json
{
  "response": "{{$node.previous.json.output}}"
}
```

### Option 2: Utiliser les données brutes du n8n

Cochez l'option "Send all data" dans le nœud HTTP Request de n8n. Cela enverra la structure complète, mais notre application pourra toujours trouver la réponse.

## Exemples de configurations dans n8n

### Exemple avec Function → HTTP Request

1. **Nœud Function**:
   ```javascript
   // Traitement du message reçu du webhook
   const inputMessage = $input.item.json.chatInput;
   
   // Votre logique de traitement ici
   const processedResponse = `Voici ma réponse à: ${inputMessage}`;
   
   // Retourner la réponse
   return {
     output: processedResponse
   };
   ```

2. **Nœud HTTP Request**:
   - **Méthode**: POST
   - **URL**: `http://votre-application.com/api/webhooks/chat`
   - **Headers**: `{ "Content-Type": "application/json" }`
   - **Body**:
     ```json
     {
       "response": "{{$node.Function.json.output}}"
     }
     ```

## Dépannage

Si vous rencontrez toujours des problèmes:

1. **Vérifiez les logs n8n**:
   - Ajoutez un nœud Debug avant le HTTP Request pour voir les données
   - Vérifiez si le nœud HTTP Request affiche des erreurs

2. **Vérifiez l'accessibilité**:
   - Assurez-vous que n8n peut accéder à votre serveur
   - Si vous développez en local, utilisez ngrok pour exposer votre serveur

3. **Testez manuellement**:
   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"response":"Ceci est un test"}' \
     http://votre-application.com/api/webhooks/chat
   ```

## Exemples de structures n8n prises en charge

L'application peut maintenant extraire automatiquement les réponses des structures suivantes:

```json
// Format simple
{
  "response": "Votre réponse ici"
}

// Format avec processedResult
{
  "processedResult": "Votre réponse ici"
}

// Format avec message
{
  "message": "Votre réponse ici"
}

// Structure imbriquée typique de n8n
{
  "data": {
    "results": [
      {
        "json": {
          "response": "Votre réponse ici"
        }
      }
    ]
  }
}

// Autres variantes de structures imbriquées
{
  "executionId": "123456",
  "data": {
    "response": "Votre réponse ici"
  }
}
``` 