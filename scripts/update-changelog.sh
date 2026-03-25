#!/bin/bash
# CHANGELOG.md를 git log 기반으로 자동 업데이트
# pre-commit hook에서 호출: 별도 커밋 없이 현재 커밋에 CHANGELOG 포함
#
# 동작 방식: git log에서 전체 커밋 이력을 읽어 CHANGELOG를 갱신한 뒤
# git add로 스테이징에 추가. 현재 커밋 자신은 다음 커밋 시 반영됨.

REPO_ROOT="$(git rev-parse --show-toplevel)"
CHANGELOG="$REPO_ROOT/CHANGELOG.md"

if [ ! -f "$CHANGELOG" ]; then
  exit 0
fi

MARKER_START="<!-- AUTO-GENERATED: CHANGELOG_START -->"
MARKER_END="<!-- AUTO-GENERATED: CHANGELOG_END -->"

CONTENT_FILE=$(mktemp)
TZ="Asia/Seoul" git log --format="%ad|%h|%s" --date=format:"%Y/%m/%d %H:%M" | awk -F'|' '
function translate(msg) {
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
  if (msg == "문서: CHANGELOG.md 자동 업데이트") return "__SKIP__"
  return msg
}
{
  datetime = $1
  hash = $2
  msg = $3
  msg = translate(msg)
  if (msg == "__SKIP__") next
  date_part = substr(datetime, 1, 10)
  if (date_part != prev_date) {
    if (prev_date != "") print ""
    print "## " date_part
    print ""
    prev_date = date_part
  }
  print "- [`" hash "`] " datetime " " msg
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

git add "$CHANGELOG"
echo "[pre-commit] CHANGELOG.md 자동 갱신 완료"
