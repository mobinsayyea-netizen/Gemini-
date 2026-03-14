const https = require('https');

module.exports = async (req, res) => {
  // CORS प्री-फ्लाइट
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { text, key, voice } = req.body || {};

  if (!text || !key) {
    return res.status(200).send("Server is Online. Please send text and key.");
  }

  // गूगल को भेजने के लिए डेटा तैयार करना
  const data = JSON.stringify({
    input: { text: text },
    voice: { 
      languageCode: voice ? voice.substring(0, 5) : "en-US", 
      name: voice || "en-US-Studio-O" 
    },
    audioConfig: { audioEncoding: "LINEAR16" }
  });

  const options = {
    hostname: 'texttospeech.googleapis.com',
    path: `/v1beta1/text:synthesize?key=${key}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const gReq = https.request(options, (gRes) => {
    let chunks = [];
    gRes.on('data', (d) => chunks.push(d));
    gRes.on('end', () => {
      const responseBody = Buffer.concat(chunks).toString();
      try {
        const json = JSON.parse(responseBody);
        if (json.audioContent) {
          res.status(200).send(json.audioContent);
        } else {
          // गूगल का असली एरर यहाँ पकड़ में आएगा
          res.status(200).send("GOOGLE_ERROR: " + (json.error ? json.error.message : responseBody));
        }
      } catch (e) {
        res.status(200).send("PARSE_ERROR: " + responseBody);
      }
    });
  });

  gReq.on('error', (e) => {
    res.status(200).send("REQUEST_ERROR: " + e.message);
  });

  gReq.write(data);
  gReq.end();
};
