#!/bin/bash
# README.md의 최근 커밋 섹션을 자동 업데이트
# pre-push hook에서 호출됨

REPO_ROOT="$(git rev-parse --show-toplevel)"
README="$REPO_ROOT/README.md"

if [ ! -f "$README" ]; then
  exit 0
fi

# 최근 커밋 10개를 테이블 형식으로 생성
COMMITS=$(git log --oneline -10 --format="| %h | %s |")

# README의 최근 커밋 섹션 교체
MARKER_START="<!-- AUTO-GENERATED: RECENT_COMMITS_START -->"
MARKER_END="<!-- AUTO-GENERATED: RECENT_COMMITS_END -->"

# 프로젝트 구조 동적 생성
TREE=$(cd "$REPO_ROOT" && find . -maxdepth 3 -not -path './.git/*' -not -path './scripts/*' -not -name '.gitignore' -not -name '.' | sort | head -40)

# sed로 마커 사이의 내용 교체
TEMP_FILE=$(mktemp)

awk -v start="$MARKER_START" -v end="$MARKER_END" -v commits="$COMMITS" '
  $0 ~ start {
    print
    print "| 해시 | 메시지 |"
    print "|------|--------|"
    n = split(commits, lines, "\n")
    for (i = 1; i <= n; i++) {
      if (lines[i] != "") print lines[i]
    }
    skip = 1
    next
  }
  $0 ~ end {
    skip = 0
    print
    next
  }
  !skip { print }
' "$README" > "$TEMP_FILE"

mv "$TEMP_FILE" "$README"

echo "[auto-update] README.md 최근 커밋 섹션 업데이트 완료"
