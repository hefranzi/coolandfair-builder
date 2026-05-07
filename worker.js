// Cloudflare Worker – Cool and Fair CMS Proxy
// Dieser Worker leitet Anfragen vom Builder an die Webflow CMS API weiter.
// Der API-Key bleibt dabei serverseitig und ist nie im Browser sichtbar.

export default {
  async fetch(request, env) {

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Content-Type': 'application/json',
    };

    // OPTIONS-Anfragen (Browser Preflight) direkt beantworten
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/uebungen') {
      const response = await fetch(
        'https://api.webflow.com/v2/collections/69fcb6c71a1eca983718aab9/items?limit=100',
        {
          headers: {
            'Authorization': `Bearer ${env.WEBFLOW_API_TOKEN}`,
            'accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: 'Webflow API nicht erreichbar' }),
          { status: 502, headers: corsHeaders }
        );
      }

      const data = await response.json();

      // Felder mappen: Webflow-Feldnamen → Builder-Feldnamen
      const exercises = data.items.map(item => ({
        id:       item.fieldData['ubungs-id'],
        title:    item.fieldData['name'],
        cat:      item.fieldData['kategorie'],
        catLabel: item.fieldData['kategorie-label'],
        dauer:    item.fieldData['dauer-minuten'],
        ziel:     item.fieldData['ziel'],
        ablauf:   item.fieldData['ablauf'],
        variation: item.fieldData['variation'] || null,
        reflexion: item.fieldData['reflexionsfragen'],
        sortierung: item.fieldData['sortierung'] ?? 99,
      }));

      // Nach Sortierungsnummer ordnen (E1=1, E2=2 ... T8=24)
      exercises.sort((a, b) => a.sortierung - b.sortierung);

      return new Response(JSON.stringify(exercises), { headers: corsHeaders });
    }

    // Alle anderen Pfade: 404
    return new Response('Not found', { status: 404 });
  }
};
