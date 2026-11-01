/**
 * MCE Hassan - CSE III Sem Section C
 * Timetable & Classroom AI Chatbot Frontend
 */

// Timetable Data Object
let TIMETABLE_DATA = null;

// Application State
const state = {
  activeTab: 'tab-chat',
  simulatedDay: null,
  simulatedTime: null,
  ttsEnabled: false,
  geminiApiKey: localStorage.getItem('mce_gemini_api_key') || '',
  useGemini: localStorage.getItem('mce_use_gemini') === 'true',
  theme: localStorage.getItem('mce_theme') || 'light',
  chatHistory: []
};

// Days map
const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_ALIASES = {
  'mon': 'Monday', 'monday': 'Monday',
  'tue': 'Tuesday', 'tues': 'Tuesday', 'tuesday': 'Tuesday',
  'wed': 'Wednesday', 'wednesday': 'Wednesday',
  'thu': 'Thursday', 'thur': 'Thursday', 'thurs': 'Thursday', 'thursday': 'Thursday',
  'fri': 'Friday', 'friday': 'Friday',
  'sat': 'Saturday', 'saturday': 'Saturday',
  'sun': 'Sunday', 'sunday': 'Sunday'
};

const STOP_WORDS = new Set([
  'who', 'is', 'are', 'the', 'for', 'of', 'in', 'at', 'to', 'a', 'an', 'on', 'when',
  'do', 'does', 'we', 'have', 'there', 'any', 'some', 'can', 'you', 'i', 'my', 'our',
  'teaches', 'teaching', 'teacher', 'teachers', 'faculty', 'faculties', 'prof', 'professor',
  'sir', 'madam', 'mam', 'maam', 'class', 'classes', 'subject', 'subjects',
  'tell', 'me', 'about', 'give', 'details', 'info', 'information', 'what', 'where', 'which'
]);

const SUBJECT_ALIASES = {
  'dsa': ['data structures', '25cs303', '25cs305', 'dsa lab', 'data structures laboratory'],
  'data structures': ['dsa', '25cs303', '25cs305'],
  'm3': ['mathematics', 'maths', '25macs301', 'mathematics for computer science'],
  'maths': ['m3', 'mathematics', '25macs301'],
  'mathematics': ['m3', 'maths', '25macs301'],
  'ddco': ['digital design', 'computer organization', '25cs302', 'ddco-p'],
  'digital design': ['ddco', '25cs302'],
  'oopj': ['oops with java', 'java', 'oop', '25cs304', 'oopj-p'],
  'java': ['oopj', 'oops with java', '25cs304', 'oopj-p'],
  'oop': ['oopj', 'oops with java', '25cs304'],
  'unix': ['unix and shell programming', 'shell', '25cs306', 'unix lab'],
  'shell': ['unix', '25cs306'],
  'iot': ['internet of things', '24cs563'],
  'internet of things': ['iot', '24cs563'],
  'scr': ['community', 'societal project', '25scr'],
  'pt1': ['placement training', 'placement', 'aptitude', '25pt1'],
  'placement': ['pt1', 'placement training', '25pt1'],
  'excel': ['data analytics with excel', 'analytics', '25cs307', '25cs307b/c'],
  'python': ['data visualization with python', 'visualization', '25cs307', '25cs307b/c'],
  'dip': ['bridge course', '25bcm301', 'm3-dip', 'dip maths'],
  'bridge': ['dip', 'bridge course mathematics', '25bcm301']
};

const GENERIC_WORDS = new Set(['laboratory', 'lab', 'computer', 'science', 'engineering', 'applications', 'department', 'studies', 'course']);

// Slang, abbreviations & common typo mappings
const SLANG_AND_TYPOS = {
  'wat': 'what', 'wht': 'what', 'whr': 'where', 'wer': 'where', 'wen': 'when', 'wn': 'when',
  'whos': 'who is', 'whois': 'who is', 'rn': 'right now', 'nxt': 'next', 'pls': 'please', 'plz': 'please',
  'u': 'you', 'ur': 'your', 'r': 'are',
  'kahan': 'where is', 'kaha': 'where is', 'kidhar': 'where is', 'kab': 'when is',
  'khali': 'free', 'konsa': 'which', 'kon': 'who',
  'mondy': 'monday', 'mnday': 'monday', 'monady': 'monday',
  'tuesdy': 'tuesday', 'tuseday': 'tuesday', 'tueasday': 'tuesday', 'tues': 'tuesday',
  'wensday': 'wednesday', 'wednsday': 'wednesday', 'wednesdy': 'wednesday', 'wed': 'wednesday',
  'thursdy': 'thursday', 'thurday': 'thursday', 'thrusday': 'thursday', 'thurs': 'thursday',
  'firday': 'friday', 'fridya': 'friday', 'fri': 'friday',
  'satrday': 'saturday', 'saterday': 'saturday', 'sat': 'saturday',
  'sundya': 'sunday', 'sundy': 'sunday', 'tday': 'today', 'tody': 'today',
  'tmrw': 'tomorrow', 'tommorow': 'tomorrow', 'tomorow': 'tomorrow',
  'fre': 'free', 'fee': 'free', 'priod': 'period', 'priods': 'periods', 'perid': 'period',
  'clss': 'class', 'clas': 'class', 'sedule': 'schedule', 'shedule': 'schedule',
  'schedual': 'schedule', 'skedule': 'schedule', 'timetbl': 'timetable', 'timmings': 'timings',
  'timngs': 'timings', 'tyme': 'time',
  'facaultys': 'faculty', 'facaulty': 'faculty', 'facalty': 'faculty', 'facultiy': 'faculty',
  'faculties': 'faculty', 'techr': 'teacher', 'techrs': 'teachers', 'proffesor': 'professor',
  'mam': 'madam', 'maam': 'madam', 'clasroom': 'classroom', 'romm': 'room', 'romms': 'rooms',
  'honeywel': 'honeywell', 'e301': 'ee301', 'ee-301': 'ee301', 'cslab4': 'cslab-4', 'cslab2': 'cslab-2',
  'datastructures': 'data structures', 'datastructure': 'data structures', 'ds': 'dsa',
  'jaava': 'java', 'jav': 'java', 'oops': 'oopj', 'oop': 'oopj', 'unx': 'unix',
  'pytn': 'python', 'pythn': 'python', 'excl': 'excel', 'exel': 'excel',
  'mathe': 'maths', 'math': 'maths', 'math3': 'm3', 'dco': 'ddco', 'ddc': 'ddco',
  'brek': 'break', 'lnch': 'lunch', 'intervl': 'interval',
  'teching': 'teaching', 'techer': 'teacher', 'roop': 'roopa', 'rupa': 'roopa',
  'sruthi': 'shruthi', 'shruti': 'shruthi', 'ayesha': 'ayeesha', 'aisha': 'ayeesha',
  'bimbha': 'bimba', 'lib': 'library', 'dept': 'department', 'lec': 'lecture', 'lecs': 'lectures',
  'sub': 'subject', 'subs': 'subjects',
  'daark': 'dark', 'drk': 'dark', 'theam': 'theme', 'theem': 'theme'
};

const COMMON_ENGLISH_WORDS = new Set([
  'list', 'all', 'tell', 'show', 'give', 'take', 'takes', 'get', 'got', 'go', 'going',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'who', 'what', 'where', 'when',
  'why', 'how', 'which', 'do', 'does', 'did', 'have', 'has', 'had',
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'not', 'no', 'yes', 'in', 'on', 'at',
  'to', 'for', 'with', 'from', 'by', 'about', 'as', 'of', 'i', 'me', 'my', 'mine',
  'we', 'us', 'our', 'ours', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her',
  'hers', 'they', 'them', 'their', 'any', 'some', 'every', 'each', 'both', 'either',
  'neither', 'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
  'please', 'help', 'details', 'info', 'name', 'names', 'now', 'here', 'there',
  'good', 'bad', 'new', 'old', 'first', 'last', 'next', 'after', 'before'
]);

const COLLEGE_VOCABULARY = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'today', 'tomorrow', 'free', 'period', 'periods', 'schedule', 'timetable', 'routine',
  'timing', 'timings', 'class', 'classes', 'room', 'rooms', 'classroom', 'venue', 'venues',
  'faculty', 'teacher', 'teachers', 'professor', 'lab', 'labs', 'laboratory',
  'practical', 'practicals', 'break', 'lunch', 'interval', 'start', 'starts', 'finish',
  'finishes', 'batch', 'batches', 'hod', 'coordinator', 'dsa', 'ddco', 'oopj', 'java',
  'unix', 'python', 'excel', 'iot', 'mathematics', 'maths', 'bridge', 'placement',
  'project', 'roopa', 'ayeesha', 'siddiqa', 'bimba', 'prasad', 'shruthi', 'chandrika',
  'sindhu', 'nithyashree', 'prakruthi', 'krishna', 'swaroop', 'shashi', 'ananda',
  'babu', 'vinod', 'shobha', 'ee301', 'cslab', 'honeywell',
  'dark', 'light', 'theme', 'mode'
];

