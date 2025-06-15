@echo off
echo ========================================
echo 🔄 REDÉMARRAGE DU FRONTEND POUR NGROK
echo ========================================
echo.

echo 🛑 Arrêt des processus Node existants...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 🎨 Redémarrage du frontend...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Frontend redémarré !
echo 📋 Maintenant testez votre URL ngrok sur le téléphone
echo.
pause
