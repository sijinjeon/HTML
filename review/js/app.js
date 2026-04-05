// === Gemini API 리뷰 생성 ===

let promptTemplateText = null;

async function loadPromptTemplate() {
  if (promptTemplateText) return promptTemplateText;
  const path = CONFIG.PROMPT_TEMPLATE_PATH || 'prompts/review-prompt.md';
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`프롬프트 파일을 불러오지 못했습니다: ${path} (${res.status})`);
  }
  promptTemplateText = await res.text();
  return promptTemplateText;
}

function pickRandom(list, count) {
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const PERSONAS = [
  { age: '10대', gender: '남자', traits: '급식체를 자연스럽게 쓰고, "ㄹㅇ", "개~", "미쳤다", "존맛" 같은 표현을 씀. 문장이 짧고 감탄사가 많음. 부모님이나 친구랑 온 상황.' },
  { age: '10대', gender: '여자', traits: '"진짜 너무", "완전", "대박" 같은 강조 표현을 자주 씀. 친구한테 말하듯 쓰고, "~거든요", "~였는데!" 같은 어미를 씀. 부모님이나 친구랑 온 상황.' },
  { age: '20대', gender: '남자', traits: '간결하고 쿨한 톤. "솔직히", "인정", "가성비 미쳤다" 같은 표현. 불필요한 수식어 없이 핵심만 씀. 혼밥이나 친구와 방문.' },
  { age: '20대', gender: '여자', traits: '밝고 에너지 넘치는 톤. "~해서 너무 좋았어요", "강추!", "꼭 가보세요" 같은 추천형 문장. 디테일한 묘사를 좋아함. 친구나 데이트로 방문.' },
  { age: '30대', gender: '남자', traits: '담백하고 객관적인 톤. 맛에 대한 분석적 서술("육향이 깊다", "간이 적절하다"). "~합니다" 체와 "~했어요" 체를 섞어 씀. 직장동료나 혼밥.' },
  { age: '30대', gender: '여자', traits: '꼼꼼하고 정보성 있는 톤. 분위기, 서비스, 맛을 골고루 언급. "~더라고요"를 자주 쓰고 공감형 문장이 많음. 가족이나 친구와 방문.' },
  { age: '40대', gender: '남자', traits: '진중하고 경험 많은 톤. "여기저기 다녀봤지만", "오랜만에 제대로 된" 같은 비교형 표현. 문장이 길고 서술적. 가족모임이나 회식.' },
  { age: '40대', gender: '여자', traits: '따뜻하고 살뜰한 톤. 가족 이야기를 자연스럽게 넣고, "아이들도 잘 먹었어요", "남편이 좋아했어요" 같은 표현. 정성스럽게 씀. 가족 방문.' },
];

const CHAR_RANGES = [
  { min: 150, max: 220 },
  { min: 200, max: 280 },
  { min: 250, max: 330 },
  { min: 280, max: 380 },
  { min: 300, max: 400 },
];

function buildPersonaText(persona) {
  return `${persona.age} ${persona.gender} / 성격: ${persona.traits}`;
}

function getSelectedMenus() {
  const checked = document.querySelectorAll('input[name="menu"]:checked');
  return Array.from(checked).map((el) => el.value);
}

function buildPromptFromTemplate(template) {
  const selectedKeywords = pickRandom(CONFIG.RESTAURANT.keywords || [], 3 + Math.floor(Math.random() * 3));
  const keywordsList = selectedKeywords.map((k) => `- ${k}`).join('\n');

  const regionList = pickRandom(CONFIG.RESTAURANT.region || [], 2).map((r) => `- ${r}`).join('\n');
  const selectedMenus = getSelectedMenus();
  const foodList = selectedMenus.map((m) => `- ${m}`).join('\n');

  const persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
  const personaText = buildPersonaText(persona);

  const range = CHAR_RANGES[Math.floor(Math.random() * CHAR_RANGES.length)];
  const jitter = Math.floor(Math.random() * 30) - 15;
  const minChar = range.min + jitter;
  const maxChar = range.max + jitter;
  const charRange = `${minChar}~${maxChar}자 분량`;

  return template
    .replace(/\{\{PERSONA\}\}/g, personaText)
    .replace(/\{\{CHAR_RANGE\}\}/g, charRange)
    .replace(/\{\{RESTAURANT_NAME\}\}/g, CONFIG.RESTAURANT.name)
    .replace(/\{\{RESTAURANT_ADDRESS\}\}/g, CONFIG.RESTAURANT.address)
    .replace(/\{\{STATION_AREA\}\}/g, CONFIG.RESTAURANT.stationArea)
    .replace(/\{\{MENUS\}\}/g, selectedMenus.join(', '))
    .replace(/\{\{REGION_LIST\}\}/g, regionList)
    .replace(/\{\{FOOD_LIST\}\}/g, foodList)
    .replace(/\{\{KEYWORDS_LIST\}\}/g, keywordsList);
}

async function callGeminiAPI(prompt) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1.2,
          maxOutputTokens: 8192,
        },
      }),
    }
  );
}

let currentReview = '';
const SESSION_MAX = 3;
let sessionCount = 0;

