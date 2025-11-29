import express from "express";
import dotenv from "dotenv";

'use strict';

const app = express.Router();

// Configuration via environment
dotenv.config();
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/v1/generate';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'groq-gen-1';
// Helper to call Groq Gen AI API
async function callGroqGenerate(prompt) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not set in environment');
  }

  const payload = {
    model: DEFAULT_MODEL,
    messages: [
        {
            "role": "system",
            "content": "You are an AI messaging agent for an Indian tour and travel booking agency. Your goal is to engage website visitors through a chatbot. The user's message is processed first against a list of predefined patterns. Your task is to ONLY respond if the message DOES NOT match any of these patterns: 1. 'Show by my Preference' (exact match, ignore case); 2. 'Show My Previous Bookings' (exact match, ignore case); 3. ends with 'Book Again' (ignore case); 4. ends with 'Give Feedback' (ignore case); 5. ends with 'Get Details' (ignore case). If the message requires a custom reply, you must strictly output a JSON object with three keys: 'reply_present' (Boolean, must be true), 'reply' (string, your brief, helpful response as the agent), and 'tags' (array of strings, recommend packages by selecting 1 to 3 tags from: [family, nature, relax, beach, party, budget, adventure, snow, heritage, culture, luxury, honeymoon]). If the message matches a predefined pattern (which you must identify internally), do NOT output any JSON; instead, output ONLY the string: 'PREDEFINED_MATCH'."
        },
        {
            "role": "user",
            "content": prompt
        }
    ],
    temperature: 0.7,
    max_completion_tokens: 500
  };

  const resp = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => null);
    const err = new Error(`Groq API error: ${resp.status} ${resp.statusText}`);
    err.details = text;
    throw err;
  }

  // attempt to parse JSON (most Gen APIs return JSON)
  return resp.json();
}

// Route: POST /api/ai/reply
// Body: { prompt: string, model?: string, extra?: object }
// router.post('/api/ai/reply', express.json(), async (req, res) => {
//   try {
//     const { prompt } = req.body || {};
//     if (!prompt || typeof prompt !== 'string') {
//       return res.status(400).json({ error: 'Missing or invalid "prompt" in request body' });
//     }

//     const result = await callGroqGenerate(prompt, { model, extra });
//     // Forward the provider response as-is. Adjust if you want a different shape.
//     res.json({ ok: true, provider: 'groq', result });
//   } catch (err) {
//     const message = err && err.message ? err.message : 'Unknown error';
//     const details = err && err.details ? err.details : undefined;
//     res.status(500).json({ ok: false, error: message, details });
//   }
// });

// Export a function that mounts the router on an express app.
// In your server.js: require('./server/aireply')(app);
export {callGroqGenerate};