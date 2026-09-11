/**
 * MindCare AI – Frontend Application Logic
 * Integrates Chatbot, Gemini API, Crisis Detection, Mood Tracker,
 * Breathing Exercise Pacer, 5-4-3-2-1 Grounding, and Private Journal.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all app modules
  initNavigation();
  initDashboardAndMood();
  initWellnessTips();
  initChatbot();
  initBreathingTool();
  initGroundingTool();
  initJournalTool();
});

// ==========================================================================
// 1. NAVIGATION & GENERAL UI
// ==========================================================================
function initNavigation() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      navToggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        if (navToggle) navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });
  }

  // Active navigation link highlighting on scroll
  window.addEventListener('scroll', () => {
    let currentSection = 'home';
    const sections = document.querySelectorAll('section[id]');

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });
}

// Toast notification helper
function showToast(message, icon = 'fa-check') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHTML(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================================================
// 2. WELLNESS DASHBOARD & MOOD TRACKER
// ==========================================================================
const MOOD_FEEDBACKS = {
  Happy: "Wonderful to hear! Hold onto this lightness and take note of what brought you joy today.",
  Good: "Glad you are feeling good today! Maintaining steady positive moments builds resilience.",
  Okay: "It is completely fine to just feel okay. Be gentle with your expectations today.",
  Sad: "I am sorry things feel heavy today. Remember that sadness comes in waves and you don't have to face it alone.",
  Anxious: "Notice the anxiety without judging yourself. Try taking 3 slow, deep belly breaths right now.",
  Angry: "Anger is an emotion signaling boundary or frustration. Take some physical space to cool down safely.",
  Tired: "Your body is asking for recovery. Give yourself permission to rest or pause when possible."
};

function initDashboardAndMood() {
  const dateDisplay = document.getElementById('currentDateDisplay');
  if (dateDisplay) {
    const today = new Date();
    dateDisplay.textContent = today.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  const moodButtons = document.querySelectorAll('.mood-btn');
  const feedbackText = document.getElementById('moodFeedbackText');
  const clearMoodBtn = document.getElementById('clearMoodBtn');

  // Load existing mood history from localStorage
  renderMoodHistory();

  moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mood = btn.getAttribute('data-mood');
      const emoji = btn.getAttribute('data-emoji');

      // Highlight active button
      moodButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      // Display supportive feedback
      if (feedbackText) {
        feedbackText.innerHTML = `<strong>${emoji} ${mood}:</strong> ${MOOD_FEEDBACKS[mood] || "Thank you for checking in with your feelings."}`;
      }

      // Save to localStorage
      saveMoodToHistory(mood, emoji);
      renderMoodHistory();
    });
  });

  if (clearMoodBtn) {
    clearMoodBtn.addEventListener('click', () => {
      localStorage.removeItem('mindcare_mood_log');
      renderMoodHistory();
      if (feedbackText) {
        feedbackText.textContent = "Mood log reset. Tap an emoji above to check in.";
      }
      moodButtons.forEach(b => b.classList.remove('selected'));
      showToast("Mood log cleared.", "fa-rotate-left");
    });
  }
}

function saveMoodToHistory(mood, emoji) {
  const history = JSON.parse(localStorage.getItem('mindcare_mood_log') || '[]');
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  history.unshift({ mood, emoji, time: timeStr });
  if (history.length > 8) history.pop();

  localStorage.setItem('mindcare_mood_log', JSON.stringify(history));
}

function renderMoodHistory() {
  const container = document.getElementById('moodHistoryList');
  if (!container) return;

  const history = JSON.parse(localStorage.getItem('mindcare_mood_log') || '[]');

  if (history.length === 0) {
    container.innerHTML = '<span class="empty-history-text">No moods recorded yet today.</span>';
    return;
  }

  container.innerHTML = history.map(item => `
    <span class="mood-chip">
      <span>${item.emoji} ${item.mood}</span>
      <span class="chip-time">${item.time}</span>
    </span>
  `).join('');
}

// ==========================================================================
// 3. ROTATING DAILY WELLNESS TIPS
// ==========================================================================
const WELLNESS_TIPS = [
  {
    category: "Hydration & Calm",
    text: "Pause for a moment and drink a cold glass of water slowly. Physical sensations help ground your nervous system during racing thoughts."
  },
  {
    category: "Rest & Sleep",
    text: "Put screens away 30-45 minutes before sleep. Blue light suppresses melatonin, tricking your brain into daytime wakefulness."
  },
  {
    category: "Study Breaks",
    text: "Practice the 25-5 Pomodoro rhythm: 25 minutes of focused study, followed by 5 minutes of moving away from your chair and screens."
  },
  {
    category: "Social Connection",
    text: "Send a quick note of appreciation or hello to a trusted friend. Human connection releases oxytocin and buffers cortisol."
  },
  {
    category: "Overthinking & Journaling",
    text: "When anxious thoughts keep repeating, write them raw onto paper. Externalizing mental loops frees up working memory."
  },
  {
    category: "Gentle Movement",
    text: "A brief 10-minute walk outside helps release tension held in your shoulders and resets mental focus."
  },
  {
    category: "Self-Compassion",
    text: "Talk to yourself the way you would speak to a close friend having a tough day. Harsh self-criticism never improves performance."
  },
  {
    category: "Mindful Breathing",
    text: "Taking just 3 deliberate, slow exhalations triggers your vagus nerve to slow your heartbeat and lower acute stress."
  }
];

function initWellnessTips() {
  let currentTipIndex = 0;
  const categoryElem = document.getElementById('tipCategory');
  const textElem = document.getElementById('tipText');
  const indicatorElem = document.getElementById('tipIndexIndicator');
  const nextBtn = document.getElementById('nextTipBtn');
  const nextBtnSec = document.getElementById('nextTipBtnSecondary');

  function updateTip() {
    const tip = WELLNESS_TIPS[currentTipIndex];
    if (categoryElem) categoryElem.textContent = tip.category;
    if (textElem) textElem.textContent = `"${tip.text}"`;
    if (indicatorElem) indicatorElem.textContent = `Tip ${currentTipIndex + 1} of ${WELLNESS_TIPS.length}`;
  }

  function advanceTip() {
    currentTipIndex = (currentTipIndex + 1) % WELLNESS_TIPS.length;
    updateTip();
  }

  if (nextBtn) nextBtn.addEventListener('click', advanceTip);
  if (nextBtnSec) nextBtnSec.addEventListener('click', advanceTip);

  updateTip();
}

// ==========================================================================
// 4. CHATBOT ENGINE & GEMINI API INTEGRATION
// ==========================================================================
let chatHistory = [];
let lastUserMessage = '';

function initChatbot() {
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const charCounter = document.getElementById('charCounter');
  const newChatBtn = document.getElementById('newChatBtn');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const dismissCrisisAlert = document.getElementById('dismissCrisisAlert');
  const quickChips = document.querySelectorAll('.prompt-chip');
  const welcomeTime = document.getElementById('welcomeTime');

  if (welcomeTime) {
    welcomeTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Restore existing chat from localStorage if available
  loadSavedChat();

  // Auto-resize textarea and character counter
  if (chatInput) {
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';

      const len = chatInput.value.length;
      if (charCounter) {
        charCounter.textContent = `${len} / 1500`;
        charCounter.style.color = len > 1400 ? 'var(--danger)' : 'var(--text-subtle)';
      }
    });

    // Enter to send, Shift+Enter for newline
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
      }
    });
  }

  // Handle message submission
  if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = chatInput.value.trim();
      if (!message) return;

      chatInput.value = '';
      chatInput.style.height = 'auto';
      if (charCounter) charCounter.textContent = '0 / 1500';

      await handleSendMessage(message);
    });
  }

  // Quick suggestion prompts
  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.getAttribute('data-text');
      if (text) {
        handleSendMessage(text);
      }
    });
  });

  // New Chat
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      resetChat(true);
      showToast("Started a new conversation.", "fa-plus");
    });
  }

  // Clear Chat
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to clear your conversation history?")) {
        resetChat(false);
        showToast("Conversation cleared.", "fa-trash-can");
      }
    });
  }

  // Dismiss crisis banner
  if (dismissCrisisAlert) {
    dismissCrisisAlert.addEventListener('click', () => {
      document.getElementById('chatCrisisAlert')?.classList.add('hidden');
    });
  }
}

async function handleSendMessage(message) {
  lastUserMessage = message;

  // Append user message to UI
  appendMessageToUI('user', message);

  // Add to history
  chatHistory.push({ role: 'user', content: message });
  saveChatToStorage();

  // Show typing indicator
  setTypingIndicator(true);
  scrollToChatBottom();

  const countrySelect = document.getElementById('countrySelect');
  const selectedCountry = countrySelect ? countrySelect.value : 'IN';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        country: selectedCountry,
        history: chatHistory.slice(-6)
      })
    });

    const data = await response.json();
    setTypingIndicator(false);

    if (data && data.reply) {
      // Append AI response to UI
      appendMessageToUI('assistant', data.reply, data.crisis);

      // Save to history
      chatHistory.push({ role: 'assistant', content: data.reply });
      saveChatToStorage();

      // If crisis flag is raised, highlight crisis banner in chat
      if (data.crisis) {
        showCrisisAlertInChat(data.resources);
      }
    } else {
      throw new Error(data.reply || "Invalid server response");
    }

  } catch (error) {
    console.error("Chat communication error:", error);
    setTypingIndicator(false);
    appendErrorMessageToUI("Sorry, I'm having trouble responding right now. Please check your connection and try again in a moment.");
  }

  scrollToChatBottom();
}

function appendMessageToUI(role, content, isCrisis = false) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const row = document.createElement('div');
  row.className = `message-row ${role === 'user' ? 'user-row' : 'bot-row'}`;

  const formattedContent = formatChatMessage(content);

  if (role === 'user') {
    row.innerHTML = `
      <div class="msg-avatar user-avatar"><i class="fa-solid fa-user"></i></div>
      <div class="msg-bubble user-bubble">
        <div class="msg-author-name">You</div>
        <div class="msg-content">${formattedContent}</div>
        <div class="msg-footer">
          <span class="msg-time">${timeStr}</span>
        </div>
      </div>
    `;
  } else {
    row.innerHTML = `
      <div class="msg-avatar bot-avatar"><i class="fa-solid fa-leaf"></i></div>
      <div class="msg-bubble bot-bubble ${isCrisis ? 'crisis-response' : ''}">
        <div class="msg-author-name">${isCrisis ? 'MindCare AI – Urgent Safety Notice' : 'MindCare AI'}</div>
        <div class="msg-content">${formattedContent}</div>
        <div class="msg-footer">
          <span class="msg-time">${timeStr}</span>
          <button class="msg-action-btn copy-btn" title="Copy message" onclick="copyMessageText(this)">
            <i class="fa-regular fa-copy"></i>
          </button>
        </div>
      </div>
    `;
  }

  container.appendChild(row);
  scrollToChatBottom();
}

function appendErrorMessageToUI(errorMessage) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'message-row bot-row';
  row.innerHTML = `
    <div class="msg-avatar bot-avatar"><i class="fa-solid fa-triangle-exclamation text-danger"></i></div>
    <div class="msg-bubble bot-bubble" style="border-color: var(--danger-light); background: #FFFBFB;">
      <div class="msg-author-name text-danger">Connection Alert</div>
      <div class="msg-content">${escapeHTML(errorMessage)}</div>
      <div class="msg-footer">
        <button class="btn btn-outline btn-sm" onclick="retryLastMessage()" style="padding: 4px 10px; font-size: 0.78rem;">
          <i class="fa-solid fa-rotate-right"></i> Retry
        </button>
      </div>
    </div>
  `;
  container.appendChild(row);
  scrollToChatBottom();
}

window.retryLastMessage = function() {
  if (lastUserMessage) {
    handleSendMessage(lastUserMessage);
  }
};

window.copyMessageText = function(btn) {
  const bubble = btn.closest('.msg-bubble');
  const content = bubble ? bubble.querySelector('.msg-content') : null;
  if (content) {
    navigator.clipboard.writeText(content.innerText).then(() => {
      btn.innerHTML = '<i class="fa-solid fa-check text-success"></i>';
      showToast("Copied to clipboard!", "fa-copy");
      setTimeout(() => {
        btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
      }, 2000);
    });
  }
};

function showCrisisAlertInChat(resources) {
  const alertBar = document.getElementById('chatCrisisAlert');
  const snippet = document.getElementById('crisisHotlineSnippet');
  if (alertBar) {
    if (snippet && resources) {
      snippet.innerHTML = `Immediate Support (${escapeHTML(resources.country)}): <strong>${escapeHTML(resources.emergency)} / ${escapeHTML(resources.helpline)}</strong>`;
    }
    alertBar.classList.remove('hidden');
  }
}

function setTypingIndicator(show) {
  const indicator = document.getElementById('typingIndicator');
  const sendBtn = document.getElementById('sendBtn');
  if (indicator) {
    if (show) indicator.classList.remove('hidden');
    else indicator.classList.add('hidden');
  }
  if (sendBtn) {
    sendBtn.disabled = show;
  }
}

function scrollToChatBottom() {
  const container = document.getElementById('chatMessages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function saveChatToStorage() {
  localStorage.setItem('mindcare_chat_history', JSON.stringify(chatHistory));
}

function loadSavedChat() {
  const saved = localStorage.getItem('mindcare_chat_history');
  if (saved) {
    try {
      chatHistory = JSON.parse(saved);
      if (Array.isArray(chatHistory) && chatHistory.length > 0) {
        chatHistory.forEach(item => {
          appendMessageToUI(item.role, item.content);
        });
      }
    } catch (e) {
      console.warn("Could not parse saved chat history:", e);
      chatHistory = [];
    }
  }
}

function resetChat(keepWelcome = true) {
  chatHistory = [];
  localStorage.removeItem('mindcare_chat_history');

  const container = document.getElementById('chatMessages');
  if (!container) return;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (keepWelcome) {
    container.innerHTML = `
      <div class="message-row bot-row">
        <div class="msg-avatar bot-avatar"><i class="fa-solid fa-leaf"></i></div>
        <div class="msg-bubble bot-bubble">
          <div class="msg-author-name">MindCare AI</div>
          <div class="msg-content">
            Hi! I'm <strong>MindCare AI</strong>. I'm here to listen, provide supportive guidance, and explore healthy coping strategies with you.
            <br><br>
            Whether you're carrying exam stress, feeling lonely, overwhelmed, or just need a safe space to vent, I'm here for you. What would you like to talk about today?
          </div>
          <div class="msg-footer">
            <span class="msg-time">${timeStr}</span>
            <button class="msg-action-btn copy-btn" title="Copy response" onclick="copyMessageText(this)">
              <i class="fa-regular fa-copy"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = '';
  }

  document.getElementById('chatCrisisAlert')?.classList.add('hidden');
}

// Markdown-like formatter for bullet points, bolding, and links
function formatChatMessage(text) {
  if (!text) return '';
  let escaped = escapeHTML(text);

  // Bold **text**
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Bullet items (lines beginning with • or - or *)
  const lines = escaped.split('\n');
  let inList = false;
  let result = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      const itemContent = trimmed.replace(/^([•\-\*]\s*)/, '');
      result.push(`<li>${itemContent}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (trimmed.length > 0) {
        result.push(`<p>${trimmed}</p>`);
      }
    }
  }

  if (inList) result.push('</ul>');

  // Turn URLs into clickable links safely
  let finalHtml = result.join('');
  finalHtml = finalHtml.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" class="text-underline">$1</a>');

  return finalHtml;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// 5. BREATHING EXERCISE PACER
// ==========================================================================
let breathInterval = null;
let sessionTimerInterval = null;
let breathState = 'idle'; // 'idle', 'running', 'paused'
let breathPhase = 'in';   // 'in', 'hold', 'out', 'rest'
let phaseCountdown = 4;
let totalSecondsInSession = 0;
let completedCycles = 0;

function initBreathingTool() {
  const startBtn = document.getElementById('startBreathBtn');
  const pauseBtn = document.getElementById('pauseBreathBtn');
  const resetBtn = document.getElementById('resetBreathBtn');
  const modeSelect = document.getElementById('breathMode');

  if (!startBtn) return;

  startBtn.addEventListener('click', startBreathingSession);
  pauseBtn.addEventListener('click', pauseBreathingSession);
  resetBtn.addEventListener('click', resetBreathingSession);

  if (modeSelect) {
    modeSelect.addEventListener('change', () => {
      resetBreathingSession();
    });
  }
}

function startBreathingSession() {
  if (breathState === 'running') return;

  breathState = 'running';
  document.getElementById('startBreathBtn').disabled = true;
  document.getElementById('pauseBreathBtn').disabled = false;

  // Start duration timer if not running
  if (!sessionTimerInterval) {
    sessionTimerInterval = setInterval(() => {
      totalSecondsInSession++;
      updateSessionTimerDisplay();
    }, 1000);
  }

  runBreathingStep();
  breathInterval = setInterval(runBreathingStep, 1000);
}

function pauseBreathingSession() {
  if (breathState !== 'running') return;

  breathState = 'paused';
  clearInterval(breathInterval);
  clearInterval(sessionTimerInterval);
  sessionTimerInterval = null;

  document.getElementById('startBreathBtn').disabled = false;
  document.getElementById('pauseBreathBtn').disabled = true;
  document.getElementById('breathInstruction').textContent = 'Paused';
}

function resetBreathingSession() {
  breathState = 'idle';
  clearInterval(breathInterval);
  clearInterval(sessionTimerInterval);
  sessionTimerInterval = null;

  totalSecondsInSession = 0;
  completedCycles = 0;
  breathPhase = 'in';
  phaseCountdown = 4;

  const core = document.getElementById('breathCircleCore');
  if (core) {
    core.className = 'breathing-circle-core';
  }

  document.getElementById('breathInstruction').textContent = 'Ready';
  document.getElementById('breathCountdown').textContent = '--';
  document.getElementById('breathCycles').textContent = '0';
  document.getElementById('breathTimer').textContent = '00:00';

  document.getElementById('startBreathBtn').disabled = false;
  document.getElementById('pauseBreathBtn').disabled = true;
}

function runBreathingStep() {
  const mode = document.getElementById('breathMode')?.value || 'box';
  const core = document.getElementById('breathCircleCore');
  const instruction = document.getElementById('breathInstruction');
  const countdown = document.getElementById('breathCountdown');

  // Cycle Configuration
  // Box: 4s In, 4s Hold, 4s Out, 4s Rest
  // Relax (4-7-8): 4s In, 7s Hold, 8s Out
  if (phaseCountdown <= 0) {
    if (mode === 'box') {
      if (breathPhase === 'in') {
        breathPhase = 'hold';
        phaseCountdown = 4;
      } else if (breathPhase === 'hold') {
        breathPhase = 'out';
        phaseCountdown = 4;
      } else if (breathPhase === 'out') {
        breathPhase = 'rest';
        phaseCountdown = 4;
      } else {
        breathPhase = 'in';
        phaseCountdown = 4;
        completedCycles++;
        document.getElementById('breathCycles').textContent = completedCycles;
      }
    } else { // 4-7-8
      if (breathPhase === 'in') {
        breathPhase = 'hold';
        phaseCountdown = 7;
      } else if (breathPhase === 'hold') {
        breathPhase = 'out';
        phaseCountdown = 8;
      } else {
        breathPhase = 'in';
        phaseCountdown = 4;
        completedCycles++;
        document.getElementById('breathCycles').textContent = completedCycles;
      }
    }
  }

  // Update visual animation and text
  if (breathPhase === 'in') {
    instruction.textContent = 'Breathe In...';
    if (core) {
      core.className = 'breathing-circle-core breath-expand';
      core.style.transitionDuration = '4s';
    }
  } else if (breathPhase === 'hold') {
    instruction.textContent = 'Gently Hold...';
    if (core) {
      core.className = 'breathing-circle-core breath-hold';
      core.style.transitionDuration = '0.3s';
    }
  } else if (breathPhase === 'out') {
    instruction.textContent = 'Breathe Out...';
    if (core) {
      core.className = 'breathing-circle-core breath-contract';
      const outDuration = mode === 'relax' ? '8s' : '4s';
      core.style.transitionDuration = outDuration;
    }
  } else if (breathPhase === 'rest') {
    instruction.textContent = 'Rest...';
    if (core) {
      core.className = 'breathing-circle-core';
      core.style.transitionDuration = '1s';
    }
  }

  countdown.textContent = phaseCountdown;
  phaseCountdown--;
}

function updateSessionTimerDisplay() {
  const minutes = Math.floor(totalSecondsInSession / 60);
  const seconds = totalSecondsInSession % 60;
  const timerElem = document.getElementById('breathTimer');
  if (timerElem) {
    timerElem.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

// ==========================================================================
// 6. 5-4-3-2-1 GROUNDING EXERCISE WIZARD
// ==========================================================================
const GROUNDING_STEPS = [
  {
    step: 1,
    sense: "SEE",
    icon: "fa-eye",
    title: "5 Things You Can SEE",
    prompt: "Scan your surroundings right now. Spot 5 distinct objects, patterns, or colors.",
    placeholders: [
      "A pattern in the wall or floor",
      "A clock or phone screen",
      "A book or notebook on a table",
      "Light coming through a window",
      "A favorite photo or object nearby"
    ]
  },
  {
    step: 2,
    sense: "TOUCH",
    icon: "fa-hand",
    title: "4 Things You Can TOUCH / FEEL",
    prompt: "Notice physical touch sensations in your current environment.",
    placeholders: [
      "The texture of your clothes or jacket",
      "The cool or warm surface beneath your hands",
      "The solid floor holding up your feet",
      "Your hair or skin resting gently"
    ]
  },
  {
    step: 3,
    sense: "HEAR",
    icon: "fa-ear-listen",
    title: "3 Things You Can HEAR",
    prompt: "Listen past your racing thoughts. Tune in to external background sounds.",
    placeholders: [
      "The hum of a fan, AC, or computer",
      "Distant traffic, birds, or chatter outside",
      "The gentle sound of your own steady breath"
    ]
  },
  {
    step: 4,
    sense: "SMELL",
    icon: "fa-wind",
    title: "2 Things You Can SMELL",
    prompt: "Gently inhale through your nose. What aromas or scents are in the room?",
    placeholders: [
      "The fresh air, coffee, or soap on your hands",
      "A familiar scent on your clothing or room"
    ]
  },
  {
    step: 5,
    sense: "TASTE",
    icon: "fa-mug-hot",
    title: "1 Thing You Can TASTE",
    prompt: "Notice the present taste in your mouth, or take a refreshing sip of cool water.",
    placeholders: [
      "A lingering flavor of mint, tea, or a sip of cold water"
    ]
  }
];

let currentGroundingStep = 0;

function initGroundingTool() {
  const prevBtn = document.getElementById('prevGroundingBtn');
  const nextBtn = document.getElementById('nextGroundingBtn');
  const resetBtn = document.getElementById('resetGroundingBtn');

  if (!prevBtn || !nextBtn) return;

  renderGroundingStep();

  prevBtn.addEventListener('click', () => {
    if (currentGroundingStep > 0) {
      currentGroundingStep--;
      renderGroundingStep();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentGroundingStep < GROUNDING_STEPS.length - 1) {
      currentGroundingStep++;
      renderGroundingStep();
    } else {
      // Completed all steps!
      renderGroundingCompletion();
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentGroundingStep = 0;
      resetBtn.classList.add('hidden');
      document.getElementById('prevGroundingBtn').classList.remove('hidden');
      document.getElementById('nextGroundingBtn').classList.remove('hidden');
      renderGroundingStep();
    });
  }
}

function renderGroundingStep() {
  const data = GROUNDING_STEPS[currentGroundingStep];
  const pill = document.getElementById('groundingStepPill');
  const iconWrap = document.getElementById('senseIconWrap');
  const title = document.getElementById('senseTitle');
  const prompt = document.getElementById('sensePrompt');
  const inputsContainer = document.getElementById('groundingInputs');
  const prevBtn = document.getElementById('prevGroundingBtn');
  const nextBtn = document.getElementById('nextGroundingBtn');

  if (pill) pill.textContent = `Step ${data.step} of 5`;
  if (iconWrap) iconWrap.innerHTML = `<i class="fa-solid ${data.icon}"></i>`;
  if (title) title.textContent = data.title;
  if (prompt) prompt.textContent = data.prompt;

  if (inputsContainer) {
    inputsContainer.innerHTML = data.placeholders.map((ph, idx) => `
      <div class="grounding-item-row">
        <input type="checkbox" id="g_check_${idx}" class="grounding-check" checked>
        <input type="text" class="grounding-text-input" value="${escapeHTML(ph)}" placeholder="Type what you notice...">
      </div>
    `).join('');
  }

  if (prevBtn) prevBtn.disabled = currentGroundingStep === 0;
  if (nextBtn) {
    nextBtn.innerHTML = currentGroundingStep === GROUNDING_STEPS.length - 1 ?
      'Complete Exercise <i class="fa-solid fa-check"></i>' :
      'Next Step <i class="fa-solid fa-arrow-right"></i>';
  }
}

function renderGroundingCompletion() {
  const iconWrap = document.getElementById('senseIconWrap');
  const title = document.getElementById('senseTitle');
  const prompt = document.getElementById('sensePrompt');
  const inputsContainer = document.getElementById('groundingInputs');
  const pill = document.getElementById('groundingStepPill');
  const prevBtn = document.getElementById('prevGroundingBtn');
  const nextBtn = document.getElementById('nextGroundingBtn');
  const resetBtn = document.getElementById('resetGroundingBtn');

  if (pill) pill.textContent = 'Completed ✨';
  if (iconWrap) iconWrap.innerHTML = '<i class="fa-solid fa-heart-circle-check text-success"></i>';
  if (title) title.textContent = "You Have Re-Anchored Yourself!";
  if (prompt) prompt.textContent = "Take a moment to appreciate your presence. You just brought your mind out of spiraling thoughts and safely back into the room.";
  if (inputsContainer) {
    inputsContainer.innerHTML = `
      <div style="text-align: center; padding: 20px; background: #FFFFFF; border-radius: 12px; border: 1.5px solid var(--primary-border);">
        <p style="font-weight: 700; color: var(--primary); margin-bottom: 8px;">🌟 Outstanding effort!</p>
        <p style="font-size: 0.92rem; color: var(--text-muted);">Whenever your thoughts start racing again, remember your five senses are always right here to anchor you.</p>
      </div>
    `;
  }

  if (prevBtn) prevBtn.classList.add('hidden');
  if (nextBtn) nextBtn.classList.add('hidden');
  if (resetBtn) resetBtn.classList.remove('hidden');

  showToast("Grounding complete! Great job centering your mind.", "fa-award");
}

// ==========================================================================
// 7. PRIVATE REFLECTION JOURNAL
// ==========================================================================
function initJournalTool() {
  const form = document.getElementById('journalForm');
  const titleInput = document.getElementById('journalTitle');
  const moodInput = document.getElementById('journalMoodTag');
  const textInput = document.getElementById('journalText');

  renderJournalEntries();

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = titleInput.value.trim();
      const mood = moodInput.value;
      const text = textInput.value.trim();

      if (!title || !text) return;

      saveJournalEntry({
        id: Date.now().toString(),
        title,
        mood,
        text,
        date: new Date().toLocaleDateString(undefined, {
          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
      });

      titleInput.value = '';
      textInput.value = '';
      renderJournalEntries();
      showToast("Reflection saved locally.", "fa-floppy-disk");
    });
  }
}

function saveJournalEntry(entry) {
  const entries = JSON.parse(localStorage.getItem('mindcare_journal') || '[]');
  entries.unshift(entry);
  localStorage.setItem('mindcare_journal', JSON.stringify(entries));
}

function renderJournalEntries() {
  const list = document.getElementById('journalList');
  const countBadge = document.getElementById('journalCountBadge');
  if (!list) return;

  const entries = JSON.parse(localStorage.getItem('mindcare_journal') || '[]');
  if (countBadge) countBadge.textContent = `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`;

  if (entries.length === 0) {
    list.innerHTML = `
      <div class="empty-journal-notice">
        <i class="fa-regular fa-note-sticky"></i>
        <p>Your journal is currently empty. Write your first reflection above!</p>
      </div>
    `;
    return;
  }

  list.innerHTML = entries.map(entry => `
    <div class="journal-entry-card" id="entry_${entry.id}">
      <div class="entry-top-row">
        <span class="entry-title">${escapeHTML(entry.title)}</span>
        <button class="entry-delete-btn" onclick="deleteJournalEntry('${entry.id}')" title="Delete entry">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
      <div class="entry-meta">
        <span class="entry-mood-tag">${escapeHTML(entry.mood)}</span>
        <span>${escapeHTML(entry.date)}</span>
      </div>
      <div class="entry-text">${escapeHTML(entry.text)}</div>
    </div>
  `).join('');
}

window.deleteJournalEntry = function(id) {
  if (confirm("Delete this reflection entry?")) {
    let entries = JSON.parse(localStorage.getItem('mindcare_journal') || '[]');
    entries = entries.filter(e => e.id !== id);
    localStorage.setItem('mindcare_journal', JSON.stringify(entries));
    renderJournalEntries();
    showToast("Entry removed.", "fa-trash-can");
  }
};
