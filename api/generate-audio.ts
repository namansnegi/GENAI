import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { feedbackText } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model: 'tts-1',
        voice: 'alloy',
        input: feedbackText,
      },
      {
        responseType: 'arraybuffer',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const arrayBuffer = response.data;
    const blob = new Blob([arrayBuffer], { type: 'audio/opus' });
    const audioUrl = URL.createObjectURL(blob);

    res.status(200).json({ audioUrl });
  } catch (error) {
    console.error('Error creating audio:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
