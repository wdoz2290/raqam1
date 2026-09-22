@echo off
title RAQAM Luxury Boutique Server & Tunnel
echo ===================================================
echo   RAQAM - Eksklyuziv Telefon Raqamlari Boutique
echo ===================================================
echo 1. Lokal server ishga tushirilmoqda...
start /B python serve.py
timeout /t 2 >nul
echo 2. Tashqi internet havolasi (Tunnel) ochilmoqda...
.\cloudflared.exe tunnel --url http://localhost:8000
pause
