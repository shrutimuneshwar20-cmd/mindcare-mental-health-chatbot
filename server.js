import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json({ limit: '50kb' }));

// Determine static directory (public/ folder or repository root)
const staticDir = fs.existsSync(path.join(__dirname, 'public', 'index.html'))
  ? path.join(__dirname, 'public')
  : __dirname;

app.use(express.static(staticDir));

// Rate Limiting: 60 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    reply: "You've shared quite a few messages recently. Please take a mindful breath and try again in a few moments."
  }
});
app.use('/api/', apiLimiter);

// =================================================================
// 1. CRISIS HELPLINES DIRECTORY
// =================================================================
const CRISIS_RESOURCES = {
  IN: {
    country: "India",
    emergency: "112 (National Emergency Number)",
    helpline: "14416 (Tele-MANAS 24/7 Mental Health Helpline) or 1800-599-0019 (KIRAN)",
    textLine: "+91 9999 666 555 (Vandrevala Foundation Helpline)",
    supportLink: "https://telemanas.mohfw.gov.in"
  },
  US: {
    country: "United States",
    emergency: "911",
    helpline: "988 (Suicide & Crisis Lifeline - Call or Text 24/7)",
    textLine: "Text HOME to 741741 (Crisis Text Line)",
    supportLink: "https://988lifeline.org"
  },
  UK: {
    country: "United Kingdom",
    emergency: "999",
    helpline: "111 (NHS Mental Health Services) or 116 123 (Samaritans)",
    textLine: "Text SHOUT to 85258",
    supportLink: "https://www.samaritans.org"
  },
  CA: {
    country: "Canada",
    emergency: "911",
    helpline: "988 (Suicide Crisis Helpline - Call or Text 24/7)",
    textLine: "Text 686868 (Youth) or 741741 (Adults)",
    supportLink: "https://988.ca"
  },
  AU: {
    country: "Australia",
    emergency: "000",
    helpline: "13 11 14 (Lifeline) or 1300 22 4636 (Beyond Blue)",
    textLine: "Text 0477 13 11 14 (Lifeline Text)",
    supportLink: "https://www.lifeline.org.au"
  },
  INTL: {
    country: "International",
    emergency: "Your local emergency services (e.g. 112 / 911)",
    helpline: "Find A Helpline or Befrienders Worldwide",
    textLine: "Worldwide crisis centers directory",
    supportLink: "https://findahelpline.com"
  }
};

