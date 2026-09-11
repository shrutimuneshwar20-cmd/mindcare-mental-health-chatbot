# 🌿 MindCare AI – Mental Health Awareness AI Chatbot

> **"A safe space to talk, understand, and care for your mind."**

**MindCare AI** is a modern, responsive, and empathetic mental health awareness web application with an integrated AI chatbot powered by the **Google Gemini API**. It provides a supportive space for students and young adults to discuss everyday emotional difficulties—such as academic pressure, exam stress, anxiety, loneliness, relationship challenges, and sleep problems—while offering evidence-based mindfulness tools and crisis guardrails.

---

## ⚠️ Important Ethical & Medical Disclaimer

> [!IMPORTANT]
> **MindCare AI is an educational and emotional awareness support tool, NOT a replacement for a doctor, psychologist, psychiatrist, licensed counselor, or emergency service.**
>
> - MindCare AI **never** provides clinical diagnoses (e.g., it will never state *"You have depression"*).
> - MindCare AI **never** prescribes medication or recommends changes to pharmaceutical dosages.
> - In any crisis situation or emergency, users are immediately directed to verified emergency hotlines (e.g., **112 / 14416 Tele-MANAS** in India, **988 / 911** in the US/Canada, **111 / 999** in the UK).

---

## 🌟 Key Features

### 1. Compassionate AI Chatbot (Powered by Google Gemini)
- **Empathetic & Non-Judgmental Listening**: Acknowledges and validates the user's emotional state without invalidating or shaming them.
- **Actionable Coping Suggestions**: Delivers 2–4 practical, manageable techniques (e.g., Pomodoro study intervals, deep breathing, journaling, talking to trusted friends).
- **Follow-up Questions**: Gently invites reflection with supportive, non-intrusive questions.
- **Multi-Turn Context**: Remembers recent conversational turns to maintain contextual empathy.
- **Copy & Retry Functionality**: Easily copy AI responses or retry messages if network interruptions occur.
- **Pre-Loaded Quick Starters**: Clickable chips for instant support (`"I'm feeling stressed"`, `"I feel anxious"`, `"I'm having trouble sleeping"`, `"I'm worried about exams"`, etc.).

### 2. Multi-Layered Crisis & Safety Detection
- **Proactive Pattern Matching**: Evaluates user messages before sending them to the AI to detect potential suicidal ideation, self-harm, abuse, or acute crisis.
- **Direct Emergency Intervention**: Automatically surfaces regional emergency numbers (India 112/14416, US 988, UK 111/999, etc.) and a dedicated crisis alert banner.
- **Country Selector**: Tailors emergency helplines to the user's region (India, USA, UK, Canada, Australia, International).

### 3. Daily Wellness Dashboard & Mood Tracker
- **Emoji Mood Check-In**: Track feelings (😊 Happy, 🙂 Good, 😐 Okay, 😔 Sad, 😟 Anxious, 😡 Angry, 😴 Tired).
- **Immediate Supportive Feedback**: Provides personalized words of encouragement based on the chosen mood.
- **Recent Mood Log**: Visual history of recent mood check-ins saved locally in the browser.
- **Rotating Wellness Tips**: 8 evidence-based wellness tips covering sleep hygiene, study breaks, hydration, social connection, and self-compassion.

### 4. Interactive Mental Wellness Tools
- **Animated Breathing Exercise Pacer**:
  - Supports **Box Breathing** (4s Inhale, 4s Hold, 4s Exhale, 4s Rest) and **4-7-8 Relaxing Breath**.
  - Smooth animated expanding/contracting circle with live countdown.
  - Cycle counter and session duration tracker with Start, Pause, and Reset controls.
- **5-4-3-2-1 Sensory Grounding Technique**:
  - Interactive step-by-step wizard to guide users through 5 things they see, 4 they touch, 3 they hear, 2 they smell, and 1 they taste.
  - Re-anchors attention during acute panic or overthinking.
- **Private Reflection Journal**:
  - Write and organize reflections with mood tags and timestamps.
  - **100% Client-Side Privacy**: Stored strictly in browser `localStorage`. No server storage or third-party tracking.
- **Evidence-Based Self-Care Recommendations**:
  - Structured cards for Stress Management, Managing Anxiety, Sleep Hygiene, and Academic/Exam Pressure.

### 5. Emergency Help Directory
- Dedicated crisis section with one-touch calling buttons for verified helplines in India, the US, UK, Canada, Australia, and worldwide directories via FindAHelpline.com.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla ES6+), Font Awesome 6, Google Fonts (*Plus Jakarta Sans*) |
| **Backend** | Node.js (ES Modules), Express.js, CORS, dotenv, express-rate-limit |
| **AI Engine** | Google Gemini API (`@google/genai` & `@google/generative-ai` with `gemini-2.0-flash` / `gemini-1.5-flash`) |
| **Storage** | Client-side `localStorage` for chat history, mood logs, and journal entries |
| **Security** | Rate-limiting (60 req/15min), input sanitization, max character limits, pre-API crisis interceptor, zero server-side conversation logging |

---

## 📂 Project Structure

