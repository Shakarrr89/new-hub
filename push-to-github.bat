@echo off
REM Windows: double-click this, or run it in Command Prompt inside this folder
REM Replace YOUR-USERNAME below first, or it will ask you
set REPO_URL=https://github.com/YOUR-USERNAME/sheets-hub.git
git init
git add .
git commit -m "Initial commit: Work Hub frontend + Supabase schema"
git branch -M main
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git push -u origin main
pause