// =================================================================
// 2. CRISIS & SAFETY DETECTION
// =================================================================
const CRISIS_PATTERNS = [
  /\b(suicide|suicidal)\b/i,
  /\b(kill|killing)\s+(my\s*self|me)\b/i,
  /\b(want\s+to\s+die|wanna\s+die|wish\s+i\s+was\s+dead|better\s+off\s+dead)\b/i,
  /\b(end\s+it\s+all|end\s+my\s+life|ending\s+my\s+life)\b/i,
  /\b(hang\s+myself|shoot\s+myself|slit\s+my\s+wrists?)\b/i,
  /\b(self\s*[- ]?harm|harming\s+myself|hurt\s+myself|hurting\s+myself)\b/i,
  /\b(overdose|take\s+all\s+my\s+pills)\b/i,
  /\b(jump\s+off\s+a\s+bridge|jump\s+in\s+front\s+of)\b/i,
  /\b(abuse|beating\s+me|someone\s+is\s+hurting\s+me|in\s+immediate\s+danger)\b/i,
  /\b(don't\s+want\s+to\s+live|dont\s+want\s+to\s+live|no\s+reason\s+to\s+live)\b/i
];

function isCrisisMessage(text) {
  if (!text || typeof text !== 'string') return false;
  return CRISIS_PATTERNS.some(pattern => pattern.test(text));
}

function getCrisisResponse(countryCode = 'IN') {
  const code = (countryCode && CRISIS_RESOURCES[countryCode.toUpperCase()]) ? countryCode.toUpperCase() : 'IN';
  const resource = CRISIS_RESOURCES[code] || CRISIS_RESOURCES.IN;

  return {
    reply: `I’m really sorry you’re going through this, and I want you to know that you don't have to face it alone.

If you feel you may hurt yourself or are in immediate danger, please reach out to emergency services or a crisis helpline right now, and stay with someone you trust. If possible, move away from anything you could use to hurt yourself.

Immediate Emergency Support (${resource.country}):
• Emergency Services: ${resource.emergency}
• Crisis Helpline: ${resource.helpline}
• Text/Chat Support: ${resource.textLine}
• Find verified helplines worldwide: https://findahelpline.com

Are you in immediate danger right now? Please reach out to a trusted family member, friend, doctor, or counselor immediately. People care about you and want to help.`,
    crisis: true,
    resources: resource
  };
}

// =================================================================
// 3. GEMINI SYSTEM INSTRUCTION
// =================================================================
const GEMINI_SYSTEM_INSTRUCTION = `You are MindCare AI, a compassionate mental health awareness and emotional-support assistant.

Your purpose is to provide general mental-health information, emotional support, healthy coping strategies, self-care suggestions, and encouragement to seek professional help when appropriate.

CRITICAL SAFETY RULES:
1. You are NOT a doctor, psychiatrist, psychologist, therapist, or emergency service.
2. NEVER diagnose the user with a mental health disorder (e.g., if user asks "Do I have depression?", explicitly say: "I cannot diagnose medical or mental health conditions, but some of what you're describing can occur with stress, burnout, or low mood. A licensed healthcare professional can provide a proper evaluation.")
3. NEVER prescribe medication or recommend changing medication dosage.
4. NEVER provide instructions for self-harm, suicide, or dangerous behavior.
5. NEVER shame, blame, or judge the user.
6. Do not pretend to be a human therapist or guarantee that everything will be completely cured.

COMMUNICATION STYLE:
- Warm, compassionate, empathetic, non-judgmental, and respectful.
- Keep responses understandable for students and young adults.
- Avoid overly long walls of text. Provide concise, clear, and structured answers:
  1. Acknowledge and validate the user's feelings with empathy.
  2. Understand the main concern (exam stress, loneliness, overthinking, sleep, relationships, etc.).
  3. Offer 2 to 4 practical, simple suggestions (e.g., 4-7-8 breathing, Pomodoro technique, taking a 10-minute walk, journaling, sleep hygiene, talking with someone trusted).
  4. End with a gentle, supportive follow-up question.
- Encourage professional support (counselor, psychologist, doctor) when problems appear severe, persistent, or distressing.
- If the user hints at crisis or self-harm, prioritize safety, urge contacting emergency numbers (e.g., 112 in India, 988 in US/Canada, 111/999 in UK), and urge staying with a trusted person.`;

// =================================================================
// 4. GEMINI API CALLER
// =================================================================
async function callGemini(message, conversationHistory = []) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // If no API key or placeholder, provide empathetic fallback demo responses
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return generateLocalSupportiveFallback(message);
  }

  // List of modern models to try in priority order
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-flash-latest'];

  // Attempt using @google/generative-ai SDK
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: GEMINI_SYSTEM_INSTRUCTION
        });

        // Format history for context if available
        if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
          const chat = model.startChat({
            history: conversationHistory.slice(-6).map(turn => ({
              role: turn.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: turn.content }]
            }))
          });
          const result = await chat.sendMessage(message);
          const text = result.response.text();
          if (text) return text;
        } else {
          const result = await model.generateContent(message);
          const text = result.response.text();
          if (text) return text;
        }
      } catch (modelErr) {
        console.warn(`Model ${modelName} warning:`, modelErr.message);
      }
    }
  } catch (importErr) {
    console.warn("SDK load error:", importErr.message);
  }

  console.log("Using supportive fallback for user message.");
  return generateLocalSupportiveFallback(message);
}

