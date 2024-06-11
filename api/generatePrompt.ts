import { VercelRequest, VercelResponse } from '@vercel/node';

export default function generatePrompt(req: VercelRequest, res: VercelResponse) {
  const { messages, isSubmit, currentStep, attempts } = req.body;
  let prompt = messages.map((message: { role: string; content: string }) => ({
    role: message.role,
    content: message.content,
  }));

  if (isSubmit) {
    if (attempts === 1) {
      prompt.push({
        role: 'system',
        content: `Respond with a JSON object in French with the following schema. Do not change this schema:
        "feedback": as a string thanking the user for the response, indicating whether the answer is correct or incorrect, 'do not know' is also an incorrect answer. If incorrect, provide a hint to correct it but do not provide the correct answer. If the answer is correct, explain it a little bit and then inform the user that you will now ask some questions on the code provided, and the user should answer them instantaneously.
        "correct": as a boolean.
        "followUpQuestion": as a string in French if the user response is correct. The follow-up question should test the user's understanding of the concepts used in the code and should not require writing additional code but should test comprehension of the purpose and usage of different parts of the code. Do not repeat the same question if it has already been asked.`,
      });
    } else if (attempts === 2) {
      prompt.push({
        role: 'system',
        content: `Respond with a JSON object in French with the following schema. Do not change this schema:
        "feedback": as a string thanking the user for the response, indicating whether the answer is correct or incorrect, 'do not know' is also an incorrect answer. If incorrect, provide the correct answer and thank the user for participating. If the answer is correct, explain it a little bit and then inform the user that you will now ask some questions on the code provided, and the user should answer them instantaneously.
        "correct": as a boolean.
        "followUpQuestion": as a string in French if the user response is correct. The follow-up question should test the user's understanding of the concepts used in the code and should not require writing additional code but should test comprehension of the purpose and usage of different parts of the code. Do not repeat the same question if it has already been asked.`,
      });
    }
  } else if (currentStep === 3) {
    prompt.push({
      role: 'system',
      content: `Respond with a JSON object in French with the following schema. Do not change this schema:
      "feedback": as a string in French to provide feedback on whether the answer to the follow-up question is correct or incorrect. 'Do not know' is also an incorrect answer. The feedback should be based on the newest user response. If the user response is incorrect, provide the correct answer. This is the end of the exercise, thank the user for participating.
      "correct": as a boolean.
      "followUpQuestion": as a string in French. No question is asked as this is the end of the exercise. Instead, just thank the user for participating.`,
    });
  } else {
    prompt.push({
      role: 'system',
      content: `Respond with a JSON object in French with the following schema. Do not change this schema:
      "feedback": as a string in French to provide feedback on whether the answer to the follow-up question is correct or incorrect. 'Do not know' is also an incorrect answer. The feedback should be based on the newest user response. If the user response is incorrect, provide the correct answer. If the answer is correct, explain it a little bit.
      "correct": as a boolean.
      "followUpQuestion": as a string in French. The follow-up question should test the user's understanding of the concepts used in the code and should not require writing additional code but should test comprehension of the purpose and usage of different parts of the code. Do not repeat the same question if it has already been asked.`,
    });
  }

  res.status(200).json({ prompt });
}
