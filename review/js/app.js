// === Gemini API 리뷰 생성 ===

const REVIEW_PROMPT = `당신은 "${CONFIG.RESTAURANT.name}"(${CONFIG.RESTAURANT.address}, ${CONFIG.RESTAURANT.region}역 근처)을 방문한 일반 고객입니다.
네이버 지도 영수증 후기를 작성해주세요.

조건:
- 350자 이내
- 자연스러운 한국어, 캐주얼한 톤 (20~40대가 쓰는 느낌)
- 메뉴 중 하나 이상 자연스럽게 언급: ${CONFIG.RESTAURANT.keywords.join(', ')}
- 맛, 양, 가격, 서비스, 분위기 중 2~3가지 자연스럽게 포함
- 다양한 상황 중 하나를 랜덤으로 설정 (혼밥, 가족모임, 직장동료, 친구, 데이트, 재방문 등)
- 이모티콘이나 ㅎㅎ, ㅠㅠ 같은 표현 자연스럽게 사용 가능
- 후기 본문만 출력 (따옴표, 제목, 설명, 앞뒤 부연 없이 오직 후기 텍스트만)`;

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
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: REVIEW_PROMPT }] }],
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
