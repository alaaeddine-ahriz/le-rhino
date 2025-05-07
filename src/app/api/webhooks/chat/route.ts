import { NextResponse } from 'next/server';

// Déclaration pour étendre l'objet global
declare global {
  // We need to use var for global declarations to be properly hoisted and mutable
  // eslint-disable-next-line no-var
  var latestN8nResponse: {
    message: string;
    timestamp: Date;
    rawData?: Record<string, unknown>;
  } | undefined;
}

// Fonction pour envoyer une réponse au client via Server-Sent Events
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Pas de validation d'authentification
    
    // Traiter les données provenant de n8n
    console.log('Webhook reçu de n8n - données complètes:', JSON.stringify(data, null, 2));
    
    // Stocker à la fois la réponse brute (raw) et l'extraction standard
    const rawResponse = "RÉPONSE BRUTE: " + JSON.stringify(data);
    
    // Extraction du message de réponse pour le debug
    let responseMessage = "Message reçu par n8n";
    let sourceField = 'default';
    
    // Exploration récursive pour trouver une réponse dans un objet imbriqué
    const findResponseInNestedObject = (obj: unknown, depth: number = 0): string | null => {
      // Limite la profondeur d'exploration pour éviter les boucles infinies
      if (depth > 5 || !obj || typeof obj !== 'object') return null;
      
      const typedObj = obj as Record<string, unknown>;
      
      // Vérifier les champs standards à ce niveau
      if (typedObj.processedResult && typeof typedObj.processedResult === 'string') return typedObj.processedResult;
      if (typedObj.response && typeof typedObj.response === 'string') return typedObj.response;
      if (typedObj.message && typeof typedObj.message === 'string') return typedObj.message;
      
      // Exploration récursive pour les structures n8n courantes
      if (typedObj.data) {
        const dataResult = findResponseInNestedObject(typedObj.data, depth + 1);
        if (dataResult) return dataResult;
      }
      
      if (typedObj.results && Array.isArray(typedObj.results) && typedObj.results.length > 0) {
        for (const result of typedObj.results) {
          const resultData = findResponseInNestedObject(result, depth + 1);
          if (resultData) return resultData;
        }
      }
      
      if (typedObj.json) {
        const jsonResult = findResponseInNestedObject(typedObj.json, depth + 1);
        if (jsonResult) return jsonResult;
      }
      
      // Explorer tous les champs restants
      for (const key in typedObj) {
        if (typedObj[key] && typeof typedObj[key] === 'object') {
          const deepResult = findResponseInNestedObject(typedObj[key], depth + 1);
          if (deepResult) {
            console.log(`Trouvé réponse dans structure imbriquée à: ${key}`);
            return deepResult;
          }
        }
      }
      
      return null;
    };
    
    // Rechercher une réponse dans la structure imbriquée
    const nestedResponse = findResponseInNestedObject(data);
    if (nestedResponse) {
      responseMessage = nestedResponse;
      sourceField = 'structure-imbriquee';
      console.log(`Réponse trouvée dans une structure imbriquée: "${responseMessage.substring(0, 100)}${responseMessage.length > 100 ? '...' : ''}"`);
    }
    // Si pas de structure imbriquée, utiliser la logique existante
    else if (data.processedResult) {
      responseMessage = data.processedResult;
      sourceField = 'processedResult';
    } else if (data.response) {
      responseMessage = data.response;
      sourceField = 'response';
    } else if (data.message) {
      responseMessage = data.message;
      sourceField = 'message';
    } else {
      // Debug des clés disponibles dans la réponse
      console.log('Aucun champ attendu trouvé. Clés disponibles dans la réponse:', Object.keys(data));
      
      // Si un seul champ avec valeur string est disponible, on l'utilise
      const stringFields = Object.entries(data)
        .filter(([, value]) => typeof value === 'string')
        .map(([key, value]) => ({ key, value: value as string }));
      
      if (stringFields.length === 1) {
        responseMessage = stringFields[0].value;
        sourceField = `auto-détecté:${stringFields[0].key}`;
        console.log(`Utilisation automatique du champ '${stringFields[0].key}' comme réponse`);
      } else if (stringFields.length > 0) {
        console.log('Plusieurs champs string disponibles:', stringFields.map(f => f.key).join(', '));
      }
    }
    
    console.log(`Réponse extraite depuis '${sourceField}':`, responseMessage);
    console.log('Réponse brute utilisée comme message:', rawResponse);
    
    // Stockez temporairement la réponse pour qu'elle puisse être récupérée
    // Dans une vraie application, vous devriez utiliser une base de données ou un cache
    global.latestN8nResponse = {
      message: rawResponse, // Utiliser la réponse brute comme message
      timestamp: new Date(),
      rawData: data // Stocker aussi les données brutes
    };

    return NextResponse.json({ 
      success: true,
      message: "Réponse reçue et stockée",
      source: "raw-data",
      debug: {
        extractedMessage: responseMessage,
        rawResponse: rawResponse,
        originalData: data
      }
    });
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    return NextResponse.json({ error: 'Erreur de traitement' }, { status: 500 });
  }
} 