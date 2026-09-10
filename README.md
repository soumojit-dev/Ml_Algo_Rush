# 🚨 EmergencyGuide AI

### AI-Assisted Emergency Triage Support Chatbot

EmergencyGuide AI is a web-based chatbot designed to provide **initial emergency triage support** from a user's natural-language description of symptoms.

The system analyzes the information provided, identifies potential warning signs, assigns an apparent urgency level, and provides practical next-step guidance.

> ⚠️ **Disclaimer:** EmergencyGuide AI does not diagnose medical conditions and is not a replacement for doctors, hospitals, or emergency medical services.

---

## 🎯 Problem

During a medical emergency, people may be unsure about:

- How serious their symptoms might be
- Which warning signs require immediate attention
- Whether they should seek emergency care
- What basic safety steps they can take

This problem can be especially significant when immediate access to professional medical guidance is limited.

---

## 💡 Our Solution

EmergencyGuide AI provides a simple conversational interface where users can describe symptoms in their own words.

The system then provides:

- 🚦 **Urgency Level**
- ⚠️ **Warning Signs**
- 🩺 **What To Do**
- 🆘 **Basic First-Aid Guidance**
- 📌 **Important Safety Information**

### Urgency Levels

| Level | Meaning |
|---|---|
| 🔴 **RED – EMERGENCY** | Potentially life-threatening situation requiring immediate professional medical attention |
| 🟠 **ORANGE – URGENT** | Prompt medical evaluation is recommended |
| 🟢 **GREEN – NON-URGENT** | No obvious emergency warning signs based on the information provided |

---

## ✨ Key Features

- Natural-language symptom input
- AI-assisted emergency triage
- RED / ORANGE / GREEN classification
- Warning-sign identification
- Action-oriented guidance
- Basic first-aid guidance
- Structured JSON AI responses
- Emergency escalation message
- Emergency services call option
- New Chat functionality
- Responsive user interface
- API error handling
- Gemini API integration
- Secure API-key management

---

## 🏗️ System Architecture

```text
                    USER
                      │
                      ▼
            ┌──────────────────┐
            │    Frontend      │
            │  HTML/CSS/JS     │
            └────────┬─────────┘
                     │
                     │ POST /api/triage
                     ▼
            ┌──────────────────┐
            │ Node.js +        │
            │ Express Backend  │
            └────────┬─────────┘
                     │
                     │ Secure API Request
                     ▼
            ┌──────────────────┐
            │   Gemini AI      │
            │ Triage Analysis  │
            └────────┬─────────┘
                     │
                     │ Structured JSON
                     ▼
            ┌──────────────────┐
            │    Backend       │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │    Frontend      │
            │ Assessment UI    │
            └──────────────────┘
