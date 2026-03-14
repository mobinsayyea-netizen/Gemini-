const https = require('https');

module.exports = async (req, res) => {
  const { text, key } = req.body || req.query || {};

  if (!text || !key) {
    return res.status(200).send("Server is Live. Send text and key.");
  }

  const data = JSON.stringify({
    input: { text },
    voice: { languageCode: "en-US", name: "en-US-Studio-O" },
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
      let body = Buffer.concat(chunks).toString();
      try {
        const json = JSON.parse(body);
        if (json.audioContent) {
          res.status(200).send(json.audioContent);
        } else {
          res.status(500).send("Google API Error: " + body);
        }
      } catch (e) {
        res.status(500).send("Parse Error");
      }
    });
  });

  gReq.on('error', (e) => res.status(500).send(e.message));
  gReq.write(data);
  gReq.end();
};
