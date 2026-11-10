#!/bin/bash
# Mac / Linux: run: bash push-to-github.sh
# Replace YOUR-USERNAME first
REPO_URL="https://github.com/Shakarrr89/new-hub"
git init
git add .
git commit -m "Initial commit: Work Hub frontend + Supabase schema"
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"
git push -u origin main
