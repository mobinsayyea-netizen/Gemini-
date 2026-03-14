const axios = require('axios');
​module.exports = async (req, res) => {
if (req.method !== 'POST') {
return res.status(405).send('Method Not Allowed');
}
​const { text, key, voice = "en-US-Studio-O" } = req.body;
​try {
const response = await axios.post(
https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${key},
{
input: { text: text },
voice: { languageCode: "en-US", name: voice },
audioConfig: { audioEncoding: "LINEAR16" }
}
);
​res.status(200).send(response.data.audioContent);
} catch (error) {
res.status(error.response?.status || 500).send(error.message);
}
};
