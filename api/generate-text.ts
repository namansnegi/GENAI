// api/generate-text.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { audioFile } = req.body;

  try {
    const formData = new FormData();
    formData.append('file', audioFile, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'text');

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    res.status(200).json({ text: response.data });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
