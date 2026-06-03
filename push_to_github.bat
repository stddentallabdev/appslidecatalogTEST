@echo off
title S.T.D. Dental Lab - GitHub Upload Helper
echo ========================================================
echo S.T.D. Dental Lab - GitHub Upload Helper
echo ========================================================
echo.
echo Initializing Git repository...
git init

echo Configuring local developer identity...
git config user.email "stddentallabdev@stddentallab.com"
git config user.name "stddentallabdev"

echo Adding files to commit...
git add .

echo Committing files...
git commit -m "Initialize S.T.D. Instant Video Catalog project with Reels UI"

echo Setting up branch and remote URL...
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin https://github.com/stddentallabdev/appslidecatalogTEST.git

echo.
echo Attempting to push code to GitHub...
echo (A browser popup may appear to ask you to sign in to GitHub)
echo.
git push -u origin main

echo.
echo ========================================================
echo Upload Finished! Press any key to exit.
echo ========================================================
pause
