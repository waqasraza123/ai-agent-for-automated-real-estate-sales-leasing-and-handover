#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if [[ "${1:-}" == "--" ]]; then
  shift
fi

pnpm setup:githooks >/dev/null
./scripts/verify-push.sh

if ! git remote | grep -q .; then
  printf '\nNo git remote configured. Push skipped.\n'
  exit 0
fi

SKIP_PRE_PUSH_VERIFY=1 git push "$@"
