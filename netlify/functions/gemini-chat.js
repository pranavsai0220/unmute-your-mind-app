// netlify/functions/gemini-chat.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// IMPORTANT: Your Gemini API Key should be set as an environment variable in Netlify.
// Go to Netlify Dashboard -> Your Site -> Site settings -> Build & deploy -> Environment variables
// Add a new variable: Key = GEMINI_API_KEY, Value = YOUR_ACTUAL_GEMINI_API_KEY
const API_KEY = process.env.GEMINI_API_KEY; // This will be set securely in Netlify

// Ensure the API_KEY is available
if (!API_KEY) {
  console.error("GEMINI_API_KEY environment variable is not set!");
  // This function will likely fail without the key, but we'll try to handle it gracefully.
}

const genAI = new GoogleGenerativeAI(API_KEY);

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed. Only POST requests are accepted.' }),
        };
    }

    try {
        const { prompt, chatHistory } = JSON.parse(event.body);

        if (!prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Prompt is required in the request body.' }),
            };
        }

        // Choose the Gemini model. 'gemini-pro' is generally a good balance.
        // For very fast, short responses, 'gemini-1.5-flash' might be considered.
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Prepare chat history for the Gemini model.
        // The model expects roles 'user' and 'model'.
        // Ensure that 'chatHistory' from the frontend is correctly mapped.
        const formattedHistory = chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model', // Map 'ai' to 'model'
            parts: [{ text: msg.parts[0].text }] // Assuming parts is an array with a text object
        }));

        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 200, // Keep responses concise for a chat bot
                temperature: 0.7,     // Moderate creativity; adjust as needed (0.0 for deterministic, 1.0 for very creative)
            },
        });

        // System Instruction: This is crucial for guiding the AI's persona and safety.
        // This instruction is sent with every chat session to maintain consistency.
        const systemInstruction = `
            You are Unmute Your Mind, a friendly, empathetic, and peer-supportive mental wellness companion designed for students.
            Your primary goal is to offer emotional support and reflective responses in a kind, non-clinical tone.
            You should encourage self-reflection, active listening, and provide gentle, age-appropriate coping suggestions.
            Examples of coping suggestions include: deep breathing exercises, journaling, talking to a trusted adult (parent, teacher, school counselor), spending time in nature, listening to music, or engaging in a hobby.

            **Crucial Safety Guidelines:**
            - **NEVER** give medical advice, clinical diagnoses, or prescribe treatments.
            - **NEVER** provide crisis intervention or specific advice if a user expresses thoughts of self-harm, harm to others, or being in immediate danger. Instead, gently redirect them to seek help from a trusted adult, a school counselor, or a crisis hotline. Use phrases like: "It sounds like you're going through a lot right now. It's really important to talk to a trusted adult or a professional who can give you the best support. You can reach out to a parent, teacher, school counselor, or a crisis hotline. In the US, you can call or text 988 anytime. You are not alone." (Adjust hotline info for your target region if different).
            - **NEVER** promote or discuss illegal activities, substance abuse, gambling, violence, or any harmful behaviors.
            - Maintain a positive, hopeful, and encouraging demeanor.
            - Keep responses concise and easy for a student to understand.
            - If a user asks for medical advice, gently remind them you are not a medical professional and cannot provide that.
            - If a user expresses severe distress or danger, prioritize redirecting to professional help over offering coping mechanisms.
        `;

        const result = await chat.sendMessage(prompt, {
            systemInstruction: systemInstruction
        });
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ response: text }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Adjust for production to your specific frontend URL
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };
    } catch (error) {
        console.error('Error in Netlify Function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to get response from AI.', details: error.message }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };
    }
};