function levenshteinDistance(s1, s2) {
  let a = s1, b = s2;
  if (a.length > b.length) { const t = a; a = b; b = t; }
  const row = [];
  for (let i = 0; i <= a.length; i++) row[i] = i;

  for (let i = 1; i <= b.length; i++) {
    let prev = i;
    for (let j = 1; j <= a.length; j++) {
      let val;
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        val = row[j - 1];
      } else {
        val = Math.min(row[j - 1] + 1, prev + 1, row[j] + 1);
      }
      row[j - 1] = prev;
      prev = val;
    }
    row[a.length] = prev;
  }
  return row[a.length];
}

function findBestFuzzyMatch(word, maxDistance = 2) {
  if (word.length <= 2 || COMMON_ENGLISH_WORDS.has(word)) {
    return { match: word, wasFuzzy: false };
  }

  let bestMatch = word;
  let bestDist = 999;

  for (const vocab of COLLEGE_VOCABULARY) {
    if (Math.abs(word.length - vocab.length) > 2) continue;
    const dist = levenshteinDistance(word, vocab);
    if (dist < bestDist && dist <= maxDistance) {
      if (word.length === 3 && dist > 1) continue;
      bestDist = dist;
      bestMatch = vocab;
    }
  }

  if (bestMatch !== word && bestDist <= maxDistance) {
    return { match: bestMatch, wasFuzzy: true };
  }
  return { match: word, wasFuzzy: false };
}

function autocorrectQuery(raw) {
  if (!raw) return { correctedQuery: raw, wasCorrected: false, corrections: [] };

  const tokens = raw.toLowerCase().match(/[\w/]+|[^\w\s]/g) || [];
  const correctedTokens = [];
  const corrections = [];

  tokens.forEach(tok => {
    if (!/^[\w/]+$/.test(tok)) {
      correctedTokens.push(tok);
      return;
    }

    if (SLANG_AND_TYPOS[tok]) {
      const rep = SLANG_AND_TYPOS[tok];
      correctedTokens.push(rep);
      if (rep !== tok) corrections.push({ from: tok, to: rep });
      return;
    }

    const { match, wasFuzzy } = findBestFuzzyMatch(tok);
    if (wasFuzzy) {
      correctedTokens.push(match);
      corrections.push({ from: tok, to: match });
    } else {
      correctedTokens.push(tok);
    }
  });

  let reconstructed = correctedTokens.join(' ');
  reconstructed = reconstructed.replace(/\s+([?,.!'])/g, '$1').replace(/\s+/g, ' ').trim();

  return {
    correctedQuery: reconstructed,
    wasCorrected: corrections.length > 0,
    corrections
  };
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupUI();
  setupEventListeners();
  updateLiveClockAndStatus();
  setInterval(updateLiveClockAndStatus, 1000);
  renderInitialBotGreeting();
});

// Load Timetable Data
async function loadData() {
  if (window.EMBEDDED_TIMETABLE_DATA) {
    TIMETABLE_DATA = window.EMBEDDED_TIMETABLE_DATA;
    renderAllViews();
    return;
  }

  try {
    const res = await fetch('data/timetable.json');
    if (res.ok) {
      TIMETABLE_DATA = await res.json();
      renderAllViews();
      return;
    }
  } catch (e) {
    console.warn('Direct fetch failed, trying API endpoint or fallback...', e);
  }

  try {
    const res = await fetch('/api/timetable');
    if (res.ok) {
      TIMETABLE_DATA = await res.json();
      renderAllViews();
    }
  } catch (err) {
    console.error('Failed to load timetable data', err);
  }
}

// Theme Management (Dark / Light)
function applyTheme(theme) {
  state.theme = theme;
  localStorage.setItem('mce_theme', theme);
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    if (themeIcon) themeIcon.textContent = '☀️';
    if (themeLabel) themeLabel.textContent = 'Light Mode';
  } else {
    document.body.classList.remove('dark-theme');
    if (themeIcon) themeIcon.textContent = '🌙';
    if (themeLabel) themeLabel.textContent = 'Dark Mode';
  }
}

// Setup UI Elements & Navigation
function setupUI() {
  // Navigation Tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
      state.activeTab = targetId;
    });
  });

  // Settings Init
  document.getElementById('geminiApiKeyInput').value = state.geminiApiKey;
  document.getElementById('useGeminiCheckbox').checked = state.useGemini;

  // Apply Theme Preference on Load
  applyTheme(state.theme);
}

// Setup Event Listeners
function setupEventListeners() {
  // Theme Toggle Button
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }

  // Chat form submit
  const chatForm = document.getElementById('chatForm');
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleUserSendMessage();
  });

  // Suggestion chips
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      document.getElementById('userInput').value = query;
      handleUserSendMessage();
    });
  });

  // Time simulator toggle
  const timeMachineBtn = document.getElementById('timeMachineBtn');
  const simPanel = document.getElementById('timeSimulatorPanel');
  timeMachineBtn.addEventListener('click', () => {
    simPanel.classList.toggle('open');
  });

  // Apply simulator
  document.getElementById('applySimBtn').addEventListener('click', () => {
    state.simulatedDay = document.getElementById('simDaySelect').value;
    state.simulatedTime = document.getElementById('simTimeInput').value;
    updateLiveClockAndStatus();
    appendBotMessage(`⏱️ **Time Simulator Activated!** Now viewing as **${state.simulatedDay} at ${state.simulatedTime}**. Ask: *"Where is my class right now?"* to test.`);
  });

  // Reset simulator
  document.getElementById('resetLiveBtn').addEventListener('click', () => {
    state.simulatedDay = null;
    state.simulatedTime = null;
    simPanel.classList.remove('open');
    updateLiveClockAndStatus();
    appendBotMessage('⏱️ **Reset to live real-time clock.**');
  });

  // Voice Recognition (Mic)
  const micBtn = document.getElementById('voiceMicBtn');
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      micBtn.classList.add('listening');
      micBtn.title = 'Listening to your voice...';
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById('userInput').value = transcript;
      handleUserSendMessage();
    };

    recognition.onerror = () => {
      micBtn.classList.remove('listening');
    };

    recognition.onend = () => {
      micBtn.classList.remove('listening');
    };

    micBtn.addEventListener('click', () => {
      try {
        recognition.start();
      } catch (err) {
        recognition.stop();
      }
    });
  } else {
    micBtn.style.display = 'none';
  }

  // TTS Toggle
  const ttsBtn = document.getElementById('ttsToggleBtn');
  ttsBtn.addEventListener('click', () => {
    state.ttsEnabled = !state.ttsEnabled;
    ttsBtn.classList.toggle('active', state.ttsEnabled);
    ttsBtn.title = state.ttsEnabled ? 'Voice output: ON' : 'Voice output: OFF';
  });

  // Clear Chat
  document.getElementById('clearChatBtn').addEventListener('click', () => {
    if (confirm('Clear chat history?')) {
      document.getElementById('chatMessages').innerHTML = '';
      renderInitialBotGreeting();
    }
  });

  // Export Chat
  document.getElementById('exportChatBtn').addEventListener('click', exportChatHistory);

  // Modals
  const docModal = document.getElementById('docModal');
  document.getElementById('viewDocBtn').addEventListener('click', () => docModal.classList.add('open'));
  document.getElementById('closeDocModal').addEventListener('click', () => docModal.classList.remove('open'));
  document.getElementById('closeDocBtn').addEventListener('click', () => docModal.classList.remove('open'));

  const settingsModal = document.getElementById('aiSettingsModal');
  document.getElementById('aiSettingsBtn').addEventListener('click', () => settingsModal.classList.add('open'));
  document.getElementById('closeSettingsModal').addEventListener('click', () => settingsModal.classList.remove('open'));
  
  document.getElementById('saveAiSettingsBtn').addEventListener('click', () => {
    const key = document.getElementById('geminiApiKeyInput').value.trim();
    const use = document.getElementById('useGeminiCheckbox').checked;
    state.geminiApiKey = key;
    state.useGemini = use;
    localStorage.setItem('mce_gemini_api_key', key);
    localStorage.setItem('mce_use_gemini', use.toString());
    settingsModal.classList.remove('open');
    appendBotMessage(`✨ **AI Settings updated!** Gemini Mode: **${use && key ? 'Enabled' : 'Disabled (Built-in Engine Active)'}**`);
  });

  document.getElementById('clearApiKeyBtn').addEventListener('click', () => {
    state.geminiApiKey = '';
    state.useGemini = false;
    document.getElementById('geminiApiKeyInput').value = '';
    document.getElementById('useGeminiCheckbox').checked = false;
    localStorage.removeItem('mce_gemini_api_key');
    localStorage.removeItem('mce_use_gemini');
    settingsModal.classList.remove('open');
    appendBotMessage('🧹 **Gemini API key cleared.** Reverted to built-in smart engine.');
  });

  // Faculty Search Filter
  const facultySearch = document.getElementById('facultySearchInput');
  if (facultySearch) {
    facultySearch.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll('.faculty-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(term) ? 'flex' : 'none';
      });
    });
  }
}

