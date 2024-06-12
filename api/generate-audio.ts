// api/generate-audio.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { feedbackText } = req.body;

  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: feedbackText,
    });

    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'audio/opus' });
    const audioUrl = URL.createObjectURL(blob);

    res.status(200).json({ audioUrl });
  } catch (error) {
    console.error('Error creating audio:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