```text
mental-health-chatbot/
│
├── public/                     # Static frontend files (served by Express)
│   ├── index.html              # Single-page web application with all sections & tools
│   ├── style.css               # Modern, calming wellness stylesheet (responsive & accessible)
│   └── script.js               # Application logic (chat, breathing, grounding, journal, mood)
│
├── server.js                   # Node.js + Express backend server & Gemini API integration
├── package.json                # Project metadata, dependencies, and npm run scripts
├── .env                        # Local environment variables (GEMINI_API_KEY, PORT)
├── .env.example                # Example environment template for easy onboarding
├── .gitignore                  # Git ignore rules for node_modules and .env
└── README.md                   # Comprehensive documentation and project guide
```

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have **Node.js** (v18 or newer) installed on your machine.
- Download from: [https://nodejs.org/](https://nodejs.org/)
- Verify in your terminal:
  ```bash
  node -v
  npm -v
  ```

---

### Step 1: Clone or Navigate to the Project Directory
```bash
cd mental-health-chatbot
```

---

### Step 2: Install Dependencies
Install the required Node.js packages:
```bash
npm install
```

---

### Step 3: Configure Your Google Gemini API Key
1. Get a free Google Gemini API key from **Google AI Studio**:
   👉 [https://aistudio.google.com/](https://aistudio.google.com/)
2. Open the `.env` file in the project root:
   ```env
   PORT=5000
   GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY_HERE
   ```
3. Save the file.

> [!TIP]
> **Local Demo Mode**: If you haven't obtained an API key yet, MindCare AI includes an integrated fallback demo engine. The application will run immediately, and you can test the UI, tools, safety triggers, and sample wellness responses out of the box!

---

### Step 4: Start the Server
Run the application using Node.js:
```bash
npm start
```
*(Or during development: `npm run dev`)*

You will see:
```text
==================================================================
  🌟 MindCare AI Server is running on port 5000
  🔗 Web App URL:      http://localhost:5000
  🏥 Health Check:     http://localhost:5000/api/health
  💬 Chat API:         http://localhost:5000/api/chat
==================================================================
```

---

### Step 5: Open in Your Browser
Open your browser and navigate to:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 📡 API Endpoints Reference

### 1. `POST /api/chat`
Handles conversation exchanges between the user and MindCare AI.

- **Request Body**:
  ```json
  {
    "message": "I feel very stressed about my upcoming exams.",
    "country": "IN",
    "history": [
      { "role": "user", "content": "Hi" },
      { "role": "assistant", "content": "Hello! How can I support you today?" }
    ]
  }
  ```

- **Normal Response**:
  ```json
  {
    "success": true,
    "crisis": false,
    "reply": "It sounds like exam pressure is feeling really overwhelming right now..."
  }
  ```

- **Crisis Detection Response** (Triggered if high-risk intent is identified):
  ```json
  {
    "success": true,
    "crisis": true,
    "reply": "I’m really sorry you’re going through this, and I want you to know that you don't have to face it alone...",
    "resources": {
      "country": "India",
      "emergency": "112 (National Emergency Number)",
      "helpline": "14416 (Tele-MANAS 24/7 Mental Health Helpline) or 1800-599-0019 (KIRAN)",
      "textLine": "+91 9999 666 555 (Vandrevala Foundation Helpline)",
      "supportLink": "https://telemanas.mohfw.gov.in"
    }
  }
  ```

---

### 2. `GET /api/health`
Health check endpoint reporting API status and configuration state.
- **Response**:
  ```json
  {
    "status": "OK",
    "service": "MindCare AI Backend",
    "timestamp": "2026-09-08T08:15:00.000Z",
    "geminiConfigured": true
  }
  ```

---

### 3. `GET /api/crisis-resources?country=IN`
Returns verified emergency numbers and crisis lines for a given country code (`IN`, `US`, `UK`, `CA`, `AU`, `INTL`).

---

## 🛡️ AI Safety Architecture

```
User Input
    │
    ▼
[Input Validation] ─── (Length > 1500 chars or empty? Reject gracefully)
    │
    ▼
[Safety / Crisis Filter] ─── (Matches suicidal/self-harm patterns?) 
    │                                │
    │ No                             ▼ YES: Immediate Safe Crisis Response
    │                                       (No Gemini API call needed)
    ▼
[Gemini System Instruction]
  • Empathetic, supportive, non-judgmental
  • NEVER diagnose illnesses
  • NEVER prescribe or alter medicines
  • 2–4 practical coping actions
  • Gentle follow-up question
    │
    ▼
[Google Gemini 2.0 Flash]
    │
    ▼
[Frontend Render] ─── (Formatted with Markdown, timestamp, and copy action)
```

---

## 💡 Troubleshooting

| Issue | Resolution |
| :--- | :--- |
| **`EADDRINUSE: address already in use :::5000`** | Another application is using port 5000. Change `PORT=5001` in `.env` and restart. |
| **`API key not valid`** | Verify that your key from Google AI Studio is correctly pasted into `.env` with no trailing spaces or quotes. |
| **`Rate limit exceeded`** | The API allows 60 messages every 15 minutes per IP. Wait a few moments before trying again. |
| **`Cannot find module`** | Run `npm install` in the project root to ensure all dependencies are downloaded. |

---

## 📜 License
This project is open-source under the [MIT License](LICENSE). Built for educational and mental health awareness purposes.