// Time Helper Functions
function parseTime(timeStr) {
  const [h, m] = timeStr.trim().split(':').map(Number);
  return h * 60 + m;
}

function getCurrentDateTime() {
  if (state.simulatedDay && state.simulatedTime) {
    const [h, m] = state.simulatedTime.split(':').map(Number);
    return {
      day: state.simulatedDay,
      timeStr: state.simulatedTime,
      minutes: h * 60 + m,
      isSimulated: true
    };
  }

  const now = new Date();
  const day = DAYS_ORDER[now.getDay() === 0 ? 6 : now.getDay() - 1];
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${h}:${m}`;
  return {
    day,
    timeStr,
    minutes: now.getHours() * 60 + now.getMinutes(),
    isSimulated: false
  };
}

// Calculate Period Status
function getPeriodStatus(day, minutes) {
  if (!TIMETABLE_DATA || !TIMETABLE_DATA.schedule) return null;
  const schedule = TIMETABLE_DATA.schedule[day] || [];

  if (day === 'Sunday') {
    return {
      state: 'weekend',
      current: null,
      next: null,
      message: 'Sunday - College Holiday (No Classes)'
    };
  }

  let currentSlot = null;
  let nextSlot = null;

  for (const slot of schedule) {
    const startMins = parseTime(slot.start);
    const endMins = parseTime(slot.end);

    if (startMins <= minutes && minutes < endMins) {
      currentSlot = slot;
    } else if (minutes < startMins) {
      if (!nextSlot) nextSlot = slot;
    }
  }

  return {
    current: currentSlot,
    next: nextSlot
  };
}

// Update Live Clock and Widgets
function updateLiveClockAndStatus() {
  const { day, timeStr, minutes, isSimulated } = getCurrentDateTime();
  const clockEl = document.getElementById('clockDisplay');
  const modeTextEl = document.getElementById('liveModeText');
  const currentNameEl = document.getElementById('currentClassName');
  const currentMetaEl = document.getElementById('currentClassMeta');
  const nextNameEl = document.getElementById('nextClassName');
  const nextMetaEl = document.getElementById('nextClassMeta');

  if (clockEl) {
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    clockEl.textContent = `${day}, ${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  if (modeTextEl) {
    modeTextEl.textContent = isSimulated ? 'SIMULATOR ACTIVE' : 'LIVE REAL-TIME';
    modeTextEl.style.color = isSimulated ? '#d97706' : '#059669';
  }

  const status = getPeriodStatus(day, minutes);
  if (!status) return;

  if (status.current) {
    const c = status.current;
    currentNameEl.textContent = c.subject;
    currentMetaEl.textContent = `${c.time} • Room: ${c.room} • ${c.faculty}`;
  } else {
    if (day === 'Sunday') {
      currentNameEl.textContent = 'Sunday - Holiday';
      currentMetaEl.textContent = 'No classes scheduled today';
    } else if (minutes < parseTime('08:30')) {
      currentNameEl.textContent = 'College starts at 8:30 AM';
      currentMetaEl.textContent = 'Morning session opens soon';
    } else if (minutes >= parseTime('18:00')) {
      currentNameEl.textContent = 'Classes done for the day';
      currentMetaEl.textContent = 'See you tomorrow at 8:30 AM';
    } else {
      currentNameEl.textContent = 'Free Period / Recess';
      currentMetaEl.textContent = 'No lecture in session right now';
    }
  }

  if (status.next) {
    const n = status.next;
    nextNameEl.textContent = `${n.subject}`;
    nextMetaEl.textContent = `${n.time} in ${n.room} (${n.faculty})`;
  } else {
    nextNameEl.textContent = 'None remaining today';
    nextMetaEl.textContent = day === 'Saturday' ? 'Half day ends at 1:00 PM' : 'Classes resume next college morning';
  }

  // Update Timetable table live highlighting if table tab is active
  highlightActiveSlotInGrid(day, status.current);
}

// Highlight Active Period in Timetable Table
function highlightActiveSlotInGrid(currentDay, currentSlot) {
  document.querySelectorAll('.slot-cell').forEach(cell => cell.classList.remove('slot-active-live'));
  if (!currentSlot || !currentSlot.code) return;

  const dayRow = document.querySelector(`tr[data-day="${currentDay}"]`);
  if (!dayRow) return;

  const matchingCells = dayRow.querySelectorAll(`.slot-cell[data-code="${currentSlot.code}"]`);
  matchingCells.forEach(c => c.classList.add('slot-active-live'));
}

// Render Initial Welcome Message in Chat
function renderInitialBotGreeting() {
  const greeting = `### 🎓 Welcome to MCE CSE Class & Timetable Assistant!
Hello! I am your official class companion for **III Semester Computer Science & Engineering (Section C)** at **Malnad College of Engineering, Hassan**.

I can instantly tell you:
- 📍 **"Where is my class right now?"** (dynamic room & faculty)
- ⏭️ **"What is my next class?"**
- 📅 **Daily schedules** (e.g. *"Monday timetable"*, *"Thursday schedule"*)
- 👨‍🏫 **Faculty info** (e.g. *"Who teaches Data Structures?"*, *"Mrs. Shruthi K R"*)
- 🧪 **Lab venues & rooms** (e.g. *"Where is Unix Lab?"*, *"Honeywell Lab"*)
- 📊 **Batch breakdown** for Friday Excel & Python
- ☕ **Break timings** (Morning tea & Lunch breaks)

Click any suggestion pill below or ask away!`;

  appendBotMessage(greeting, false);
}

// Handle User Sending a Message
async function handleUserSendMessage() {
  const inputEl = document.getElementById('userInput');
  const rawQuery = inputEl.value.trim();
  if (!rawQuery) return;

  inputEl.value = '';
  appendUserMessage(rawQuery);

  // Auto-correct spelling, slang & acronyms
  const { correctedQuery, wasCorrected, corrections } = autocorrectQuery(rawQuery);

  // Show typing indicator
  const typingId = showTypingIndicator();

  try {
    let reply = '';
    if (state.useGemini && state.geminiApiKey) {
      reply = await queryGeminiAPI(correctedQuery);
    } else {
      reply = processQueryLocally(correctedQuery);
    }

    if (wasCorrected && corrections.length > 0 && correctedQuery.toLowerCase() !== rawQuery.toLowerCase()) {
      reply = `💡 *Understood as: "${correctedQuery}"*\n\n` + reply;
    }

    removeTypingIndicator(typingId);
    appendBotMessage(reply);

    if (state.ttsEnabled) {
      speakText(cleanForSpeech(reply));
    }
  } catch (err) {
    removeTypingIndicator(typingId);
    let fallbackReply = processQueryLocally(correctedQuery);
    if (wasCorrected && corrections.length > 0 && correctedQuery.toLowerCase() !== rawQuery.toLowerCase()) {
      fallbackReply = `💡 *Understood as: "${correctedQuery}"*\n\n` + fallbackReply;
    }
    appendBotMessage(fallbackReply);
  }
}

// Built-in Local Query Processor
function processQueryLocally(rawQuery) {
  if (!TIMETABLE_DATA) {
    return 'Timetable data is loading. Please wait a moment...';
  }

  const q = rawQuery.trim().toLowerCase();
  const { day, timeStr } = getCurrentDateTime();

  // Greetings
  if (/^(hi|hello|hey|hola|namaste|good morning|good afternoon|good evening)\b/.test(q)) {
    return `Hello! 👋 How can I help you today? Ask me about your **current class**, **next lecture**, **room locations**, **faculty**, or **batch timings**!`;
  }

  // Theme Switching Command
  if (/(dark|light)\s*(mode|theme)|toggle\s*theme|switch\s*theme|change\s*theme/.test(q)) {
    if (q.includes('dark')) {
      applyTheme('dark');
      return '🌙 Switched to **Dark Mode**! You can also toggle anytime using the button in the top-right header.';
    } else if (q.includes('light')) {
      applyTheme('light');
      return '☀️ Switched to **Light Mode**! You can also toggle anytime using the button in the top-right header.';
    } else {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return `🌓 Switched to **${next === 'dark' ? 'Dark' : 'Light'} Mode**!`;
    }
  }

  // Right now / Where is my class
  if (/right now|current class|where is my class|where should i go|what class now|class now|where am i/.test(q)) {
    const { minutes } = getCurrentDateTime();
    const status = getPeriodStatus(day, minutes);
    let out = `🕒 **Current Time:** ${timeStr} on **${day}**\n\n`;

    if (status.current) {
      const c = status.current;
      if (c.type === 'Break') {
        out += `☕ **Break Time:** You are currently on **${c.subject}** (${c.time}).`;
      } else if (c.type === 'Free') {
        out += `🕊️ **Free Period:** You have free time right now (${c.time}).`;
      } else {
        out += `📍 **Current Class:** **${c.subject}**\n` +
               `🏢 **Room / Venue:** **${c.room}**\n` +
               `⏰ **Time Slot:** ${c.time}\n` +
               `👨‍🏫 **Faculty:** ${c.faculty}`;
      }
    } else {
      if (day === 'Sunday') {
        out += `🎉 **Sunday!** No classes today, enjoy your holiday!`;
      } else if (minutes < parseTime('08:30')) {
        out += `🌅 College classes start at **8:30 AM**.`;
      } else if (minutes >= parseTime('18:00')) {
        out += `🌙 Classes for ${day} have concluded. See you tomorrow!`;
      } else {
        out += `✨ No scheduled lecture right now.`;
      }
    }

    if (status.next) {
      const n = status.next;
      out += `\n\n⏭️ **Next Class:** **${n.subject}** at **${n.time}** in Room **${n.room}** (Faculty: ${n.faculty})`;
    } else {
      out += `\n\nNo further classes scheduled for today.`;
    }
    return out;
  }

  // Next class
  if (/next class|what is next|what's next|after this|upcoming class/.test(q)) {
    const { minutes } = getCurrentDateTime();
    const status = getPeriodStatus(day, minutes);
    let out = `🕒 **Time:** ${timeStr} on **${day}**\n\n`;
    if (status.next) {
      const n = status.next;
      out += `⏭️ **Upcoming Class:** **${n.subject}** at **${n.time}** in Room **${n.room}** (Faculty: ${n.faculty})`;
    } else {
      out += `No more classes scheduled for today!`;
    }
    return out;
  }

  // Break timings
  if (/break|lunch|interval|tea break|recess/.test(q)) {
    return `⏰ **Daily Break Timings (MCE Hassan):**\n\n` +
           `1. ☕ **Morning Tea Break:** \`10:30 AM - 11:00 AM\` (30 mins)\n` +
           `2. 🍽️ **Lunch Break:** \`1:00 PM - 2:00 PM\` (1 hour)\n\n` +
           `Classes run from **8:30 AM to 6:00 PM** (Monday–Friday) and **8:30 AM to 1:00 PM** (Saturday).`;
  }

  // Check specific day request
  let targetDay = null;
  if (q.includes('today')) {
    targetDay = day;
  } else if (q.includes('tomorrow')) {
    const idx = DAYS_ORDER.indexOf(day);
    targetDay = DAYS_ORDER[(idx + 1) % 7];
  } else {
    for (const [key, val] of Object.entries(DAYS_ALIASES)) {
      const regex = new RegExp(`\\b${key}\\b`, 'i');
      if (regex.test(q)) {
        targetDay = val;
        break;
      }
    }
  }

  if (targetDay) {
    // 1. Day + Free periods specifically
    if (/free|off|leisure|vacant|empty|no class|gap/.test(q)) {
      return getDayFreePeriodsLocal(targetDay);
    }

    // 2. Day + Labs / practicals specifically
    if (/lab|labs|practical|practicals/.test(q)) {
      return getDayLabsLocal(targetDay);
    }

    // 3. Day + Start time
    if (/start|starts|begin|begins|first class/.test(q)) {
      return getDayStartOrEndLocal(targetDay, true);
    }

    // 4. Day + End / Finish time
    if (/end|ends|finish|finishes|over|last class/.test(q)) {
      return getDayStartOrEndLocal(targetDay, false);
    }

    // 5. Day + Specific Subject (e.g. "DSA on Wednesday", "Maths on Monday")
    const daySchedule = TIMETABLE_DATA.schedule[targetDay] || [];
    const matchedSlots = [];
    const cleanQ = q.replace(/[^\w\s\-/]/g, ' ');
    const words = cleanQ.split(/\s+/).filter(w => !STOP_WORDS.has(w) && !DAYS_ALIASES[w] && w.length > 1);

    if (words.length > 0) {
      daySchedule.forEach(slot => {
        const scode = (slot.code || '').toLowerCase();
        const ssubj = (slot.subject || '').toLowerCase();
        for (const kw of words) {
          const regex = new RegExp(`\\b${kw}\\b`, 'i');
          if (regex.test(scode) || regex.test(ssubj)) {
            matchedSlots.push(slot);
            break;
          } else if (SUBJECT_ALIASES[kw]) {
            if (SUBJECT_ALIASES[kw].some(a => new RegExp(`\\b${a}\\b`, 'i').test(scode) || new RegExp(`\\b${a}\\b`, 'i').test(ssubj))) {
              matchedSlots.push(slot);
              break;
            }
          }
        }
      });
    }

    if (matchedSlots.length > 0 && !/schedule|timetable|all classes|full/.test(q)) {
      let out = `📅 **${targetDay} Class Timing:**\n\n`;
      matchedSlots.forEach(slot => {
        out += `• **${slot.subject}**\n` +
               `  - ⏰ **Time:** ${slot.time}\n` +
               `  - 📍 **Room / Venue:** **${slot.room}**\n` +
               `  - 👨‍🏫 **Faculty:** ${slot.faculty || '-'}\n` +
               `  - 🏷️ **Type:** ${slot.type || 'Theory'}\n\n`;
      });
      return out;
    }

    // 6. Entire Day Schedule
    if (!/faculty|teacher|prof|hod|who teaches/.test(q)) {
      return formatDayScheduleLocal(targetDay);
    }
  }

  // General free periods (across the week)
  if (/free period|free periods|free time|off period|off periods|when are we free/.test(q)) {
    return `✨ **Free / Off Periods Overview (Across the Week):**\n\n` +
           `• **Monday:** 12:00 PM – 1:00 PM (Study Hour) & 4:00 PM – 6:00 PM (After Unix Lab)\n` +
           `• **Tuesday:** 4:00 PM – 6:00 PM (Regular students; M3-DIP in CS305 for lateral entry)\n` +
           `• **Wednesday:** 8:30 AM – 9:30 AM, 12:00 PM – 1:00 PM, and **Entire Afternoon (2:00 PM – 6:00 PM) OFF!**\n` +
           `• **Thursday:** **Entire Afternoon (2:00 PM – 6:00 PM) OFF!**\n` +
           `• **Friday:** 2:00 PM – 5:00 PM (Free afternoon; DIP Maths 5:00 – 6:00 PM in SA101)\n` +
           `• **Saturday:** **1:00 PM onwards (Weekend Half-Day OFF!)**\n` +
           `• **Sunday:** Full Holiday (No classes)`;
  }

  // Specific subject or faculty weekly schedule (e.g. "When is DSA?", "When does Dr. Roopa take class?")
  if (/when|timing|timings|schedule|routine|classes/.test(q)) {
    const facWeekly = getFacultyWeeklyScheduleLocal(q);
    if (facWeekly) return facWeekly;

    const subjWeekly = getSubjectWeeklyScheduleLocal(q);
    if (subjWeekly) return subjWeekly;
  }

  // Batches for Excel & Python
  if (/batch|batches|excel|python|25cs307|data analytics|data visualization/.test(q)) {
    return formatBatchesLocal();
  }

  // Rooms and Venues
  if (/room|venue|lab|where is|location/.test(q)) {
    for (const v of TIMETABLE_DATA.venues) {
      if (q.includes(v.name.toLowerCase())) {
        return `📍 **${v.name}** (*${v.type}*):\n${v.description}`;
      }
    }
    if (q.includes('unix')) {
      return `🧪 **Unix and Shell Programming Laboratory (UNIX Lab)** is conducted in **CSLAB-4** on **Monday from 2:00 PM to 4:00 PM**.\nFaculty: Mrs. Nithyashree R, Mrs. M B Prakruthi, and Mr. Krishna Swaroop.`;
    }
    if (q.includes('dsa')) {
      return `🧪 **Data Structures Laboratory (DSA Lab)** is held in **Honeywell Lab** on **Tuesday from 2:00 PM to 4:00 PM**.\nFaculty: Ms. Bimba Prasad, Dr. Chandrika J, and Mrs. Sindhu K S.`;
    }
    if (q.includes('java') || q.includes('oopj')) {
      return `🧪 **OOPs with Java Practical (OOPJ-P)** is held in **CSLAB-2** on **Thursday from 8:30 AM to 10:30 AM**.\nFaculty: Mrs. Shruthi K R & Team.`;
    }
    if (q.includes('ddco') || q.includes('hardware')) {
      return `🧪 **Digital Design Practical (DDCO-P)** is held in **H/W Lab (Hardware Lab)** on **Saturday from 8:30 AM to 10:30 AM**.\nFaculty: Mrs. Ayeesha Siddiqa & Team.`;
    }
    if (q.includes('ee301')) {
      return `🏢 **Room EE301** is the designated theory classroom for **III Sem CSE Section C**, on the 3rd floor of the Electrical & Electronics Block.`;
    }
    if (/all rooms|all labs|venues|list rooms/.test(q)) {
      return formatVenuesLocal();
    }
  }

  // Faculty Queries
  if (/faculty|teacher|sir|madam|prof|hod|who teaches|who is|coordinator/.test(q)) {
    if (q.includes('hod') || q.includes('head')) {
      const hod = TIMETABLE_DATA.college.hod;
      return `🏛️ **Head of Department (CSE):** **${hod.name}** (${hod.title})`;
    }
    if (q.includes('coordinator')) {
      const coords = TIMETABLE_DATA.college.timetable_coordinators;
      return `📋 **Timetable Coordinators:**\n` + coords.map(c => `- **${c.name}** (${c.role})`).join('\n');
    }
    if (/all faculty|faculty list|teachers list|faculties/.test(q)) {
      return formatFacultyListLocal();
    }

    const facResult = searchFacultyLocal(q);
    if (facResult) return facResult;
  }

  // Subject Search
  const subjResult = searchSubjectLocal(q);
  if (subjResult) return subjResult;

  // Faculty Search fallback
  const facResult = searchFacultyLocal(q);
  if (facResult) return facResult;

  // General fallback
  return `I'm not completely certain about "${rawQuery}", but here are popular questions you can ask:\n\n` +
         `• 🕊️ *"Monday free periods"* or *"Wednesday free time"*\n` +
         `• 📍 *"Where is my class right now?"* or *"Next class"*\n` +
         `• 📅 *"Monday schedule"* or *"Friday timetable"*\n` +
         `• 👨‍🏫 *"Who teaches Data Structures?"* or *"When does Dr. Roopa take class?"*\n` +
         `• 🧪 *"Where is Unix Lab?"* or *"Thursday labs"*\n` +
         `• 📊 *"Show batch details"* for Friday Python/Excel\n` +
         `• ☕ *"When is lunch break?"*`;
}

// Granular Day Free Periods Helper
function getDayFreePeriodsLocal(day) {
  const normDay = DAYS_ALIASES[day.toLowerCase()] || day;
  const schedule = TIMETABLE_DATA.schedule[normDay] || [];

  if (normDay === 'Sunday') {
    return '🎉 **Sunday**: The entire day is a college holiday! You have no classes all day.';
  }

  const freeSlots = schedule.filter(item => item.type === 'Free');

  let out = `🕊️ **Free Periods on ${normDay} (III Sem CSE - Sec C):**\n\n`;
  if (freeSlots.length > 0) {
    freeSlots.forEach((slot, idx) => {
      out += `${idx + 1}. ⏰ **${slot.time}**: ${slot.subject}\n`;
    });
  } else {
    out += 'There are no designated free study periods during lecture hours on this day.\n';
  }

  out += '\n*☕ Morning Break is 10:30 AM – 11:00 AM, and 🍽️ Lunch Break is 1:00 PM – 2:00 PM.*';
  return out;
}

// Granular Day Labs Helper
function getDayLabsLocal(day) {
  const normDay = DAYS_ALIASES[day.toLowerCase()] || day;
  const schedule = TIMETABLE_DATA.schedule[normDay] || [];

  if (normDay === 'Sunday') {
    return 'Sunday is a holiday. No labs or practicals scheduled.';
  }

  const labs = schedule.filter(item => (item.type || '').includes('Lab') || (item.type || '').includes('Practical'));

  if (labs.length === 0) {
    return `🧪 **Labs on ${normDay}:**\nThere are **no lab or practical sessions** on ${normDay}! You only have theory classes and designated free study hours.`;
  }

  let out = `🧪 **Lab / Practical Sessions on ${normDay} (Sec C):**\n\n`;
  labs.forEach(lab => {
    const codeStr = lab.code ? `[${lab.code}] ` : '';
    out += `• **${codeStr}${lab.subject}**\n` +
           `  - ⏰ **Timing:** ${lab.time}\n` +
           `  - 📍 **Venue:** **${lab.room}**\n` +
           `  - 👨‍🏫 **Faculty:** ${lab.faculty || '-'}\n\n`;
  });
  return out;
}

// Granular Day Start / End Helper
function getDayStartOrEndLocal(day, isStart) {
  const normDay = DAYS_ALIASES[day.toLowerCase()] || day;
  const schedule = TIMETABLE_DATA.schedule[normDay] || [];

  if (normDay === 'Sunday') {
    return 'Sunday is a holiday. College is closed.';
  }

  const actualClasses = schedule.filter(item => item.type !== 'Break' && item.type !== 'Free');
  if (actualClasses.length === 0) {
    return `No scheduled classes on ${normDay}.`;
  }

  if (isStart) {
    const first = actualClasses[0];
    const preFree = schedule.some(item => item.start === '08:30' && item.type === 'Free');
    if (preFree) {
      return `🌅 **Class Start Time on ${normDay}:**\n` +
             `Your first class starts at **${first.start} AM** with **${first.subject}** in Room **${first.room}**.\n` +
             `*(Note: 8:30 AM – 9:30 AM is a free period!)*`;
    }
    return `🌅 **Class Start Time on ${normDay}:**\n` +
           `College starts at **${first.start} AM** with **${first.subject}** in Room **${first.room}** (Faculty: ${first.faculty || '-'}).`;
  } else {
    const last = actualClasses[actualClasses.length - 1];
    if (normDay === 'Wednesday' || normDay === 'Thursday') {
      return `🌙 **Class Finish Time on ${normDay}:**\n` +
             `Your classes finish at **${last.end}** after **${last.subject}** (Room ${last.room})!\n` +
             `🎉 **The entire afternoon (2:00 PM – 6:00 PM) is OFF!**`;
    } else if (normDay === 'Saturday') {
      return `🌙 **Class Finish Time on Saturday:**\n` +
             `Classes finish at **1:00 PM** after **Mathematics (M3)**.\n` +
             `🎉 **Saturday afternoon is a half-day off for the weekend!**`;
    } else {
      return `🌙 **Class Finish Time on ${normDay}:**\n` +
             `Classes conclude at **${last.end}** with **${last.subject}**.`;
    }
  }
}

// Subject Weekly Schedule Helper
function getSubjectWeeklyScheduleLocal(subjectQuery) {
  const cleanQ = subjectQuery.toLowerCase().replace(/[^\w\s\-/]/g, ' ');
  const words = cleanQ.split(/\s+/).filter(w => !STOP_WORDS.has(w) && w.length > 1);

  const expanded = new Set(words);
  words.forEach(w => {
    if (SUBJECT_ALIASES[w]) {
      SUBJECT_ALIASES[w].forEach(a => {
        expanded.add(a);
        a.split(/\s+/).forEach(t => { if (!GENERIC_WORDS.has(t)) expanded.add(t); });
      });
    }
  });

  let matchedCourse = null;
  for (const c of TIMETABLE_DATA.courses) {
    const codeLower = c.code.toLowerCase();
    const shortLower = c.short_name.toLowerCase();
    const titleLower = c.title.toLowerCase();

    for (const term of expanded) {
      if (term === shortLower || codeLower.includes(term) || (term.length > 3 && titleLower.includes(term))) {
        matchedCourse = c;
        break;
      }
    }
    if (matchedCourse) break;
  }

  if (!matchedCourse) return null;

  const occurrences = [];
  const cCode = matchedCourse.code.toLowerCase();
  const cShort = matchedCourse.short_name.toLowerCase();

  for (const day of DAYS_ORDER.slice(0, 6)) {
    const slots = TIMETABLE_DATA.schedule[day] || [];
    slots.forEach(slot => {
      const scode = (slot.code || '').toLowerCase();
      const ssubj = (slot.subject || '').toLowerCase();
      if (scode.includes(cCode) || ssubj.includes(cShort) || scode === cCode) {
        occurrences.push({ day, slot });
      }
    });
  }

  if (occurrences.length === 0) return null;

  let out = `📅 **Weekly Schedule for ${matchedCourse.title} (${matchedCourse.short_name} / \`${matchedCourse.code}\`):**\n\n` +
            `👨‍🏫 **Faculty:** ${matchedCourse.faculty}\n\n`;

  occurrences.forEach(item => {
    out += `• **${item.day}**: ⏰ **${item.slot.time}** | 📍 Room: **${item.slot.room}** | (${item.slot.type || 'Theory'})\n`;
  });

  return out;
}

// Faculty Weekly Schedule Helper
function getFacultyWeeklyScheduleLocal(facultyQuery) {
  const cleanQ = facultyQuery.toLowerCase().replace(/[^\w\s\-/]/g, ' ');

  let matchedFac = null;
  for (const fac of TIMETABLE_DATA.faculty_directory) {
    const nameLower = fac.name.toLowerCase();
    const parts = nameLower.split(/\s+/).filter(p => p.length > 3);
    if (parts.some(p => cleanQ.includes(p))) {
      matchedFac = fac;
      break;
    }
  }

  if (!matchedFac) return null;

  const facParts = matchedFac.name.toLowerCase().split(/\s+/).filter(p => p.length > 3);
  const sessions = [];

  for (const day of DAYS_ORDER.slice(0, 6)) {
    const slots = TIMETABLE_DATA.schedule[day] || [];
    slots.forEach(slot => {
      const fInSlot = (slot.faculty || '').toLowerCase();
      if (facParts.some(p => fInSlot.includes(p))) {
        sessions.push({ day, slot });
      }
    });
  }

  let out = `👨‍🏫 **Lecture & Lab Schedule for ${matchedFac.name}:**\n` +
            `**Designation:** ${matchedFac.designation || 'Faculty'} | **Dept:** ${matchedFac.department || 'CSE'}\n` +
            `**Subject:** ${matchedFac.subject}\n\n`;

  if (sessions.length > 0) {
    out += `**Weekly Classes:**\n`;
    sessions.forEach(item => {
      out += `• **${item.day}**: ⏰ **${item.slot.time}** — **${item.slot.subject}** (Room: **${item.slot.room}**)\n`;
    });
  } else {
    out += `Handles: **${matchedFac.subject}** (Lab/Batch or administrative coordination).\n`;
  }

  return out;
}

// Schedule Formatter
function formatDayScheduleLocal(day) {
  const schedule = TIMETABLE_DATA.schedule[day];
  if (!schedule) return `No timetable entry found for ${day}.`;
  if (day === 'Sunday') return `🎉 **Sunday**: No classes scheduled! It's a holiday.`;

  let out = `📅 **Schedule for ${day} (III Sem CSE - Sec C | Room: EE301):**\n\n`;
  schedule.forEach(item => {
    if (item.type === 'Break') {
      out += `- **${item.time}** ☕ *${item.subject}*\n`;
    } else if (item.type === 'Free') {
      out += `- **${item.time}** 🕊️ *${item.subject}*\n`;
    } else if (item.type.includes('Lab') || item.type.includes('Practical')) {
      out += `- **${item.time}** 🧪 **${item.subject}** | 📍 Venue: **${item.room}** | 👨‍🏫 Faculty: ${item.faculty}\n`;
    } else {
      const code = item.code ? `[${item.code}] ` : '';
      out += `- **${item.time}** 📚 **${code}${item.subject}** | 📍 Room: **${item.room}** | 👨‍🏫 Faculty: ${item.faculty}\n`;
    }
  });
  return out;
}

// Batches Formatter
function formatBatchesLocal() {
  const b = TIMETABLE_DATA.batches_25CS307BC;
  let out = `📊 **Batch Details for Friday (11:00 AM - 1:00 PM)**\n` +
            `**Course: 25CS307B/C - Data Analytics with Excel / Data Visualization with Python**\n\n` +
            `📗 **Data Analytics with Excel:**\n`;

  b.excel.batches.forEach(item => {
    out += `- **Batch ${item.batch}**: 📍 Venue: **${item.venue}** | 👨‍🏫 Faculty: \`${item.faculty}\`\n`;
  });

  out += `\n📘 **Data Visualization with Python:**\n`;
  b.python.batches.forEach(item => {
    out += `- **Batch ${item.batch}**: 📍 Venue: **${item.venue}** | 👨‍🏫 Faculty: \`${item.faculty}\`\n`;
  });

  return out;
}

// Faculty List Formatter
function formatFacultyListLocal() {
  let out = `👨‍🏫 **Complete Faculty & Staff Directory (III Sem CSE - Sec C):**\n\n`;
  TIMETABLE_DATA.faculty_directory.forEach(f => {
    out += `- **${f.name}** — ${f.subject} (${f.designation || 'Faculty'})\n`;
  });
  out += `\n🏛️ **Head of Department:** ${TIMETABLE_DATA.college.hod.name}\n` +
         `📋 **Timetable Coordinators:** ${TIMETABLE_DATA.college.timetable_coordinators.map(c => c.name).join(', ')}`;
  return out;
}

// Venues Formatter
function formatVenuesLocal() {
  let out = `🏛️ **Classrooms & Laboratories Directory:**\n\n`;
  TIMETABLE_DATA.venues.forEach(v => {
    out += `- **${v.name}** (*${v.type}*): ${v.description}\n`;
  });
  return out;
}

// Scored Faculty Search
function searchFacultyLocal(query) {
  const cleanQ = query.toLowerCase().replace(/[^\w\s\-/]/g, ' ');
  const words = cleanQ.split(/\s+/).filter(w => !STOP_WORDS.has(w) && w.length > 1);

  const expanded = new Set(words);
  words.forEach(w => {
    if (SUBJECT_ALIASES[w]) {
      SUBJECT_ALIASES[w].forEach(a => {
        expanded.add(a);
        a.split(/\s+/).forEach(token => {
          if (!GENERIC_WORDS.has(token)) expanded.add(token);
        });
      });
    }
  });

  const scored = [];
  TIMETABLE_DATA.faculty_directory.forEach(fac => {
    const nameLower = fac.name.toLowerCase();
    const subjLower = fac.subject.toLowerCase();
    const codeLower = (fac.course_code || '').toLowerCase();

    let score = 0;
    if (cleanQ.includes(nameLower) || nameLower.includes(cleanQ)) score += 100;
    if (cleanQ.includes(subjLower)) score += 90;

    expanded.forEach(term => {
      if (GENERIC_WORDS.has(term)) return;
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(nameLower)) score += 50;
      else if (nameLower.includes(term) && term.length > 3) score += 25;

      if (codeLower.includes(term)) score += 45;

      if (regex.test(subjLower)) score += 40;
      else if (subjLower.includes(term) && term.length > 3) score += 15;
    });

    if (score > 20) scored.push({ score, fac });
  });

  if (scored.length === 0) return null;
  scored.sort((a, b) => b.score - a.score);
  const topScore = scored[0].score;
  const filtered = scored.filter(s => s.score >= Math.max(35, topScore * 0.6)).map(s => s.fac);

  const seen = new Set();
  const dedup = [];
  filtered.forEach(f => {
    if (!seen.has(f.name)) {
      seen.add(f.name);
      dedup.push(f);
    }
  });

  let out = `👨‍🏫 **Faculty Details Found:**\n\n`;
  dedup.forEach(f => {
    out += `• **${f.name}** (${f.designation || 'Faculty'}, ${f.department || 'CSE'})\n` +
           `  - Subject: **${f.subject}**\n`;
    if (f.course_code) out += `  - Course Code: \`${f.course_code}\`\n`;
    if (f.assistants) out += `  - Assisting Faculty: ${f.assistants}\n`;
    out += `\n`;
  });
  return out;
}

