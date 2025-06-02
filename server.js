// server.js
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the OpenAI client using the CommonJS pattern
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided." });
    }

    // Use the new Chat Completions API for CommonJS:
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or whichever model you prefer
      messages: [
        {
          role: "system",
          content:
            "You are an AI that outputs valid, self-contained HTML code for a basic website layout."
        },
        {
          role: "user",
          content: `Generate a complete HTML page (including <html>, <head>, <body> tags) for: "${prompt}"`
        }
      ],
      temperature: 0.7
    });

    const generatedHTML = completion.choices[0].message.content;
    res.json({ html: generatedHTML });
  } catch (error) {
    console.error("Error generating HTML:", error);
    res.status(500).json({ error: "Failed to generate HTML." });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LovableAI‐backend listening on port ${PORT}`);
});
