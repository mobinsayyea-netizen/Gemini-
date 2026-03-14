const https = require('https');

module.exports = async (req, res) => {
  const { text, key, voice = "en-US-Studio-O" } = req.body || req.query;

  if (!text || !key) {
    return res.status(200).send("Server Online");
  }

  const data = JSON.stringify({
    input: { text: text },
    voice: { languageCode: "en-US", name: voice },
    audioConfig: { audioEncoding: "LINEAR16" }
  });

  const options = {
    hostname: 'texttospeech.googleapis.com',
    path: `/v1beta1/text:synthesize?key=${key}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const gReq = https.request(options, (gRes) => {
    let body = '';
    gRes.on('data', (chunk) => body += chunk);
    gRes.on('end', () => {
      const jsonRes = JSON.parse(body);
      res.status(200).send(jsonRes.audioContent);
    });
  });

  gReq.on('error', (e) => res.status(500).send(e.message));
  gReq.write(data);
  gReq.end();
};