// Scored Subject Search
function searchSubjectLocal(query) {
  const cleanQ = query.toLowerCase().replace(/[^\w\s\-/]/g, ' ');
  const words = cleanQ.split(/\s+/).filter(w => !STOP_WORDS.has(w) && w.length > 1);

  const expanded = new Set(words);
  words.forEach(w => {
    if (SUBJECT_ALIASES[w]) {
      SUBJECT_ALIASES[w].forEach(a => {
        expanded.add(a);
        a.split(/\s+/).forEach(token => {
          if (!GENERIC_WORDS.has(token)) expanded.add(token);
        });
      });
    }
  });

  const scored = [];
  TIMETABLE_DATA.courses.forEach(c => {
    const codeLower = c.code.toLowerCase();
    const shortLower = c.short_name.toLowerCase();
    const titleLower = c.title.toLowerCase();

    let score = 0;
    if (cleanQ.includes(titleLower) || titleLower.includes(cleanQ)) score += 100;
    if (cleanQ.includes(shortLower) || shortLower === cleanQ) score += 90;
    if (cleanQ.includes(codeLower)) score += 90;

    expanded.forEach(term => {
      if (GENERIC_WORDS.has(term)) return;
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (term === shortLower || regex.test(shortLower)) score += 50;
      if (codeLower.includes(term)) score += 45;
      if (regex.test(titleLower)) score += 35;
    });

    if (score > 25) scored.push({ score, c });
  });

  if (scored.length === 0) return null;
  scored.sort((a, b) => b.score - a.score);
  const topScore = scored[0].score;
  const filtered = scored.filter(s => s.score >= Math.max(35, topScore * 0.6)).map(s => s.c);

  const seen = new Set();
  const dedup = [];
  filtered.forEach(c => {
    if (!seen.has(c.code)) {
      seen.add(c.code);
      dedup.push(c);
    }
  });

  let out = `📚 **Course Details:**\n\n`;
  dedup.forEach(c => {
    out += `### ${c.title} (\`${c.code}\` / **${c.short_name}**)\n` +
           `- **Type:** ${c.type}\n` +
           `- **Faculty:** ${c.faculty}\n` +
           `- **Default Room / Venue:** **${c.room}**\n`;
    if (c.timing_hint) out += `- **Scheduled Timing:** ${c.timing_hint}\n`;
    if (c.description) out += `- **Overview:** ${c.description}\n`;
    out += `\n`;
  });
  return out;
}

