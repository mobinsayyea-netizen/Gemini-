const axios = require('axios');
​export default async function handler(req, res) {
const { text, key, voice = "en-US-Studio-O" } = req.body || req.query;
​if (!text || !key) {
return res.status(200).send("Server is Online. Please send text and key.");
}
​try {
const response = await axios.post(
https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${key},
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
}
