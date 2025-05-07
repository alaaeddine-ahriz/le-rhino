import { NextResponse } from 'next/server';

// Endpoint pour que le client vérifie s'il y a de nouvelles réponses
export async function GET() {
  try {
    // Récupérer la dernière réponse, si elle existe
    const latestResponse = global.latestN8nResponse;
    
    // Debug info
    console.log('Vérification de nouvelles réponses:', 
      latestResponse 
        ? `Réponse trouvée: "${latestResponse.message.substring(0, 50)}${latestResponse.message.length > 50 ? '...' : ''}"` 
        : 'Aucune réponse disponible'
    );
    
    // Si nous avons une réponse, la retourner et la supprimer
    if (latestResponse) {
      // Réinitialiser après récupération pour éviter de renvoyer la même réponse
      global.latestN8nResponse = undefined;
      
      return NextResponse.json({
        success: true,
        data: latestResponse,
        debug: {
          messageLength: latestResponse.message.length,
          messagePreview: latestResponse.message.substring(0, 100),
          timestamp: latestResponse.timestamp.toISOString()
        }
      });
    }
    
    // Pas de nouvelle réponse
    return NextResponse.json({
      success: true,
      data: null,
      debug: {
        checkTime: new Date().toISOString(),
        globalStateEmpty: global.latestN8nResponse === undefined
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la réponse:', error);
    return NextResponse.json({ 
      error: 'Erreur de traitement',
      debug: { errorMessage: error instanceof Error ? error.message : 'Erreur inconnue' } 
    }, { status: 500 });
  }
} 