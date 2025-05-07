# Configuration de l'intégration avec n8n

Ce document complète l'implémentation technique de l'intégration du chat avec n8n.

## Étapes finales de configuration

1. Créez un fichier `.env.local` à la racine du projet avec la variable suivante:

```
# Configuration du webhook n8n
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/chat-webhook
```

2. Remplacez la valeur par votre propre URL webhook n8n

## Configuration de n8n

1. Suivez les instructions d'installation de n8n dans le fichier README-N8N-INTEGRATION.md
2. Créez un workflow dans n8n avec les composants suivants :
   - Un nœud Webhook qui reçoit les messages du chat (sans authentification)
   - Un nœud Function qui traite les données
   - Un nœud HTTP Request qui envoie les réponses à votre API

## Test de l'intégration

1. Lancez votre application:
   ```bash
   npm run dev
   ```

2. Ouvrez la page de chat
3. Envoyez un message
4. Vérifiez les logs de la console pour confirmer que le message a été envoyé au webhook
5. Vérifiez dans n8n que le webhook a reçu la requête

## Dépannage

Si vous rencontrez des problèmes:

1. Vérifiez que la variable d'environnement NEXT_PUBLIC_N8N_WEBHOOK_URL est correctement configurée
2. Assurez-vous que n8n est en cours d'exécution et accessible
3. Vérifiez les logs de la console pour les erreurs
4. Testez le webhook directement avec cURL ou Postman:
   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"userId":"test123","message":"Ceci est un test","timestamp":"2023-07-01T12:00:00Z"}' \
     https://your-n8n-instance.com/webhook/chat-webhook
   ```

## Personnalisation supplémentaire

Pour personnaliser davantage cette intégration:

1. Modifiez `src/lib/webhookService.ts` pour ajouter des paramètres supplémentaires ou modifier le format des données
2. Étendez `src/app/api/webhooks/chat/route.ts` pour traiter les réponses de n8n de manière spécifique
3. Ajoutez plus de logique dans votre flux de travail n8n 