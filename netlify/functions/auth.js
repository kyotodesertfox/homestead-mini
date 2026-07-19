exports.handler = async (event) => {
  const code = event.queryStringParameters?.code;

  if (!code) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No code provided' }) };
  }

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

  if (data.error) {
    return { statusCode: 400, body: JSON.stringify(data) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: data.access_token }),
  };
};
