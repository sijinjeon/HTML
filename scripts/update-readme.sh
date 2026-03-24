#!/bin/bash
# README.md의 최근 커밋 섹션을 자동 업데이트
# pre-push hook에서 호출됨

REPO_ROOT="$(git rev-parse --show-toplevel)"
README="$REPO_ROOT/README.md"

if [ ! -f "$README" ]; then
  exit 0
fi

# 최근 커밋 10개를 한글 변환하여 임시 파일에 저장
COMMITS_FILE=$(mktemp)
git log --oneline -10 --format="%h|%s" | awk -F'|' '
function translate(msg) {
  gsub(/^[ \t]+/, "", msg)
  if (msg ~ /^docs: auto-update/) { sub(/^docs: auto-update/, "문서: 자동 업데이트", msg) }
  else if (msg ~ /^문서:/) { }
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
  hash = $1
  msg = $2
  msg = translate(msg)
  print "| " hash " | " msg " |"
}' > "$COMMITS_FILE"

MARKER_START="RECENT_COMMITS_START"
MARKER_END="RECENT_COMMITS_END"

# 마커 사이의 내용을 교체
TEMP_FILE=$(mktemp)

in_marker=0
while IFS= read -r line; do
  if [[ "$line" == *"$MARKER_START"* ]]; then
    echo "$line" >> "$TEMP_FILE"
    echo "| 해시 | 메시지 |" >> "$TEMP_FILE"
    echo "|------|--------|" >> "$TEMP_FILE"
    cat "$COMMITS_FILE" >> "$TEMP_FILE"
    in_marker=1
    continue
  fi
  if [[ "$line" == *"$MARKER_END"* ]]; then
    echo "$line" >> "$TEMP_FILE"
    in_marker=0
    continue
  fi
  if [ "$in_marker" -eq 0 ]; then
    echo "$line" >> "$TEMP_FILE"
  fi
done < "$README"

mv "$TEMP_FILE" "$README"
rm -f "$COMMITS_FILE"

echo "[자동 업데이트] README.md 최근 커밋 섹션 업데이트 완료"
