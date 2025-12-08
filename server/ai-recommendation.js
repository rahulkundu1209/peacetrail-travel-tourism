// The user will enter their plan in natural language and this ai-recommendation system will recommend some packages based on that
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
async function aiRecommendation(prompt) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not set in environment');
  }

  const payload = {
    model: DEFAULT_MODEL,
    messages: [
        {
            "role": "system",
            "content": "Your task is to recommend users tour plans which our Indian holiday and tour booking agency provide, based on the description the user writes. You should understand the emotion of the message they provide and generate the reply part connecting with that emotion. You must strictly output a JSON object with two keys: 'reply' (string, your empathetic, helpful response), and 'tags' (array of strings, recommend packages by selecting 1 to 3 tags from: [family, culture, nature, relax, beach, mountain, party, adventure, snow, heritage, luxury, honeymoon])."
        },
        {
            "role": "user",
            "content": prompt
        }
    ],
    temperature: 0.7,
    max_completion_tokens: 1000
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


export {aiRecommendation};