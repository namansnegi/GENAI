import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const apiKey = 'YOUR_OPENAI_API_KEY';

export default async function generateText(req: VercelRequest, res: VercelResponse) {
  try {
    const { audioFile } = req.body;
    const formData = new FormData();
    formData.append('file', audioFile, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'text');

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
}
