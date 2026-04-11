#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

run_step() {
  local label="$1"
  shift

  printf '\n==> %s\n' "$label"
  "$@"
}

run_step "Typecheck" pnpm typecheck
run_step "Fast tests" pnpm test:fast
run_step "Production build" pnpm build

printf '\nPush verification passed.\n'
