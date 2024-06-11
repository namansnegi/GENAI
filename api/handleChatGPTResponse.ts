import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const apiKey = 'YOUR_OPENAI_API_KEY';

export default async function handleChatGPTResponse(req: VercelRequest, res: VercelResponse) {
  try {
    const { messages, isSubmit, currentStep, attempts } = req.body;
    const prompt = generatePrompt(messages, isSubmit, currentStep);

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: prompt,
        n: 1,
        stop: null,
        temperature: 0.9,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    const responseText = response.data.choices[0].message.content;
    const responseData = JSON.parse(responseText);

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error handling ChatGPT response:', error);
    res.status(500).json({ error: 'Failed to handle ChatGPT response' });
  }
}

function generatePrompt(messages, isSubmit, currentStep) {
  // Add your prompt generation logic here
  return prompt;
}
