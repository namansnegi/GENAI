import AudioMotionAnalyzer from 'audiomotion-analyzer';
import axios from 'axios';
import './style.css';

let isPlaying: boolean = false;
let isWriting: boolean = false;
let micStream: MediaStreamAudioSourceNode;
let mediaRecorder: MediaRecorder;
let chunks: BlobPart[] = [];
let submitState = {
  currentStep: 0,
  attempts: 0,
};

export function createAudioButton(
  audioMotion: AudioMotionAnalyzer,
  audioPath: string,
  state: number,
  isCorrect: boolean,
  question: string,
) {
  console.log('Create audio button called');
  const audio = new Audio(audioPath);

  playAudio(audio, audioMotion);
  typingEffectFunction(question);

  audio.addEventListener('ended', () => {
    isPlaying = false;
    console.log('Audio ended');

    if (state === 0 && isCorrect) {
      activateMic(audioMotion);
    } else if (state === 1 || state === 2) {
      activateMic(audioMotion);
    }
  });
}

export function playAudio(audio: HTMLAudioElement, audioMotion: AudioMotionAnalyzer) {
  if (!isPlaying) {
    audioMotion.disconnectInput(micStream, true);
    audioMotion.connectInput(audio);
    audioMotion.volume = 1;
    audioMotion.gradient = 'steelblue';
    audio.play();
    isPlaying = true;
  }
}

export function typingEffectFunction(text: string) {
  const editorProblemStatement = document.getElementById('editorProblemStatement');
  if (!editorProblemStatement) {
    throw new Error("Element 'editorProblemStatement' not found");
  }

  if (!isWriting) {
    isWriting = true;
    editorProblemStatement.innerHTML = '';

    const regex = /(<[^>]+>)/g;
    const textSegments = text.split(regex).filter(Boolean);
    let currentSegment = 0;
    let i = 0;

    const typingEffect = setInterval(() => {
      if (currentSegment < textSegments.length) {
        const segment = textSegments[currentSegment];
        if (segment.match(regex)) {
          // If the segment is an HTML tag, insert it directly and move to the next segment
          editorProblemStatement.insertAdjacentHTML('beforeend', segment);
          currentSegment++;
        } else {
          // If the segment is text, insert it character by character
          if (i < segment.length) {
            editorProblemStatement.insertAdjacentText('beforeend', segment.charAt(i));
            i++;
          } else {
            currentSegment++;
            i = 0;
          }
        }
      } else {
        clearInterval(typingEffect);
        isWriting = false;
      }
    }, 46);
  }
}

export function activateMic(audioMotion: AudioMotionAnalyzer) {
  console.log('Requesting microphone access...');

  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then((stream) => {
      console.log('Microphone access granted');

      // Create stream using audioMotion audio context
      micStream = audioMotion.audioCtx.createMediaStreamSource(stream);
      // Connect microphone stream to analyzer
      audioMotion.connectInput(micStream);
      // Mute output to prevent feedback loops from the speakers
      audioMotion.volume = 0;
      audioMotion.gradient = 'orangered';

      const options = { mimeType: 'audio/webm' }; // Ensure the MIME type is supported
      mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          console.log('Data available:', event.data);
        }
      };
      mediaRecorder.onstop = () => {
        console.log('Recording stopped, chunks:', chunks);
      };
      mediaRecorder.start();
      console.log('MediaRecorder started:', mediaRecorder);
    })
    .catch((err) => {
      console.error('Error accessing microphone:', err);
      alert('Microphone access denied by user');
    });
}

export async function generateAudio(feedbackText: string): Promise<string> {
  try {
    const response = await axios.post('/api/generate-audio', { feedbackText });
    return response.data.audioUrl;
  } catch (error) {
    console.error('Error creating audio:', error);
    throw error;
  }
}

export async function handleNEOAIButtonClick(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Stop the recording
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    mediaRecorder.onstop = async () => {
      if (chunks.length === 0) {
        console.error('No audio data recorded.');
        return reject('No audio data recorded.');
      }

      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], 'response.webm', {
        type: 'audio/webm',
      });
      chunks = [];

      try {
        const formData = new FormData();
        formData.append('audioFile', audioFile);

        const response = await axios.post('/api/handle-neoaibuttonclick', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        resolve(response.data.text);
      } catch (error) {
        console.error('Error generating text:', error);
        reject(error);
      }
    };
  });
}

