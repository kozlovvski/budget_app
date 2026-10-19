#!/usr/bin/env bash
# Open issues that no open issue blocks, earliest milestone first. Priority is in the project, not here.
# Usage: scripts/next-issues.sh [milestone prefix, e.g. M1]
set -euo pipefail
gh api graphql --paginate -f query='
query($endCursor: String) {
  repository(owner: "kozlovvski", name: "budget_app") {
    issues(first: 100, states: OPEN, after: $endCursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        number title url
        milestone { title }
        labels(first: 20) { nodes { name } }
        blockedBy(first: 50) { nodes { state } }
      }
    }
  }
}' --jq '.data.repository.issues.nodes[]' |
  jq -rs --arg ms "${1:-}" '
    map(select(any(.labels.nodes[]; .name == "requirement" or .name == "spike" or .name == "journey-checklist"))
        | select(all(.blockedBy.nodes[]; .state != "OPEN"))
        | select((.milestone.title // "~Later") | startswith($ms)))
    | sort_by(.milestone.title // "~Later", .title)
    | .[] | "\(.milestone.title // "Later")\t#\(.number)\t\(.title)\t\(.url)"'
