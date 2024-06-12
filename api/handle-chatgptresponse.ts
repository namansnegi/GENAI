// api/handle-chatgptresponse.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { messages, isSubmit, currentStep } = req.body;

  const generatePrompt = (
    messages: { role: string; content: string }[], 
    isSubmit: boolean, 
    currentStep: number,
  ) => {
    const prompt = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    if (isSubmit) {
      if (submitState.attempts === 1) {
        prompt.push({
          role: 'system',
          content: `Respond with a JSON object in French with following schema. DO not change this schema:
          "feedback": as a string thanking the user for the response, indicating whether the answer is correct or incorrect, do not know is also an incorrect answer and If incorrect, provide a hint to correct it but do not provide the correct answer and if the answer is correct explain it a little bit and then inform the user that you will now ask some questions on the code provided, and the user should answer them instantaneously
           "correct" as a boolean 
           "followUpQuestion" as a string in French if the user response is correct. follow-up question should test the user's understanding of the concepts used in the code and should not require writing additional code but should test comprehension of the purpose and usage of different parts of the code. Don not repeat the same question if it has already been asked. 
          `,
        });
      } else if (submitState.attempts === 2) {
        prompt.push({
          role: 'system',
          content: `
          Respond with a JSON object in French with following schema. DO not change this schema:
          "feedback": as a string thanking the user for the response, indicating whether the answer is correct or incorrect, do not know is also an incorrect answer and If incorrect, provide the correct answer and thank the user for participating. if the answer is correct explain it a little bit and then  inform the user that you will now ask some questions on the code provided, and the user should answer them instantaneously
           "correct" as a boolean 
           "followUpQuestion" as a string in French if the user response is correct. follow-up question should test the user's understanding of the concepts used in the code and should not require writing additional code but should test comprehension of the purpose and usage of different parts of the code. Don not repeat the same question if it has already been asked.`,
        });
      }
    } else if (submitState.currentStep === 3) {
      prompt.push({
        role: 'system',
        content: `
        Respond with a JSON object in French with following schema. Do not change this schema:
        "feedback": as a string in French to provide feedback on whether the answer to the follow-up question is correct or incorrect. Do not know is also an incorrect answer. The feedback should be based on the newest user response. If user response is incorrect, provide the correct answer. This is the end of the exercise, thank the user for participating.
         "correct" as a boolean 
         "followUpQuestion" as a string in French. no question is asked as this is the end of the exercise. Instead just thank the user for participating`,
      });
    } else {
      prompt.push({
        role: 'system',
        content: `
        Respond with a JSON object in French with following schema. DO not change this schema:
        "feedback": as a string in French to provide feedback on whether the answer to the follow-up question is correct or incorrect. Do not know is also an incorrect answer. The feedback should be based on the newest user response. If the user response is incorrect, provide the correct answer. If the answer is correct explain it a little bit
         "correct" as a boolean 
         "followUpQuestion" as a string in French. follow-up question should test the user's understanding of the concepts used in the code and should not require writing additional code but should test comprehension of the purpose and usage of different parts of the code. Don not repeat the same question if it has already been asked.`,
      });
    }

    return prompt;
  };

  try {
    const prompt = generatePrompt(messages, isSubmit, currentStep);
    console.log(prompt);
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
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      },
    );

    const responseText = response.data.choices[0].message.content;
    const responseData = JSON.parse(responseText);

    const feedbacktext = responseData.feedback;
    const isCorrect = responseData.correct;
    const followUpQuestion = responseData.followUpQuestion;

    res.status(200).json({ feedbacktext, isCorrect, followUpQuestion });
  } catch (error) {
    console.error('Error handling ChatGPT response:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
