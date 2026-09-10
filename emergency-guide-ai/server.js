const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const TRIAGE_SCHEMA = {
  type: "object",
  properties: {
    urgency: { type: "string", enum: ["RED", "ORANGE", "GREEN"] },
    summary: { type: "string" },
    warningSigns: { type: "array", items: { type: "string" } },
    whatToDo: { type: "array", items: { type: "string" } },
    firstAid: { type: "array", items: { type: "string" } },
    important: { type: "string" }
  },
  required: ["urgency", "summary", "warningSigns", "whatToDo", "firstAid", "important"]
};

const SYSTEM_PROMPT = `
You are EmergencyGuide AI, a cautious emergency-triage support assistant.
You are NOT a doctor and must NOT diagnose diseases.

Your purpose is to help users understand the apparent urgency of symptoms
and identify the safest next step.

URGENCY LEVELS:
RED: Potentially life-threatening or time-sensitive symptoms. Recommend immediate emergency medical care.
ORANGE: Needs prompt medical evaluation, but there is no clear indication of an immediate life-threatening emergency based on the information provided.
GREEN: No obvious emergency warning signs based on the information provided. Provide cautious self-care guidance and warning signs.

RULES:
1. Never diagnose a disease.
2. Never claim certainty about the medical cause.
3. Never tell someone to delay emergency care.
4. For RED situations, prioritize immediate emergency care.
5. Give only simple, low-risk safety or first-aid guidance.
6. Do not recommend prescription medicines or medication dosages.
7. If information is insufficient, use the available information conservatively.
8. Keep the answer concise and understandable.
9. Say "local emergency medical services" rather than assuming a specific emergency number.
10. If the input is clearly unrelated to health, explain that EmergencyGuide AI is intended for symptom and emergency-triage support.

Return ONLY valid JSON matching the provided schema.
`;

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "EmergencyGuide AI" });
});

app.post("/api/triage", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "AI service is not configured. Add GEMINI_API_KEY to the Vercel Production environment variables."
      });
    }

    const { symptoms } = req.body || {};

    if (!symptoms || typeof symptoms !== "string" || !symptoms.trim()) {
      return res.status(400).json({ error: "Please describe the symptoms first." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash-lite",
      input: `${SYSTEM_PROMPT}\n\nUSER DESCRIPTION:\n${symptoms.trim()}`,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: TRIAGE_SCHEMA
      }
    });

    if (!interaction.output_text) {
      throw new Error("The AI returned an empty response.");
    }

    let result;
    try {
      result = JSON.parse(interaction.output_text);
    } catch (parseError) {
      console.error("JSON PARSE ERROR:", interaction.output_text);
      throw new Error("The AI returned an invalid structured response.");
    }

    return res.json({ result });
  } catch (error) {
    console.error("AI ERROR:", error);

    if (error.status === 429 || error.statusCode === 429) {
      return res.status(429).json({
        error: "The AI service is temporarily rate-limited. Please try again shortly."
      });
    }

    return res.status(500).json({
      error: "Unable to analyze the symptoms right now. Please try again."
    });
  }
});

module.exports = app;

if (require.main === module) {
  app.listen(Number(PORT), () => {
    console.log(`EmergencyGuide AI running on port ${PORT}`);
  });
}
