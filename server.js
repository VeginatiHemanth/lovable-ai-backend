// server.js (CommonJS version)
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

// Use GPT-4 for more advanced code output
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided." });
    }

    // We’re asking the model to return multiple files in one string,
    // separated by HTML comments like: <!-- File: index.html --> etc.
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // use GPT-4 for more complex code
      messages: [
        {
          role: "system",
          content:
            "You are an expert front-end developer. Given a detailed prompt, output a complete website project with separate files. " +
            "Use comments to indicate file boundaries (e.g., <!-- File: index.html -->, <!-- File: css/styles.css -->, <!-- File: js/main.js -->). " +
            "Make sure each file is valid and self-contained. Include comments explaining each section."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,      // lower temperature for more deterministic code
      max_tokens: 3000       // increase token limit to handle larger code outputs
    });

    const generatedText = completion.choices[0].message.content;
    res.json({ html: generatedText });
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
