import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handleNEOAIButtonClick(req: VercelRequest, res: VercelResponse) {
  // Handle the button click logic
  res.status(200).json({ message: 'Button clicked' });
}
