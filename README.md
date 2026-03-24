# HTML Project

## 프로젝트 소개

HTML/CSS/JS 학습 및 실습 프로젝트입니다.

## 프로젝트 구조

```
├── review/                    # 식당 리뷰 생성기
│   ├── index.html             # 메인 페이지
│   ├── css/style.css          # 스타일시트
│   ├── js/
│   │   ├── app.js             # 리뷰 생성 로직 (Gemini API)
│   │   └── config.js          # 식당 정보 및 API 설정
│   └── prompts/
│       └── review-prompt.md   # 리뷰 생성 프롬프트 템플릿
├── 마개이너/                   # HTML/CSS 실습 파일
│   ├── Twice.html
│   ├── Twice2.html / twice2.css
│   ├── Twice3.html / twice3.css
│   ├── 200530_실습.html / .css
│   └── 200530_슬기로운 의사생활.html / .css
├── CHANGELOG.md               # 변경 이력
└── README.md                  # 이 파일
```

## 주요 기능

### 식당 리뷰 생성기 (`review/`)
- **대상**: 강설옥 설렁탕 군자본점
- **기능**: Gemini API를 활용한 네이버 지도 영수증 후기 자동 생성
- **특징**: 네이버 키워드를 자연스럽게 반영한 리뷰 생성, 원클릭 복사 및 네이버 지도 연결

## 최근 커밋

<!-- AUTO-GENERATED: RECENT_COMMITS_START -->
| 해시 | 메시지 |
|------|--------|
| fc59821 | 문서: 자동 업데이트 README.md |
| 26c2f05 | 문서: CHANGELOG.md 자동 업데이트 |
| a52ea6c | 업데이트: scripts for changelog and readme automation |
| acf3b3a | 문서: CHANGELOG.md 자동 업데이트 |
| 2e5eedb | 문서: 자동 업데이트 README.md |
| abe7147 | 문서: 자동 업데이트 CHANGELOG.md |
| d9acc90 | 문서: 자동 업데이트 CHANGELOG.md |
| 4ff42d9 | 추가: GitHub Actions deploy workflow and update review generator |
| f5c4cff | 풀 리퀘스트 병합 #1 from sijinjeon/claude/plan-restaurant-reviews-R1ppv |
| f112774 | 추가: restaurant review generator page for 강설옥 설렁탕 |
<!-- AUTO-GENERATED: RECENT_COMMITS_END -->

---

> 이 README는 `pre-push` hook에 의해 자동 업데이트됩니다.
