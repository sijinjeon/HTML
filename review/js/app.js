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

// 네이버 키워드 중 랜덤 3~5개 선택
function pickRandomKeywords(count) {
  const list = CONFIG.RESTAURANT.keywords || [];
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildPromptFromTemplate(template) {
  const selectedKeywords = pickRandomKeywords(3 + Math.floor(Math.random() * 3)); // 3~5개
  const keywordsList = selectedKeywords.map((k) => `- ${k}`).join('\n');
  return template
    .replace(/\{\{RESTAURANT_NAME\}\}/g, CONFIG.RESTAURANT.name)
    .replace(/\{\{RESTAURANT_ADDRESS\}\}/g, CONFIG.RESTAURANT.address)
    .replace(/\{\{STATION_AREA\}\}/g, CONFIG.RESTAURANT.stationArea)
    .replace(/\{\{MENUS\}\}/g, CONFIG.RESTAURANT.menus.join(', '))
    .replace(/\{\{KEYWORDS_LIST\}\}/g, keywordsList);
}

let currentReview = '';

async function generateReview() {
  const loading = document.getElementById('loading');
  const content = document.getElementById('review-content');
  const error = document.getElementById('error-message');
  const refreshIcon = document.getElementById('refresh-icon');

  // 로딩 상태
  loading.style.display = 'block';
  content.style.display = 'none';
  error.style.display = 'none';
  refreshIcon.style.transition = 'transform 0.5s';
  refreshIcon.style.transform = 'rotate(360deg)';
  setTimeout(() => {
    refreshIcon.style.transition = 'none';
    refreshIcon.style.transform = 'rotate(0deg)';
  }, 500);

  try {
    const template = await loadPromptTemplate();
    const reviewPrompt = buildPromptFromTemplate(template);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: reviewPrompt }] }],
          generationConfig: {
            temperature: 1.2,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    const reviewText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!reviewText) {
      throw new Error('리뷰 텍스트를 받지 못했습니다.');
    }

    currentReview = reviewText;

    // 리뷰 표시
    loading.style.display = 'none';
    content.textContent = currentReview;
    content.style.display = 'block';
    content.classList.remove('fade-in');
    // 리플로우 트리거 후 애니메이션
    void content.offsetWidth;
    content.classList.add('fade-in');
  } catch (err) {
    console.error('리뷰 생성 실패:', err);
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

// 페이지 로드 시 리뷰 생성
document.addEventListener('DOMContentLoaded', generateReview);
