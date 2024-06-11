import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const apiKey = 'YOUR_OPENAI_API_KEY';
const openai = new OpenAI({ apiKey });

export default async function generateAudio(req: VercelRequest, res: VercelResponse) {
  try {
    const { feedbackText } = req.body;
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
    res.status(500).json({ error: 'Failed to generate audio' });
  }
}
