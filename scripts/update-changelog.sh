#!/bin/bash
# CHANGELOG.md를 git log 기반으로 자동 업데이트
# post-commit hook에서 호출됨

REPO_ROOT="$(git rev-parse --show-toplevel)"
CHANGELOG="$REPO_ROOT/CHANGELOG.md"

if [ ! -f "$CHANGELOG" ]; then
  exit 0
fi

# 무한루프 방지: 환경변수 체크
if [ "$SKIP_CHANGELOG_HOOK" = "1" ]; then
  exit 0
fi

MARKER_START="<!-- AUTO-GENERATED: CHANGELOG_START -->"
MARKER_END="<!-- AUTO-GENERATED: CHANGELOG_END -->"

# 날짜별로 그룹핑된 커밋 로그를 임시 파일에 저장
CONTENT_FILE=$(mktemp)
git log --format="%ad|%h|%s" --date=short | awk -F'|' '
function translate(msg) {
  # 영어 커밋 접두사를 한글로 변환
  gsub(/^[ \t]+/, "", msg)
  if (msg ~ /^docs: auto-update/) { sub(/^docs: auto-update/, "문서: 자동 업데이트", msg) }
  else if (msg ~ /^docs:/) { sub(/^docs:/, "문서:", msg) }
  else if (msg ~ /^feat:/) { sub(/^feat:/, "기능:", msg) }
  else if (msg ~ /^fix:/) { sub(/^fix:/, "수정:", msg) }
  else if (msg ~ /^refactor:/) { sub(/^refactor:/, "리팩토링:", msg) }
  else if (msg ~ /^style:/) { sub(/^style:/, "스타일:", msg) }
  else if (msg ~ /^test:/) { sub(/^test:/, "테스트:", msg) }
  else if (msg ~ /^chore:/) { sub(/^chore:/, "기타:", msg) }
  else if (msg ~ /^Add /) { sub(/^Add /, "추가: ", msg) }
  else if (msg ~ /^Update /) { sub(/^Update /, "업데이트: ", msg) }
  else if (msg ~ /^Fix /) { sub(/^Fix /, "수정: ", msg) }
  else if (msg ~ /^Remove /) { sub(/^Remove /, "제거: ", msg) }
  else if (msg ~ /^Merge pull request/) { sub(/^Merge pull request/, "풀 리퀘스트 병합", msg) }
  else if (msg ~ /^Initial commit/) { msg = "초기 커밋" }
  return msg
}
{
  date = $1
  hash = $2
  msg = $3
  msg = translate(msg)
  if (date != prev_date) {
    if (prev_date != "") print ""
    print "## " date
    print ""
    prev_date = date
  }
  print "- [`" hash "`] " msg
}' > "$CONTENT_FILE"

# 마커 사이의 내용을 교체
TEMP_FILE=$(mktemp)

in_marker=0
while IFS= read -r line; do
  if [[ "$line" == *"CHANGELOG_START"* ]]; then
    echo "$line" >> "$TEMP_FILE"
    cat "$CONTENT_FILE" >> "$TEMP_FILE"
    in_marker=1
    continue
  fi
  if [[ "$line" == *"CHANGELOG_END"* ]]; then
    echo "$line" >> "$TEMP_FILE"
    in_marker=0
    continue
  fi
  if [ "$in_marker" -eq 0 ]; then
    echo "$line" >> "$TEMP_FILE"
  fi
done < "$CHANGELOG"

mv "$TEMP_FILE" "$CHANGELOG"
rm -f "$CONTENT_FILE"

# 변경사항이 있으면 자동 커밋
if ! git diff --quiet "$CHANGELOG" 2>/dev/null; then
  export SKIP_CHANGELOG_HOOK=1
  git add "$CHANGELOG"
  git commit --no-verify -m "문서: CHANGELOG.md 자동 업데이트"
  echo "[자동 업데이트] CHANGELOG.md 업데이트 및 커밋 완료"
else
  echo "[자동 업데이트] CHANGELOG.md 변경사항 없음"
fi
