#!/usr/bin/env bash
# Cleanup script to remove secrets and build artifacts from the git index.
# THIS SCRIPT MUST BE RUN LOCALLY. It will:
#  - remove .env.local from git index (safe if file remains locally)
#  - remove .next from git index
#  - commit the changes
#  - remind to rotate secrets

set -euo pipefail

echo "This script will remove .env.local and .next from the git index and create a commit."
read -p "Proceed? (yes/no) " ans
if [[ "$ans" != "yes" ]]; then
  echo "Aborted by user. No changes made."
  exit 0
fi

# Ensure .env.local is in .gitignore
if ! grep -qxF ".env.local" .gitignore 2>/dev/null; then
  echo ".env.local" >> .gitignore
  echo "Added .env.local to .gitignore"
fi

git rm --cached -f .env.local || true
git rm -r --cached -f .next || true

git add .gitignore || true
git commit -m "chore(secrets): remove .env.local and .next from repository index"

echo "Committed removal of .env.local and .next from index."
echo "IMPORTANT: Rotate any secrets that were committed previously (Clerk, Stripe, etc)."
echo "Example: rotate Clerk/Stripe keys in their respective dashboards and update CI secrets."
