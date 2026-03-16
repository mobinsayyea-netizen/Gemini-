const axios = require('axios');
​export default async function handler(req, res) {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
​if (req.method === 'OPTIONS') return res.status(200).end();
​const { text, key, voice } = req.body || req.query;
​if (!text || !key) {
return res.status(400).json({ error: "Text and Key are required." });
}
​let voiceName = "en-US-Journey-D";
​if (voice) {
if (voice.includes("Puck")) voiceName = "en-US-Journey-D";
else if (voice.includes("Charon")) voiceName = "en-US-Journey-F";
else if (voice.includes("Kore")) voiceName = "en-US-Journey-O";
else if (voice.includes("Fenrir")) voiceName = "en-US-Journey-D";
else if (voice.includes("Leda")) voiceName = "en-US-Journey-O";
else if (voice.includes("Female")) voiceName = "en-US-Studio-O";
else if (voice.includes("Male")) voiceName = "en-US-Studio-Q";
}
​try {
const response = await axios.post(
https://texttospeech.googleapis.com/v1/text:synthesize?key=${key},
{
input: { text: text },
voice: { languageCode: "en-US", name: voiceName },
audioConfig: { audioEncoding: "MP3" }
}
);
​res.status(200).json({
audioContent: response.data.audioContent
});
​} catch (error) {
res.status(500).json({
error: "Google API Error",
message: error.response ? error.response.data : error.message
});
}
}
