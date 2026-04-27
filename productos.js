module.exports = async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Variables de entorno no configuradas.' });
  }

  try {
    const url = SUPABASE_URL + '/rest/v1/productos?disponible=eq.true&order=created_at.desc';
    const response = await fetch(url, {
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type':  'application/json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error Supabase: ' + response.status });
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Error interno: ' + err.message });
  }
}