export const generatePrompt = (
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

export const handleChatGPTResponse = async (
  messages: { role: string; content: string }[],
  isSubmit: boolean,
  currentStep: number,
  attempts: number,
) => {
  try {
    const response = await axios.post('/api/handle-chatgptresponse', {
      messages,
      isSubmit,
      currentStep,
      attempts,
    });

    const { feedbacktext, isCorrect, followUpQuestion } = response.data;

    let feedback = feedbacktext;
    if (followUpQuestion) {
      feedback += `<br><br>${followUpQuestion}`;
    }
    const audioFile = await generateAudio(feedback);

    return { feedback, isCorrect, audioFile };
  } catch (error) {
    console.error('Error handling ChatGPT response:', error);
    throw error;
  }
};

const fetchAndDisplayFeedback = async (
  event: MouseEvent,
  chatHistory: any[],
  isSubmit: boolean,
  currentStep: number,
  attempts: number,
  audioMotion: AudioMotionAnalyzer,
) => {
  event.preventDefault();

  const { feedback, isCorrect, audioFile } = await handleChatGPTResponse(
    chatHistory,
    isSubmit,
    currentStep,
    attempts,
  );

  // Update chat history
  chatHistory.push({
    role: 'assistant',
    content: feedback,
  });

  createAudioButton(audioMotion, audioFile, currentStep, isCorrect, feedback);

  return isCorrect;
};

const addUserResponseToChatHistory = (
  chatHistory: any[],
  editorResponse: HTMLDivElement,
) => {
  const userResponse = editorResponse.innerText;
  console.log('User response:', userResponse);

  chatHistory.push({
    role: 'user',
    content: `User's response: ${userResponse}`,
  });
};

export async function handleButtonClick(
  event: MouseEvent,
  chatHistory: any[],
  submitButton: HTMLButtonElement | null,
  editorResponse: HTMLDivElement,
  audioMotion: AudioMotionAnalyzer,
) {
  console.log('chat history', chatHistory);
  if (submitState.currentStep === 0) {
    submitState.attempts++;
    await addUserResponseToChatHistory(chatHistory, editorResponse);
    const isCorrect = await fetchAndDisplayFeedback(
      event,
      chatHistory,
      true,
      submitState.currentStep,
      submitState.attempts,
      audioMotion,
    );

    console.log('correct', isCorrect);
    console.log('currentStep', submitState.currentStep);

    if (isCorrect) {
      submitState.currentStep++;
      submitButton!.textContent = 'Next';
      console.log('This is happening');
    } else if (submitState.attempts === 2) {
      submitButton!.textContent = 'Thanks';
      submitButton!.disabled = true;
    }
  } else {
    try {
      const userResponse = await handleNEOAIButtonClick();
      chatHistory.push({
        role: 'user',
        content: `User's response: ${userResponse}`,
      });

      await fetchAndDisplayFeedback(
        event,
        chatHistory,
        false,
        submitState.currentStep,
        submitState.attempts,
        audioMotion,
      );

      submitState.currentStep++;

      console.log('Incremented currentStep:', submitState.currentStep);

      if (submitState.currentStep > 3) {
        submitButton!.textContent = 'Thanks';
        submitButton!.disabled = true;
        console.log('Button text set to "Thanks" and disabled');
      }
    } catch (error) {
      console.error('Error handling button click:', error);
    }
  }
}

export async function loadScenario(
  audioMotion: AudioMotionAnalyzer,
  audioPath: string,
  scenario: string,
): Promise<void> {
  try {
    const audio = new Audio(audioPath);

    playAudio(audio, audioMotion);
    typingEffectFunction(scenario);

    audio.addEventListener('ended', () => {
      isPlaying = false;
      console.log('Audio ended', isPlaying);
    });
  } catch (error) {
    console.error('Error loading scenario:', error);
  }
}

export async function startScenario(
  chatHistory: any[],
  audioMotion: AudioMotionAnalyzer,
): Promise<void> {
  try {
    console.log('Starting scenario...', chatHistory);
    const initialResponse = await axios.post('/api/start-scenario', { chatHistory });

    console.log('Response to start', initialResponse);

    chatHistory.push({ role: 'assistant', content: initialResponse.data });

    const audiofile = await generateAudio(initialResponse.data);
    const audio = new Audio(audiofile);

    playAudio(audio, audioMotion);
    typingEffectFunction(initialResponse.data);

    audio.addEventListener('ended', () => {
      isPlaying = false;
      console.log('Audio ended');
      activateMic(audioMotion);
    });
  } catch (error) {
    console.error('Error starting scenario:', error);
  }
}

export async function continueScenario(
  chatHistory: any[],
  audioMotion: AudioMotionAnalyzer,
): Promise<void> {
  try {
    const userResponse = await handleNEOAIButtonClick();
    chatHistory.push({
      role: 'user',
      content: `User's response: ${userResponse}`,
    });

    chatHistory.push({
      role: 'system',
      content: `Continuer le scénario en répondant à la réponse de l'utilisateur. Soyez bref et précis et montrez que vous n'êtes pas satisfait.`,
    });

    const response = await axios.post('/api/continue-scenario', { chatHistory });

    console.log('Response to continue', response);

    chatHistory.push({ role: 'assistant', content: response.data });

    const audiofile = await generateAudio(response.data);
    const audio = new Audio(audiofile);

    playAudio(audio, audioMotion);
    typingEffectFunction(response.data);

    audio.addEventListener('ended', () => {
      isPlaying = false;
      console.log('Audio ended');
      activateMic(audioMotion);
    });
  } catch (error) {
    console.error('Error continuing scenario:', error);
  }
}

