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
            "content": "You are an AI messaging agent for an Indian tour and travel booking agency. Your goal is to engage website visitors through a chatbot. The user's message is processed first against a list of predefined patterns. Your task is to ONLY respond if the message DOES NOT match any of these patterns: 1. 'Show by my Preference' (exact match, ignore case); 2. 'Show My Previous Bookings' (exact match, ignore case); 3. ends with 'Book Again' (ignore case); 4. ends with 'Give Feedback' (ignore case); 5. ends with 'Get Details' (ignore case). If the message requires a custom reply, you must strictly output a JSON object with three keys: 'reply_present' (Boolean, must be true), 'reply' (string, your brief, helpful response as the agent), and 'tags' (array of strings, recommend packages by selecting 1 to 3 tags from: [family, culture, nature, relax, beach, mountain, party, adventure, snow, heritage, luxury, honeymoon]). If the message matches a predefined pattern (which you must identify internally), output JSON with reply_present: false."
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
  const json = await resp.json().catch(() => null);
  // console.log("json: ", json);

  let formatted_response;
  if (json && Array.isArray(json.choices) && json.choices[0] && json.choices[0].message) {
    const msg = json.choices[0].message;
    // console.log("message: ", msg);
    formatted_response = {
      status: "ok",
      content: typeof msg.content === 'string' ? JSON.parse(msg.content) : null,
    };
  } else {
    formatted_response = { ok: Boolean(json && json.ok)};
  }

  console.log("formated response", formatted_response);
  return formatted_response;
}


export {callGroqGenerate};