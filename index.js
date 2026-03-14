const https = require('https');

module.exports = async (req, res) => {
  // CORS Permissions
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // डेटा को सही तरीके से पढ़ना
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  
  req.on('end', () => {
    try {
      const parsedBody = JSON.parse(body);
      const { text, key, voice } = parsedBody;

      if (!text || !key) {
        return res.status(200).send("MISSING_DATA: Text and Key are required.");
      }

      const googleData = JSON.stringify({
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
          'Content-Length': Buffer.byteLength(googleData)
        }
      };

      const gReq = https.request(options, (gRes) => {
        let chunks = [];
        gRes.on('data', (d) => chunks.push(d));
        gRes.on('end', () => {
          const responseBody = Buffer.concat(chunks).toString();
          const json = JSON.parse(responseBody);
          if (json.audioContent) {
            res.status(200).send(json.audioContent);
          } else {
            res.status(200).send("GOOGLE_ERROR: " + (json.error ? json.error.message : "Unknown Error"));
          }
        });
      });

      gReq.on('error', (e) => res.status(200).send("REQUEST_ERROR: " + e.message));
      gReq.write(googleData);
      gReq.end();

    } catch (e) {
      res.status(200).send("SERVER_PARSE_ERROR: " + e.message);
    }
  });
};
