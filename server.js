// server.js
const express = require("express");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI client with your API key from ENV
const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided." });
    }

    // Ask the model to output a complete HTML page
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini", // or whichever model you prefer
      messages: [
        {
          role: "system",
          content:
            "You are an AI that outputs valid, self-contained HTML code for a basic website layout.",
        },
        {
          role: "user",
          content: `Generate a complete HTML page (including <html>, <head>, <body> tags) for: "${prompt}"`,
        },
      ],
      temperature: 0.7,
    });

    const generatedHTML = completion.data.choices[0].message.content;
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