// Empathetic fallback generator
function generateLocalSupportiveFallback(userMessage) {
  const lower = userMessage.toLowerCase();

  if (lower.includes('exam') || lower.includes('study') || lower.includes('academic') || lower.includes('test')) {
    return `It sounds like exam pressure is feeling really overwhelming right now, and it's completely understandable to feel stressed when you have a lot on your plate.

Here are a few manageable steps you can take today:
• Break your study work into smaller, bite-sized tasks (try the 25-minute Pomodoro method with 5-minute breaks).
• Take 3 slow, deep belly breaths whenever your mind starts racing.
• Protect your sleep—a well-rested brain recalls information much faster than an exhausted one.
• Remember that an exam score does not define your intrinsic worth as a person.

What specific subject or deadline is feeling heaviest for you right now?`;
  }

  if (lower.includes('anxious') || lower.includes('anxiety') || lower.includes('panic') || lower.includes('nervous')) {
    return `I hear you. Feeling anxious can be physically and emotionally draining, and it's brave of you to express what you're experiencing.

Try these calming techniques right now:
• Practice the 5-4-3-2-1 grounding exercise: notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.
• Inhale slowly through your nose for 4 seconds, and exhale gently for 6 seconds.
• Remind yourself: "This feeling is temporary, and I am safe in this moment."

Would you like to try our guided breathing exercise on the Mental Wellness page?`;
  }

  if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('tired') || lower.includes('awake')) {
    return `Struggling with sleep can make every daily task feel ten times harder. Your mind and body deserve comforting rest.

Here are some gentle bedtime habits to consider:
• Put away screens and dim bright overhead lights 30-45 minutes before bed.
• Try writing down everything on your mind in our Journal section to empty your thoughts.
• Do a progressive muscle relaxation: gently tighten and release each muscle group from your feet to your shoulders.

Has anything in particular been keeping your mind buzzing at night?`;
  }

  if (lower.includes('lonely') || lower.includes('alone') || lower.includes('isolated') || lower.includes('no friends')) {
    return `I’m sorry you're feeling this lonely. Feeling disconnected from others is deeply painful, but please remember that you are not invisible or unworthy of connection.

A few gentle steps you could explore:
• Send a simple, low-pressure message to a friend or acquaintance, like "Hey, thinking of you! How have you been?"
• Spend some time in a shared environment, like a coffee shop, library, or local park.
• Be kind to yourself today—treat yourself with the gentle patience you would give a friend.

What has been making you feel especially alone recently?`;
  }

  if (lower.includes('overthink') || lower.includes('thoughts won\'t stop') || lower.includes('racing thoughts')) {
    return `Overthinking can feel like being caught in an endless mental loop. It is exhausting, but there are ways to gently interrupt that cycle.

You can try:
• Externalize your thoughts: write them down raw on paper or in the journal. Seeing them outside your head helps break the loop.
• Ask yourself: "Is this thought a fact, or is it a worry about what might happen?"
• Engage in a physical sensory activity: wash your face with cool water or take a 10-minute walk.

What thought has been replaying in your mind the most today?`;
  }

  if (lower.includes('diagnos') || lower.includes('do i have') || lower.includes('am i depressed')) {
    return `I hear your concern. While symptoms like low mood, fatigue, and loss of interest can be associated with depression, stress, or burnout, an AI chatbot cannot diagnose mental health conditions.

A licensed mental health professional, such as a psychologist, psychiatrist, or medical doctor, can conduct a thorough, compassionate evaluation.

In the meantime, how long have you been noticing these feelings, and what has been the hardest part for you?`;
  }

  return `Thank you for sharing that with me. It takes courage to open up about how you're feeling, and your emotions are valid.

Here are a few healthy self-care actions you can take:
• Take a short pause to breathe deeply and release the tension in your shoulders.
• Sip a glass of water and give yourself credit for navigating today.
• Consider talking to someone you trust—a friend, family member, or counselor.

Would you like to tell me more about what's been on your mind?`;
}

// =================================================================
// 5. ROUTES
// =================================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: "OK",
    service: "MindCare AI Backend",
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE')
  });
});

// Crisis resources directory endpoint
app.get('/api/crisis-resources', (req, res) => {
  const country = req.query.country?.toUpperCase();
  if (country && CRISIS_RESOURCES[country]) {
    return res.json({ success: true, resources: CRISIS_RESOURCES[country] });
  }
  res.json({ success: true, resources: CRISIS_RESOURCES });
});

// Main Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, country = 'IN', history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        reply: "Please type a message so I can listen and support you."
      });
    }

    const trimmed = message.trim();

    if (trimmed.length > 1500) {
      return res.status(400).json({
        success: false,
        reply: "Your message is a bit long. Please share it in shorter messages so we can discuss it step by step."
      });
    }

    // Step 1: Crisis Detection
    if (isCrisisMessage(trimmed)) {
      const crisisData = getCrisisResponse(country);
      return res.json({
        success: true,
        crisis: true,
        reply: crisisData.reply,
        resources: crisisData.resources
      });
    }

    // Step 2: Call Gemini AI
    const replyText = await callGemini(trimmed, history);

    return res.json({
      success: true,
      crisis: false,
      reply: replyText
    });

  } catch (error) {
    console.error("Chat API Error:", error.message);
    const safeReply = generateLocalSupportiveFallback(trimmed);
    return res.json({
      success: true,
      crisis: false,
      reply: safeReply
    });
  }
});

// Fallback for unmatched API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, reply: "API endpoint not found." });
});

// Route any other page request to index.html for smooth single-page UX
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Start Express Server with automatic port fallback
function startServer(portToUse) {
  const server = app.listen(portToUse, () => {
    console.log(`==================================================================`);
    console.log(`  🌟 MindCare AI Server is running on port ${portToUse}`);
    const appUrl = `http://localhost:${portToUse}`;
    console.log(`  🔗 Web App URL:      ${appUrl}`);
    console.log(`  🏥 Health Check:     ${appUrl}/api/health`);
    console.log(`  💬 Chat API:         ${appUrl}/api/chat`);
    console.log(`==================================================================`);

    try {
      const openCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
      exec(`${openCmd} ${appUrl}`);
    } catch (openErr) {}
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = Number(portToUse) + 1;
      console.warn(`⚠️  Port ${portToUse} is already in use by another app.`);
      console.log(`🔄 Automatically switching to port ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
