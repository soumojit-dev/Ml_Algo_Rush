const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is missing in the environment.");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "emergency-guide-ai", "public")));

const TRIAGE_SCHEMA = {
  type: "object",
  properties: {
    urgency: {
      type: "string",
      enum: ["RED", "ORANGE", "GREEN"]
    },
    summary: { type: "string" },
    warningSigns: {
      type: "array",
      items: { type: "string" }
    },
    whatToDo: {
      type: "array",
      items: { type: "string" }
    },
    firstAid: {
      type: "array",
      items: { type: "string" }
    },
    important: { type: "string" }
  },
  required: [
    "urgency",
    "summary",
    "warningSigns",
    "whatToDo",
    "firstAid",
    "important"
  ]
};

const SYSTEM_PROMPT = `
You are EmergencyGuide AI, a cautious emergency-triage support assistant.
You are NOT a doctor and must NOT diagnose diseases.

Your purpose is to help users understand the apparent urgency of symptoms
and identify the safest next step.

URGENCY LEVELS:
RED:
Potentially life-threatening or time-sensitive symptoms.
Recommend immediate emergency medical care.
Examples include severe difficulty breathing, severe chest pain,
unconsciousness, severe bleeding, stroke-like symptoms, seizures,
severe allergic reaction, poisoning, or rapidly worsening condition.

ORANGE:
Needs prompt medical evaluation, but there is no clear indication
of an immediate life-threatening emergency based on the information provided.

GREEN:
No obvious emergency warning signs based on the information provided.
Provide cautious self-care guidance and tell the user what warning signs
would require urgent medical attention.

RULES:
1. Never diagnose a disease.
2. Never claim certainty about the medical cause.
3. Never tell someone to delay emergency care.
4. For RED situations, prioritize immediate emergency care.
5. Give only simple, low-risk safety or first-aid guidance.
6. Do not recommend prescription medicines or medication dosages.
7. If information is insufficient, use the available information conservatively.
8. Keep the answer concise and understandable.
9. The user's location may be unknown, so say "local emergency medical services"
   rather than assuming a specific emergency number.
10. If the input is clearly unrelated to health, explain that EmergencyGuide AI
    is intended for symptom and emergency-triage support.

Return ONLY valid JSON matching the provided schema.
`;

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "EmergencyGuide AI" });
});

app.post("/api/triage", async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || typeof symptoms !== "string" || !symptoms.trim()) {
      return res.status(400).json({
        error: "Please describe the symptoms first."
      });
    }

    const input = `${SYSTEM_PROMPT}\n\nUSER DESCRIPTION:\n${symptoms.trim()}`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash-lite",
      input,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: TRIAGE_SCHEMA
      }
    });

    const raw = interaction.output_text;

    if (!raw) {
      throw new Error("The AI returned an empty response.");
    }

    let result;
    try {
      result = JSON.parse(raw);
    } catch (parseError) {
      console.error("JSON PARSE ERROR:", raw);
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

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "emergency-guide-ai", "public", "index.html"));
});

app.listen(Number(PORT), () => {
  console.log(`EmergencyGuide AI running on port ${PORT}`);
});
