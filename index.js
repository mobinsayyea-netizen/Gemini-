const axios = require('axios');

module.exports = async (req, res) => {
  // CORS और मेथड चेक
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { text, key, voice = "en-US-Studio-O" } = req.body || req.query;

  if (!text || !key) {
    return res.status(400).send("Text and Key are required.");
  }

  try {
    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${key}`,
      {
        input: { text: text },
        voice: { languageCode: "en-US", name: voice },
        audioConfig: { audioEncoding: "LINEAR16" }
      }
    );

    res.status(200).send(response.data.audioContent);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
