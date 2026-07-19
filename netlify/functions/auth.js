exports.handler = async (event) => {
  const code = event.queryStringParameters?.code;

  if (!code) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No code provided' }) };
  }

  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await res.json();

    if (data.access_token) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.access_token }),
      };
    }

    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: data.error || 'no_access_token',
        error_description: data.error_description || JSON.stringify(data),
        debug_has_client_id: !!process.env.GITHUB_CLIENT_ID,
        debug_has_client_secret: !!process.env.GITHUB_CLIENT_SECRET,
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'function_error',
        error_description: e.message,
        debug_has_client_id: !!process.env.GITHUB_CLIENT_ID,
        debug_has_client_secret: !!process.env.GITHUB_CLIENT_SECRET,
      }),
    };
  }
};
