// api/start-scenario.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { chatHistory } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: chatHistory,
        n: 1,
        stop: null,
        temperature: 0.9,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const initialResponse = response.data.choices[0].message.content;
    res.status(200).json({ initialResponse });
  } catch (error) {
    console.error('Error starting scenario:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
