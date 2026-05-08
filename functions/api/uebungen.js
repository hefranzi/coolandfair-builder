export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const response = await fetch(
    'https://api.webflow.com/v2/collections/69fcb6c71a1eca983718aab9/items?limit=100',
    {
      headers: {
        'Authorization': `Bearer ${context.env.WEBFLOW_API_TOKEN}`,
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

  const exercises = data.items.map(item => ({
    id:        item.fieldData['ubungs-id'],
    title:     item.fieldData['name'],
    cat:       item.fieldData['kategorie'],
    catLabel:  item.fieldData['kategorie-label'],
    dauer:     item.fieldData['dauer-minuten'],
    ziel:      item.fieldData['ziel'],
    ablauf:    item.fieldData['ablauf'],
    variation: item.fieldData['variation'] || null,
    reflexion: item.fieldData['reflexionsfragen'],
    sortierung: item.fieldData['sortierung'] ?? 99,
  }));

  exercises.sort((a, b) => a.sortierung - b.sortierung);

  return new Response(JSON.stringify(exercises), { headers: corsHeaders });
}
