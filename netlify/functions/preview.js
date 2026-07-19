exports.handler = async (event) => {
  const url = event.queryStringParameters?.url;

  if (!url) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No URL' }) };
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid URL' }) };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid protocol' }) };
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; homestead-preview/1.0; +https://homestead.exchange)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(6000),
    });

    const html = await res.text();

    const og = (prop) => {
      const a = html.match(new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'));
      const b = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, 'i'));
      return (a || b)?.[1]?.trim() ?? null;
    };

    const meta = (name) => {
      const a = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'));
      const b = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i'));
      return (a || b)?.[1]?.trim() ?? null;
    };

    const titleEl = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? null;

    const title = og('og:title') || meta('twitter:title') || titleEl;
    const description = og('og:description') || meta('description') || meta('twitter:description');
    let image = og('og:image') || meta('twitter:image');

    // Resolve relative image URLs
    if (image && !image.startsWith('http')) {
      image = new URL(image, parsed.origin).href;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
      body: JSON.stringify({ title, description, image, domain: parsed.hostname }),
    };
  } catch {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: null, description: null, image: null, domain: parsed.hostname }),
    };
  }
};
