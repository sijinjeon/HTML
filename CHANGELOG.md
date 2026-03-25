# 변경 이력

모든 주요 변경사항이 이 파일에 기록됩니다.
이 파일은 `pre-commit` hook에 의해 매 커밋 시 자동 업데이트됩니다.

<!-- AUTO-GENERATED: CHANGELOG_START -->
## 2026/03/25

- [`5701173`] 2026/03/25 13:00 UI: 스피너를 퍼센트 프로그레스 카운터로 교체
- [`af6eb53`] 2026/03/25 12:28 UI: 스피너 회전 속도 3배로 증가 (0.75s → 0.25s)
- [`ad3cf39`] 2026/03/25 12:27 UI: 로딩 멘트 변경 및 스피너 회전 속도 향상
- [`83da47b`] 2026/03/25 12:25 변경: 세션당 리뷰 생성 3회 제한, 자동 재시도 제거
- [`3f82812`] 2026/03/25 12:22 수정: 리뷰 잘림 방지 — maxOutputTokens 8192 + 잘림 감지 자동 재생성
- [`a5dd801`] 2026/03/25 12:16 수정: maxOutputTokens 500→2048로 증가, 최소 글자수 범위 상향
- [`829eef3`] 2026/03/25 12:10 정리: CHANGELOG 스크립트 간소화, pending 엔트리 로직 제거
- [`b97fc39`] 2026/03/25 12:09 변경: CHANGELOG 자동 갱신을 post-commit에서 pre-commit으로 전환
- [`da54c70`] 2026/03/25 12:03 추가: 페르소나 기반 리뷰 생성 시스템 및 UI 개선
- [`91b7f2f`] 2026/03/25 11:41 UI 개선: 리뷰 텍스트 줄바꿈 수정, 이용 순서 안내 카드 위로 이동, 이모지/마크다운 제거
- [`700d02a`] 2026/03/25 11:33 추가: favicon
- [`4659f65`] 2026/03/25 11:33 Merge branch 'master' of https://github.com/sijinjeon/HTML
- [`0e6f42f`] 2026/03/25 11:32 Improve mobile readability: larger text, better spacing, small device support
- [`36d96b0`] 2026/03/25 11:31 favicon
- [`cfbb555`] 2026/03/25 11:30 favicon
- [`b4f3e97`] 2026/03/25 11:30 Increase review length to 200-400 chars and enlarge review card
- [`86d39b7`] 2026/03/25 11:26 업데이트: Gemini model from 2.0-flash to 2.5-flash
- [`d02de84`] 2026/03/25 11:11 Redeploy
- [`c8af4e7`] 2026/03/25 11:10 Trigger deploy with new project API key
- [`2752874`] 2026/03/25 11:05 Trigger deploy with updated secret
- [`513d367`] 2026/03/25 01:40 Trigger deploy with new project API key
- [`1cba369`] 2026/03/25 01:35 Trigger deploy with new API key
- [`090bfd5`] 2026/03/25 01:33 Trigger deploy
- [`7c5cfc6`] 2026/03/25 01:30 제거: undefined updateLoadingText call
- [`c8b7993`] 2026/03/25 01:28 제거: retry logic to prevent quota waste, 1 request per action
- [`736b580`] 2026/03/25 01:18 Clean up auto-generated README and remove unused script
- [`f91da46`] 2026/03/25 01:16 Simplify retry logic and show wait message on 429 errors
- [`37e59e6`] 2026/03/25 01:14 추가: retry logic and fallback model for 429 rate limit errors
- [`128bd0b`] 2026/03/25 01:11 추가: error detail display for debugging API failures
- [`603aac3`] 2026/03/25 01:08 문서: 자동 업데이트 README.md
- [`fc59821`] 2026/03/25 01:08 문서: 자동 업데이트 README.md
- [`a52ea6c`] 2026/03/25 01:08 업데이트: scripts for changelog and readme automation
- [`2e5eedb`] 2026/03/25 01:06 문서: 자동 업데이트 README.md
- [`abe7147`] 2026/03/25 01:06 문서: 자동 업데이트 CHANGELOG.md
- [`d9acc90`] 2026/03/25 01:06 문서: 자동 업데이트 CHANGELOG.md
- [`4ff42d9`] 2026/03/25 01:06 추가: GitHub Actions deploy workflow and update review generator
- [`f5c4cff`] 2026/03/25 00:40 풀 리퀘스트 병합 #1 from sijinjeon/claude/plan-restaurant-reviews-R1ppv

## 2026/03/24

- [`f112774`] 2026/03/24 15:18 추가: restaurant review generator page for 강설옥 설렁탕

## 2020/05/30

- [`5009d9a`] 2020/05/30 17:48 ver1
- [`7c29c6d`] 2020/05/30 15:59 추가: files via upload

## 2020/05/16

- [`7310ff7`] 2020/05/16 01:49 추가: files via upload
- [`c4e90b0`] 2020/05/16 01:49 추가: files via upload
- [`8bd3c57`] 2020/05/16 01:48 추가: files via upload
- [`81067af`] 2020/05/16 01:45 초기 커밋
<!-- AUTO-GENERATED: CHANGELOG_END -->
