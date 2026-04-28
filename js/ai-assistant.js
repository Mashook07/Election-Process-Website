// ============================================
// VoteGuide AI — Gemini AI Assistant
// ============================================

import { formatAIResponse } from './utils.js';

// IMPORTANT: Replace this with your newly generated API key.
// Ensure this key is strictly restricted in Google Cloud Console using HTTP Referrers!
const API_KEYS = [
  'AIzaSyBC3YKGA-p41UxeIlb4XvQCwFP1DxGF2C8', // Primary
  'AIzaSyAfufF-7dVKFFYfjrgk92tm4om2uL3Wm88'  // Backup
];
let currentKeyIndex = 0;

// Model fallback list - tries each until one succeeds
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
];

function getGeminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEYS[currentKeyIndex]}`;
}

const SYSTEM_PROMPT = `You are VoteGuide AI — India's official election education assistant. You MUST follow these rules strictly:

1. ONLY answer questions related to Indian elections, voting process, voter registration, ECI, EVMs, VVPAT, election laws, constitutional provisions about elections, and voter awareness.
2. NEVER recommend any political party or candidate. Be strictly APOLITICAL.
3. NEVER give political opinions, predictions, or biased information.
4. Always cite official sources like ECI, NVSP, Constitution of India when relevant.
5. Be helpful, accurate, and educational.
6. Support both English and Hindi questions.
7. Keep answers concise but informative (2-4 paragraphs max).
8. If asked something outside elections/voting, politely redirect to election topics.
9. Use official terminology: EPIC, EVM, VVPAT, NOTA, NVSP, ECI.
10. Encourage voter participation and democratic engagement.`;

let chatHistory = [];

async function callGemini(body) {
  let lastError = null;
  
  for (const model of MODELS) {
    let keyTriedCount = 0;
    
    // Try available keys for this model
    while (keyTriedCount < API_KEYS.length) {
      try {
        const res = await fetch(getGeminiUrl(model), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.warn(`Model ${model} failed with key index ${currentKeyIndex}:`, res.status, errData?.error?.message || '');
          lastError = errData?.error?.message || `HTTP ${res.status}`;
          
          // If Quota Exceeded (429), switch to the next backup key and retry the same model
          if (res.status === 429) {
            currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
            keyTriedCount++;
            continue; 
          }
          
          // For other errors (e.g., 400 Bad Request), break out and try the next model
          break;
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        
        lastError = 'Empty response from API';
        break; // Break key loop on empty response
        
      } catch (err) {
        console.warn(`Model ${model} network error:`, err.message);
        lastError = err.message;
        break; // Network error, try next model
      }
    }
    
    // If we get here and lastError isn't a 429, it means the model failed fundamentally, loop to next model.
  }
  
  throw new Error(lastError || 'All models and fallback keys failed. Please try again later.');
}

export async function askGemini(question) {
  chatHistory.push({ role: 'user', parts: [{ text: question }] });

  const body = {
    contents: [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'I understand. I am VoteGuide AI, an apolitical election education assistant for India. I will only provide factual, educational information about the election process. How can I help you?' }] },
      ...chatHistory
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  };

  try {
    const reply = await callGemini(body);
    chatHistory.push({ role: 'model', parts: [{ text: reply }] });
    return reply;
  } catch (error) {
    console.error('Gemini API error:', error);
    chatHistory.pop(); // Remove failed user message
    return `⚠️ Sorry, there was an error: ${error.message}. Please try again in a moment.`;
  }
}

export async function analyzeText(text) {
  const prompt = `Analyze the following election-related text. Provide:
1. **Summary**: A brief 2-3 sentence summary
2. **Key Entities**: Important names, organizations, dates, and places mentioned
3. **Election Relevance**: How this relates to Indian elections
4. **Key Takeaways**: 3-4 bullet points of important information

Text to analyze:
"${text}"

Remember: Stay apolitical. Focus on factual analysis only.`;

  try {
    return await callGemini({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 1024 }
    });
  } catch (error) {
    return `⚠️ Analysis error: ${error.message}. Please try again.`;
  }
}

export async function translateText(text, targetLang) {
  const prompt = `Translate the following election-education text to ${targetLang}. Keep election terminology accurate. Only return the translation, nothing else.

Text: "${text}"`;

  try {
    return await callGemini({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
    });
  } catch (error) {
    return `⚠️ Translation error: ${error.message}. Please try again.`;
  }
}

export async function ocrVoterID(imageBase64) {
  const prompt = `This is an image of an Indian Voter ID card (EPIC). Please extract the following information if visible:
1. EPIC Number (Voter ID Number)
2. Name of the Elector
3. Father's/Husband's Name
4. Date of Birth / Age
5. Gender
6. Address
7. Part Number and Part Name

Format the output clearly. If any field is not visible, mention "Not clearly visible". This is for educational/verification purposes only.`;

  try {
    return await callGemini({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
        ]
      }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 512 }
    });
  } catch (error) {
    return `⚠️ OCR error: ${error.message}. Please ensure the image is clear and try again.`;
  }
}

export function clearChatHistory() {
  chatHistory = [];
}
