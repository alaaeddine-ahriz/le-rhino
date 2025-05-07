# Guide d'implémentation du système de réponses n8n par polling

Ce document explique le fonctionnement du nouveau système permettant au chat de recevoir les réponses de n8n via polling.

## Vue d'ensemble

Dans la nouvelle implémentation, nous avons:

1. Supprimé la réponse simulée automatique du chat
2. Implémenté un mécanisme de stockage temporaire des réponses n8n
3. Ajouté un système de polling pour récupérer ces réponses
4. Mis à jour le composant Chat pour afficher les vraies réponses de n8n

## Fonctionnement technique

### 1. Traitement des réponses entrantes (webhook)

Lorsque n8n envoie une réponse au webhook (`/api/webhooks/chat/route.ts`), celle-ci est:
- Traitée pour extraire le message
- Stockée temporairement dans `global.latestN8nResponse`
- Le webhook renvoie une confirmation à n8n

### 2. Récupération des réponses par le client

Le composant Chat interroge régulièrement l'endpoint `/api/webhooks/chat/check` qui:
- Vérifie si une nouvelle réponse est disponible
- Si oui, la renvoie et la supprime du stockage temporaire 
- Si non, renvoie un résultat null

### 3. Affichage dans l'interface

Le composant Chat:
- Commence le polling après l'envoi d'un message
- Affiche l'indicateur de chargement jusqu'à réception d'une réponse
- Ajoute la réponse de n8n au chat dès qu'elle est reçue

## Configuration de n8n

Pour que ce système fonctionne correctement, assurez-vous que votre workflow n8n:

1. Reçoit les messages via le nœud Webhook
2. Traite le message selon vos besoins 
3. Envoie une réponse à votre API avec l'une des structures suivantes:
   ```json
   {
     "processedResult": "Votre réponse ici"
   }
   ```
   ou
   ```json
   {
     "response": "Votre réponse ici"
   }
   ```
   ou
   ```json
   {
     "message": "Votre réponse ici"
   }
   ```

## Limites actuelles et améliorations possibles

1. **Stockage temporaire**: Le stockage dans `global` est une solution temporaire. Pour une application en production, utilisez une base de données ou un cache Redis.

2. **Gestion des sessions**: L'implémentation actuelle ne gère pas les sessions utilisateur - une seule réponse globale est stockée à la fois.

3. **Timeout**: Pas de mécanisme de timeout si n8n ne répond jamais. Envisagez d'ajouter un timeout qui désactive l'état de chargement après un certain temps.

4. **Notifications en temps réel**: Le polling pourrait être remplacé par des WebSockets ou Server-Sent Events pour une communication en temps réel.

## Test et dépannage

Pour tester l'intégration:

1. Envoyez un message depuis le chat
2. Vérifiez les logs du serveur pour voir la requête au webhook n8n
3. Envoyez une réponse à l'API avec curl:
   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"processedResult":"Voici une réponse de test de n8n"}' \
     http://localhost:3000/api/webhooks/chat
   ```
4. Observez la réponse apparaître dans le chat

Si la réponse n'apparaît pas:
- Vérifiez les logs de la console pour les erreurs
- Confirmez que le polling fonctionne (observez les requêtes réseau dans les outils de développement)
- Assurez-vous que n8n envoie les données dans le format attendu 