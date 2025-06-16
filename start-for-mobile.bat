@echo off
echo ========================================
echo 🚀 DÉMARRAGE COMPLET POUR TEST MOBILE
echo ========================================
echo.
echo 📱 Instructions :
echo 1. Ce script va démarrer le backend et frontend
echo 2. Ensuite, lancez ngrok dans un autre terminal
echo 3. Utilisez l'URL ngrok sur votre téléphone
echo.
echo ========================================
echo.

echo 🔧 Démarrage du backend...
start "Backend Server" cmd /k "npm run server:dev"

timeout /t 3 /nobreak >nul

echo 🎨 Démarrage du frontend...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Serveurs démarrés !
echo.
echo 📋 Prochaines étapes :
echo 1. Attendez que les serveurs soient prêts
echo 2. Lancez ngrok : double-cliquez sur start-ngrok.bat
echo 3. Utilisez l'URL HTTPS ngrok sur votre téléphone
echo.
pause
