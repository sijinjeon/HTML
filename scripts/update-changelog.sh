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

# 날짜별로 그룹핑된 커밋 로그 생성
CHANGELOG_CONTENT=$(git log --format="%ad|%h|%s" --date=short | awk -F'|' '
{
  date = $1
  hash = $2
  msg = $3
  if (date != prev_date) {
    if (prev_date != "") print ""
    print "## " date
    print ""
    prev_date = date
  }
  print "- [`" hash "`] " msg
}')

# 마커 사이의 내용 교체
TEMP_FILE=$(mktemp)

awk -v start="$MARKER_START" -v end="$MARKER_END" '
  $0 ~ start {
    print
    skip = 1
    next
  }
  $0 ~ end {
    skip = 0
    print
    next
  }
  !skip { print }
' "$CHANGELOG" > "$TEMP_FILE"

# 마커 사이에 새 내용 삽입
FINAL_FILE=$(mktemp)

awk -v start="$MARKER_START" -v content_file="$REPO_ROOT/.changelog_tmp" '
  $0 ~ start {
    print
    while ((getline line < content_file) > 0) {
      print line
    }
    next
  }
  { print }
' "$TEMP_FILE" > "$FINAL_FILE" 2>/dev/null

# 임시 파일에 changelog 내용 저장 후 삽입
echo "$CHANGELOG_CONTENT" > "$REPO_ROOT/.changelog_tmp"

awk -v start="$MARKER_START" '
  $0 ~ start {
    print
    while ((getline line < "'"$REPO_ROOT/.changelog_tmp"'") > 0) {
      print line
    }
    next
  }
  { print }
' "$TEMP_FILE" > "$FINAL_FILE"

mv "$FINAL_FILE" "$CHANGELOG"
rm -f "$TEMP_FILE" "$REPO_ROOT/.changelog_tmp"

# 변경사항이 있으면 자동 커밋
if ! git diff --quiet "$CHANGELOG" 2>/dev/null; then
  export SKIP_CHANGELOG_HOOK=1
  git add "$CHANGELOG"
  git commit --no-verify -m "docs: auto-update CHANGELOG.md"
  echo "[auto-update] CHANGELOG.md 자동 업데이트 및 커밋 완료"
else
  echo "[auto-update] CHANGELOG.md 변경사항 없음"
fi