// Optional Gemini API Call
async function queryGeminiAPI(prompt) {
  const apiKey = state.geminiApiKey;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const { day, timeStr } = getCurrentDateTime();

  const systemContext = `
You are the official AI Class Assistant for Malnad College of Engineering, Hassan (MCE).
Specifically assisting students of III Semester Computer Science & Engineering (Section C).
Current reference date & time: ${day}, ${timeStr}.
Default classroom: Room EE301.

Full Official Timetable JSON grounding:
${JSON.stringify(TIMETABLE_DATA)}

Rules:
1. Always give precise, helpful answers about class rooms, timings, faculties, break hours, and batches based strictly on this timetable.
2. If asked about current or next class, compute it accurately based on ${day} at ${timeStr}.
3. Format with clean markdown, bold subject names, and emojis.
`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: systemContext + '\n\nStudent Question: ' + prompt }
        ]
      }
    ]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Gemini API call failed with status ' + response.status);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || 'No response generated from Gemini.';
}

// Markdown Formatter for Chat Bubble
function formatMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/^### (.*$)/gim, '<h4 style="margin: 0.4rem 0; font-size: 1rem; color: #1e3a8a;">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 style="margin: 0.5rem 0; font-size: 1.1rem; color: #1e3a8a;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');

  return html;
}

