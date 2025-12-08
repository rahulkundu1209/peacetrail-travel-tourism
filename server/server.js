import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import axios from "axios"
import { createRequire } from 'module'
import { callGroqGenerate } from "./ai-reply.js"
import { aiRecommendation } from "./ai-recommendation.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const GAS_URL = process.env.GAS_DATA_URL

// Middleware
app.use(cors())
app.use(express.json())

// Mount AI reply router from CommonJS module `aireply.js`
// `aireply.js` exports a function that accepts the express `app` and mounts routes.
// const require = createRequire(import.meta.url)
// try {
//   const registerAiRoutes = require('./aireply.js')
//   if (typeof registerAiRoutes === 'function') {
//     registerAiRoutes(app)
//   }
// } catch (err) {
//   console.warn('Could not load aireply router:', err && err.message ? err.message : err)
// }

// Simple in-memory cache
let dataCache = null
let lastFetchTime = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Helper function to parse pipe-separated itinerary
const parseItinerary = (itineraryStr) => {
  if (!itineraryStr) return []
  return itineraryStr.split("|").map((day) => day.trim())
}

// Helper function to parse comma-separated tags
const parseTags = (tagsStr) => {
  if (!tagsStr) return []
  return tagsStr.split(",").map((tag) => tag.trim())
}

// Helper function to convert sheet data to JSON
const transformPackageData = (rawData) => {
  if (!Array.isArray(rawData)) return []

  return rawData.map((pkg) => ({
    id: pkg.id?.toString() || "",
    name: pkg.name || "",
    days: Number.parseInt(pkg.days) || 0,
    price: Number.parseInt(pkg.price) || 0,
    location: pkg.location || "",
    itinerary: pkg.itinerary || "",
    itineraryList: parseItinerary(pkg.itinerary),
    featured: pkg.featured === true || pkg.featured === "TRUE" || pkg.featured === "true",
    image_url: pkg.image_url || "/travel-package.jpg",
    description: pkg.description || "",
    tags: parseTags(pkg.tags),
  }))
}

// Fetch data from GAS and update cache
const fetchFromGAS = async () => {
  try {
    const response = await axios.get(GAS_URL, { params: { action: "getAllPackages" } })
    // console.log(response.data)
    return response.data.packages
  } catch (error) {
    console.error("Error fetching from GAS:", error.message)
    throw new Error("Failed to fetch data from Google Apps Script")
  }
}

// GET all packages
app.get("/api/packages", async (req, res) => {
  try {
    const data = await fetchFromGAS()
    const pkgsData = transformPackageData(data);
    res.json(pkgsData)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET featured packages only
app.get("/api/packages/featured", async (req, res) => {
  try {
    const data = await fetchFromGAS()
    const pkgsData = transformPackageData(data);
    const featured = pkgsData.filter((pkg) => pkg.featured)
    res.json(featured)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET single package by ID
app.get("/api/packages/:id", async (req, res) => {
  try {
    const data = await fetchFromGAS()
    const pkgsData = transformPackageData(data);
    const pkg = pkgsData.find((p) => p.id.toString() === req.params.id.toString())

    if (!pkg) {
      return res.status(404).json({ error: "Package not found" })
    }

    res.json(pkg)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/ai/reply', express.json(), async (req, res) => {
  try {
    // console.log("Request Body", req);
    // console.log("Request Body", req.body);
    const { prompt } = req.body || {};
    console.log("prompt", prompt);
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "prompt" in request body' });
    }

    const result = await callGroqGenerate(prompt);
    // Forward the provider response as-is. Adjust if you want a different shape.
    res.json(result);
  } catch (err) {
    const message = err && err.message ? err.message : 'Unknown error';
    const details = err && err.details ? err.details : undefined;
    res.status(500).json({ ok: false, error: message, details });
  }
});

app.post('/api/ai/recommendation', express.json(), async (req, res) => {
  try {
    // console.log("Request Body", req);
    // console.log("Request Body", req.body);
    const { prompt } = req.body || {};
    console.log("prompt", prompt);
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "prompt" in request body' });
    }

    const result = await aiRecommendation(prompt);
    // Forward the provider response as-is. Adjust if you want a different shape.
    res.json(result);
  } catch (err) {
    const message = err && err.message ? err.message : 'Unknown error';
    const details = err && err.details ? err.details : undefined;
    res.status(500).json({ ok: false, error: message, details });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Internal server error" })
})

app.listen(PORT, () => {
  console.log(`🚀 PeaceTrail Backend running on http://localhost:${PORT}`)
})
