# Débogage de l'intégration n8n

Ce document explique comment utiliser les fonctionnalités de débogage ajoutées à l'intégration n8n.

## Logs de débogage côté serveur

Des logs de débogage détaillés ont été ajoutés pour faciliter l'identification des problèmes potentiels avec les réponses n8n. Le serveur affichera maintenant:

1. **Données complètes reçues** - Affiche tout le JSON reçu de n8n
   ```
   Webhook reçu de n8n - données complètes: {
     // JSON complet
   }
   ```

2. **Auto-détection de champs alternatifs** - Si aucun des champs attendus (`processedResult`, `response`, `message`) n'est trouvé:
   ```
   Aucun champ attendu trouvé. Clés disponibles dans la réponse: [liste des clés]
   ```

3. **Détection automatique** - Si un seul champ de type string est trouvé dans la réponse:
   ```
   Utilisation automatique du champ 'nomDuChamp' comme réponse
   ```

4. **Source du message extraite** - Indique d'où provient la réponse utilisée:
   ```
   Réponse extraite depuis 'sourceField': contenu de la réponse
   ```

5. **Vérification des réponses** - Lors de la vérification par le client:
   ```
   Vérification de nouvelles réponses: Réponse trouvée: "début du message..."
   ```

## Réponse HTTP améliorée

Les réponses HTTP incluent maintenant des informations de débogage:

### 1. Réponse du webhook (/api/webhooks/chat)

```json
{
  "success": true,
  "message": "Réponse reçue et stockée",
  "source": "processedResult", // ou le champ source
  "debug": {
    "extractedMessage": "Le message extrait",
    "originalData": {
      // Données originales complètes
    }
  }
}
```

### 2. Réponse de vérification (/api/webhooks/chat/check)

Quand une réponse est disponible:
```json
{
  "success": true,
  "data": {
    "message": "Message complet",
    "timestamp": "2023-07-01T12:00:00.000Z"
  },
  "debug": {
    "messageLength": 42,
    "messagePreview": "Début du message (jusqu'à 100 caractères)...",
    "timestamp": "2023-07-01T12:00:00.000Z"
  }
}
```

Quand aucune réponse n'est disponible:
```json
{
  "success": true,
  "data": null,
  "debug": {
    "checkTime": "2023-07-01T12:00:00.000Z",
    "globalStateEmpty": true
  }
}
```

## Format flexible pour les réponses

Le système peut maintenant détecter automatiquement les réponses, même si elles ne suivent pas exactement le format attendu:

1. Si l'un des champs standards est présent (`processedResult`, `response`, `message`), il sera utilisé.
2. Si aucun champ standard n'est trouvé mais qu'un seul champ de type string existe, ce champ sera utilisé.
3. Si plusieurs champs string sont disponibles, le champ par défaut sera utilisé et les champs disponibles seront listés dans les logs.

## Comment déboguer les problèmes

### 1. Vérifier les logs côté serveur

Surveillez la sortie de la console de votre serveur Next.js pour voir les logs détaillés.

### 2. Inspecter les réponses réseau

Utilisez les outils de développement du navigateur (F12) pour:
- Vérifier la requête envoyée à n8n (POST vers le webhook n8n)
- Vérifier les réponses reçues lors des requêtes de polling

### 3. Tester avec un curl personnalisé

Vous pouvez tester différents formats de réponse avec curl:

```bash
# Réponse au format standard
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"processedResult":"Ceci est une réponse test"}' \
  http://localhost:3000/api/webhooks/chat

# Réponse avec format non standard
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"customField":"Ceci est une réponse non standard"}' \
  http://localhost:3000/api/webhooks/chat
```

### 4. Vérifier la réponse stockée

```bash
curl http://localhost:3000/api/webhooks/chat/check
``` 