// Append User Message to Chat
function appendUserMessage(text) {
  const container = document.getElementById('chatMessages');
  const msgEl = document.createElement('div');
  msgEl.className = 'message message-user';

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  msgEl.innerHTML = `
    <div class="msg-avatar">👤</div>
    <div class="msg-bubble">
      <div>${escapeHTML(text)}</div>
      <div class="msg-actions">
        <button class="mini-action-btn speak-question-btn" title="Read question out loud">🗣️ Read Question</button>
      </div>
      <div class="msg-time">${time}</div>
    </div>
  `;

  // Attach speak listener to user question
  msgEl.querySelector('.speak-question-btn').addEventListener('click', () => {
    speakText(text);
  });

  container.appendChild(msgEl);
  container.scrollTop = container.scrollHeight;
  state.chatHistory.push({ role: 'user', text, time });
}

// Append Bot Message to Chat
function appendBotMessage(text, saveHistory = true) {
  const container = document.getElementById('chatMessages');
  const msgEl = document.createElement('div');
  msgEl.className = 'message message-bot';

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedHtml = formatMarkdown(text);

  msgEl.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-bubble">
      <div>${formattedHtml}</div>
      <div class="msg-actions">
        <button class="mini-action-btn speak-msg-btn" title="Read out loud">🔊 Speak</button>
        <button class="mini-action-btn copy-msg-btn" title="Copy text">📋 Copy</button>
      </div>
      <div class="msg-time">${time}</div>
    </div>
  `;

  // Attach event handlers to message action buttons
  msgEl.querySelector('.speak-msg-btn').addEventListener('click', () => {
    speakText(cleanForSpeech(text));
  });

  msgEl.querySelector('.copy-msg-btn').addEventListener('click', (e) => {
    navigator.clipboard.writeText(text);
    e.target.textContent = '✅ Copied!';
    setTimeout(() => { e.target.textContent = '📋 Copy'; }, 2000);
  });

  container.appendChild(msgEl);
  container.scrollTop = container.scrollHeight;

  if (saveHistory) {
    state.chatHistory.push({ role: 'bot', text, time });
  }
}

// Typing Indicator
function showTypingIndicator() {
  const id = 'typing-' + Date.now();
  const container = document.getElementById('chatMessages');
  const typingEl = document.createElement('div');
  typingEl.id = id;
  typingEl.className = 'message message-bot';
  typingEl.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-bubble" style="font-style: italic; color: #64748b;">
      Thinking & searching timetable...
    </div>
  `;
  container.appendChild(typingEl);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Speech Synthesis
function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

function cleanForSpeech(mdText) {
  return mdText
    .replace(/[#*`~_]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim();
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Export Chat History
function exportChatHistory() {
  if (state.chatHistory.length === 0) {
    alert('Chat is empty.');
    return;
  }
  let txt = `==========================================================\n` +
            `MALNAD COLLEGE OF ENGINEERING, HASSAN\n` +
            `III Sem CSE - Section C AI Chatbot Transcript\n` +
            `Exported: ${new Date().toLocaleString()}\n` +
            `==========================================================\n\n`;

  state.chatHistory.forEach(item => {
    txt += `[${item.time}] ${item.role.toUpperCase()}:\n${item.text}\n\n`;
  });

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `MCE_CSE_Chat_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
}

// Render All Tab Views
function renderAllViews() {
  if (!TIMETABLE_DATA) return;
  renderTimetableGrid();
  renderFacultyCards();
  renderVenues();
  renderBatches();
}

// Render Interactive Timetable Grid
function renderTimetableGrid() {
  const gridEl = document.getElementById('timetableGrid');
  if (!gridEl) return;

  const headerRow = `
    <thead>
      <tr>
        <th class="day-header">DAYS</th>
        <th>8.30am-<br>9.30am</th>
        <th>9.30am-<br>10.30am</th>
        <th style="background:#f8fafc; font-size:0.75rem;">10.30am-<br>11.00am</th>
        <th>11.00am-<br>12.00pm</th>
        <th>12.00pm-<br>1.00pm</th>
        <th style="background:#f8fafc; font-size:0.75rem;">1.00pm-<br>2.00pm</th>
        <th>2.00pm-<br>3.00pm</th>
        <th>3.00pm-<br>4.00pm</th>
        <th>4.00pm-<br>5.00pm</th>
        <th>5.00pm-<br>6.00pm</th>
      </tr>
    </thead>
  `;

  // Grid rows matching the image
  const days = [
    {
      day: 'MON',
      name: 'Monday',
      slots: [
        { code: '25PT1', title: 'PT1', venue: 'EE301', faculty: 'Placement Cell', type: 'project' },
        { code: '25CS304', title: 'OOPJ', venue: 'EE301', faculty: 'Mrs. Shruthi K R', type: 'theory' },
        { isBreak: true, title: 'BREAK' },
        { code: '25MACS301', title: 'M3', venue: 'EE301', faculty: 'Dr. Roopa G S', type: 'theory' },
        { isFree: true, title: '' },
        { isBreak: true, title: 'BREAK' },
        { code: '25CS306', title: 'UNIX Lab', venue: 'CSLAB-4', faculty: 'Mrs. Nithyashree R & Team', colspan: 2, type: 'lab' },
        { isFree: true, title: '' },
        { isFree: true, title: '' }
      ]
    },
    {
      day: 'TUE',
      name: 'Tuesday',
      slots: [
        { code: '25MACS301', title: 'M3', venue: 'EE301', faculty: 'Dr. Roopa G S', type: 'theory' },
        { code: '25CS302', title: 'DDCO', venue: 'EE301', faculty: 'Mrs. Ayeesha Siddiqa', type: 'theory' },
        { isBreak: true, title: 'BREAK' },
        { code: '25CS304', title: 'OOPJ', venue: 'EE301', faculty: 'Mrs. Shruthi K R', type: 'theory' },
        { code: '24CS563', title: '24CS563 IoT', venue: 'EE301', faculty: 'Dept Faculty', type: 'theory' },
        { isBreak: true, title: 'BREAK' },
        { code: '25CS305', title: 'DSA Lab', venue: 'Honeywell Lab', faculty: 'Ms. Bimba Prasad & Team', colspan: 2, type: 'lab' },
        { code: '25BCM301', title: 'M3-DIP', venue: 'CS305', faculty: 'Dr. Shashi Kumar', type: 'theory' },
        { isFree: true, title: '' }
      ]
    },
    {
      day: 'WED',
      name: 'Wednesday',
      slots: [
        { isFree: true, title: '' },
        { code: '25CS303', title: 'DSA', venue: 'EE301', faculty: 'Ms. Bimba Prasad', type: 'theory' },
        { isBreak: true, title: 'BREAK' },
        { code: '25CS302', title: 'DDCO', venue: 'EE301', faculty: 'Mrs. Ayeesha Siddiqa', type: 'theory' },
        { isFree: true, title: '' },
        { isBreak: true, title: 'BREAK' },
        { isFree: true, title: '', colspan: 4 }
      ]
    },
    {
      day: 'THU',
      name: 'Thursday',
      slots: [
        { code: 'OOPJ-P', title: 'OOPJ-P', venue: 'CSLAB-2', faculty: 'Mrs. Shruthi K R', colspan: 2, type: 'lab' },
        { isBreak: true, title: 'BREAK' },
        { code: '25CS303', title: 'DSA', venue: 'EE301', faculty: 'Ms. Bimba Prasad', type: 'theory' },
        { code: '25CS302', title: 'DDCO', venue: 'EE301', faculty: 'Mrs. Ayeesha Siddiqa', type: 'theory' },
        { isBreak: true, title: 'BREAK' },
        { isFree: true, title: '', colspan: 4 }
      ]
    },
    {
      day: 'FRI',
      name: 'Friday',
      slots: [
        { code: '25SCR', title: 'SCR', venue: 'EE301', faculty: 'RNU + SKR', type: 'project' },
        { code: '25CS304', title: 'OOPJ', venue: 'EE301', faculty: 'Mrs. Shruthi K R', type: 'theory' },
        { isBreak: true, title: 'BREAK' },
        { code: '25CS307B/C', title: 'PYTHON / EXCEL', venue: 'Batch Labs', faculty: 'Batch Faculty', colspan: 2, type: 'lab' },
        { isBreak: true, title: 'BREAK' },
        { isFree: true, title: '', colspan: 3 },
        { code: '25BCM301', title: 'DIP Maths', venue: 'SA101', faculty: 'Dr. Shashi Kumar', type: 'theory' }
      ]
    },
    {
      day: 'SAT',
      name: 'Saturday',
      slots: [
        { code: 'DDCO-P', title: 'DDCO-P', venue: 'H/W Lab', faculty: 'Mrs. Ayeesha & Team', colspan: 2, type: 'lab' },
        { isBreak: true, title: 'BREAK' },
        { code: '25CS303', title: 'DSA', venue: 'EE301', faculty: 'Ms. Bimba Prasad', type: 'theory' },
        { code: '25MACS301', title: 'M3', venue: 'EE301', faculty: 'Dr. Roopa G S', type: 'theory' },
        { isBreak: true, title: 'BREAK' },
        { isFree: true, title: 'Half-Day Off', colspan: 4 }
      ]
    }
  ];

  let tbody = '<tbody>';
  days.forEach(row => {
    tbody += `<tr data-day="${row.name}">`;
    tbody += `<td class="day-header">${row.day}</td>`;

    row.slots.forEach(slot => {
      const colspan = slot.colspan ? `colspan="${slot.colspan}"` : '';
      if (slot.isBreak) {
        tbody += `<td class="slot-cell slot-break" ${colspan}>BREAK</td>`;
      } else if (slot.isFree) {
        tbody += `<td class="slot-cell slot-free" ${colspan}>${slot.title}</td>`;
      } else {
        const typeClass = slot.type === 'lab' ? 'slot-lab' : (slot.type === 'project' ? 'slot-project' : 'slot-theory');
        tbody += `
          <td class="slot-cell ${typeClass}" ${colspan} data-code="${slot.code}" title="Click to ask bot about ${slot.title}">
            <div class="cell-code">${slot.title}</div>
            <div class="cell-venue">${slot.venue}</div>
            <div class="cell-faculty">${slot.faculty}</div>
          </td>
        `;
      }
    });

    tbody += `</tr>`;
  });
  tbody += '</tbody>';

  gridEl.innerHTML = headerRow + tbody;

  // Add click listener to timetable cells to automatically switch to chat and ask about it
  gridEl.querySelectorAll('.slot-cell[data-code]').forEach(cell => {
    cell.addEventListener('click', () => {
      const code = cell.getAttribute('data-code');
      const query = `Tell me details about ${code}`;
      
      // Switch to chat tab
      document.querySelector('.nav-tab[data-tab="tab-chat"]').click();
      document.getElementById('userInput').value = query;
      handleUserSendMessage();
    });
  });
}

// Render Faculty Cards
function renderFacultyCards() {
  const container = document.getElementById('facultyCardsGrid');
  if (!container || !TIMETABLE_DATA) return;

  container.innerHTML = TIMETABLE_DATA.faculty_directory.map(fac => {
    const initials = fac.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('');
    return `
      <div class="faculty-card">
        <div class="fac-top">
          <div class="fac-avatar">${initials}</div>
          <div>
            <div class="fac-name">${fac.name}</div>
            <div class="fac-desig">${fac.designation || 'Faculty Member'}</div>
            <div style="font-size: 0.72rem; color: #94a3b8;">${fac.department || 'CSE'}</div>
          </div>
        </div>
        <div class="fac-subject-box">
          <div class="fac-subj-label">Subject Handled</div>
          <div class="fac-subj-name">${fac.subject}</div>
          ${fac.course_code ? `<div style="font-size: 0.72rem; font-family: var(--font-mono); color: #64748b; margin-top: 3px;">Code: ${fac.course_code}</div>` : ''}
          ${fac.assistants ? `<div style="font-size: 0.72rem; color: #059669; margin-top: 2px;">Assisted by: ${fac.assistants}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Render Venues
function renderVenues() {
  const container = document.getElementById('venuesGrid');
  if (!container || !TIMETABLE_DATA) return;

  container.innerHTML = TIMETABLE_DATA.venues.map(v => `
    <div class="venue-card">
      <div class="venue-header">
        <div class="venue-name">${v.name}</div>
        <div class="venue-type-tag">${v.type}</div>
      </div>
      <div class="venue-desc">${v.description}</div>
    </div>
  `).join('');
}

// Render Batches
function renderBatches() {
  const excelEl = document.getElementById('excelBatchList');
  const pythonEl = document.getElementById('pythonBatchList');
  if (!excelEl || !pythonEl || !TIMETABLE_DATA) return;

  const batches = TIMETABLE_DATA.batches_25CS307BC;

  excelEl.innerHTML = batches.excel.batches.map(b => `
    <div class="batch-item-card">
      <div class="batch-badge">Batch ${b.batch}</div>
      <div class="batch-venue">📍 Venue: ${b.venue}</div>
      <div class="batch-faculty">👨‍🏫 Faculty: <strong>${b.faculty}</strong></div>
    </div>
  `).join('');

  pythonEl.innerHTML = batches.python.batches.map(b => `
    <div class="batch-item-card">
      <div class="batch-badge">Batch ${b.batch}</div>
      <div class="batch-venue">📍 Venue: ${b.venue}</div>
      <div class="batch-faculty">👨‍🏫 Faculty: <strong>${b.faculty}</strong></div>
    </div>
  `).join('');
}
