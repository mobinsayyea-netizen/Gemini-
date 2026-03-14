import https from 'https';

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  // Extract request body parameters
  const { text, key, voice } = req.body;

  // Validate required parameters
  if (!text) {
    res.status(400).json({ error: 'Text parameter is required.' });
    return;
  }

  if (!key) {
    res.status(400).json({ error: 'API Key (key) parameter is required.' });
    return;
  }

  // Set default voice if not provided
  const voiceName = voice || 'hi-IN-Wavenet-B';
  const languageCode = 'hi-IN';

  // Prepare the request payload for Google Cloud TTS API
  const payload = JSON.stringify({
    input: {
      text: text,
    },
    voice: {
      languageCode: languageCode,
      name: voiceName,
    },
    audioConfig: {
      audioEncoding: 'LINEAR16',
      sampleRateHertz: 16000,
      pitch: 0,
      speakingRate: 1.0,
    },
  });

  // Google Cloud TTS API endpoint
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`;

  // Parse the URL
  const urlObj = new URL(url);
  const options = {
    hostname: urlObj.hostname,
    path: urlObj.pathname + urlObj.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'application/json',
    },
  };

  // Wrap the request in a Promise to avoid Vercel timeout issues
  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let data = '';

      // Collect response data
      response.on('data', (chunk) => {
        data += chunk;
      });

      // Handle response completion
      response.on('end', () => {
        try {
          const responseData = JSON.parse(data);

          if (response.statusCode === 200 && responseData.audioContent) {
            // Success: return audio content in Base64
            res.status(200).json({
              success: true,
              audioContent: responseData.audioContent,
              contentType: 'audio/wav',
            });
            resolve();
          } else if (responseData.error) {
            // API returned an error
            res.status(response.statusCode || 400).json({
              error: responseData.error.message || 'Google Cloud TTS API error',
              code: responseData.error.code,
            });
            resolve();
          } else {
            res.status(500).json({ error: 'Unexpected response from Google Cloud TTS API' });
            resolve();
          }
        } catch (parseError) {
          res.status(500).json({ error: 'Failed to parse API response', details: parseError.message });
          resolve();
        }
      });
    });

    // Handle request errors
    request.on('error', (error) => {
      res.status(500).json({ error: 'Request failed', details: error.message });
      resolve();
    });

    // Send the payload
    request.write(payload);
    request.end();
  });
}