function sanitizeReviewText(text) {
  if (!text) return text;
  let s = text.replace(/\*{1,2}/g, '');
  s = s.replace(/\p{Extended_Pictographic}/gu, '');
  s = s.replace(/\uFE0F|\u200D/g, '');
  return s.trim();
}

function updateQuotaUI() {
  const remaining = SESSION_MAX - sessionCount;
  const quotaEl = document.getElementById('quota-text');
  const refreshBtn = document.getElementById('btn-refresh');

  if (remaining <= 0) {
    quotaEl.textContent = '리뷰 생성 횟수를 모두 사용했습니다';
    quotaEl.style.color = '#e74c3c';
    refreshBtn.disabled = true;
    refreshBtn.style.opacity = '0.4';
    refreshBtn.style.cursor = 'not-allowed';
  } else {
    quotaEl.textContent = `남은 횟수: ${remaining}/${SESSION_MAX}`;
    quotaEl.style.color = '#999';
  }
}

let progressTimer = null;

function startProgress() {
  const numEl = document.getElementById('progress-number');
  const barEl = document.getElementById('progress-bar');
  let current = 0;
  numEl.textContent = '0%';
  barEl.style.width = '0%';

  progressTimer = setInterval(() => {
    const remaining = 99 - current;
    const step = Math.max(0.3, remaining * 0.04 + Math.random() * 0.8);
    current = Math.min(current + step, 99);
    const rounded = Math.floor(current);
    numEl.textContent = `${rounded}%`;
    barEl.style.width = `${rounded}%`;

    if (current >= 99) clearInterval(progressTimer);
  }, 150);
}

function finishProgress() {
  if (progressTimer) clearInterval(progressTimer);
  const numEl = document.getElementById('progress-number');
  const barEl = document.getElementById('progress-bar');
  numEl.textContent = '100%';
  barEl.style.width = '100%';
}

function resetProgress() {
  if (progressTimer) clearInterval(progressTimer);
  const numEl = document.getElementById('progress-number');
  const barEl = document.getElementById('progress-bar');
  if (numEl) numEl.textContent = '0%';
  if (barEl) barEl.style.width = '0%';
}

async function generateReview() {
  const menuWarning = document.getElementById('menu-warning');
  const selectedMenus = getSelectedMenus();
  if (selectedMenus.length === 0) {
    menuWarning.style.display = 'block';
    return;
  }
  menuWarning.style.display = 'none';

  if (sessionCount >= SESSION_MAX) {
    updateQuotaUI();
    return;
  }

  sessionCount++;
  updateQuotaUI();

  // 리뷰 영역 표시
  document.getElementById('review-card').style.display = '';
  document.getElementById('review-guide').style.display = '';
  document.getElementById('btn-area').style.display = '';

  const loading = document.getElementById('loading');
  const content = document.getElementById('review-content');
  const error = document.getElementById('error-message');
  const refreshIcon = document.getElementById('refresh-icon');

  loading.style.display = 'flex';
  content.style.display = 'none';
  error.style.display = 'none';
  refreshIcon.style.transition = 'transform 0.5s';
  refreshIcon.style.transform = 'rotate(360deg)';
  setTimeout(() => {
    refreshIcon.style.transition = 'none';
    refreshIcon.style.transform = 'rotate(0deg)';
  }, 500);

  startProgress();

  try {
    const template = await loadPromptTemplate();
    const reviewPrompt = buildPromptFromTemplate(template);
    const response = await callGeminiAPI(reviewPrompt);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('잠시 후 다시 시도해주세요 (1분 뒤)');
      }
      const errBody = await response.json().catch(() => ({}));
      const msg = errBody?.error?.message || `HTTP ${response.status}`;
      throw new Error(`API 오류: ${msg}`);
    }

    const data = await response.json();
    const reviewText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!reviewText) {
      throw new Error('리뷰 텍스트를 받지 못했습니다.');
    }

    currentReview = sanitizeReviewText(reviewText);

    finishProgress();
    await new Promise(r => setTimeout(r, 350));

    loading.style.display = 'none';
    content.textContent = currentReview;
    content.style.display = 'block';
    content.classList.remove('fade-in');
    void content.offsetWidth;
    content.classList.add('fade-in');
  } catch (err) {
    console.error('리뷰 생성 실패:', err);
    resetProgress();
    loading.style.display = 'none';
    error.style.display = 'block';
    error.querySelector('p').textContent = `리뷰 생성에 실패했어요. (${err.message})`;
  }
}

async function copyReview() {
  if (!currentReview) return;

  const feedback = document.getElementById('copy-feedback');

  try {
    // 모던 Clipboard API
    await navigator.clipboard.writeText(currentReview);
  } catch {
    // 폴백: execCommand
    const textarea = document.createElement('textarea');
    textarea.value = currentReview;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  // 피드백 표시
  feedback.style.display = 'block';
  setTimeout(() => {
    feedback.style.display = 'none';
  }, 2000);
}

// 페이지 로드 시 메뉴 선택 대기
document.addEventListener('DOMContentLoaded', () => {
  updateQuotaUI();
});
