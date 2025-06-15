Write-Host "========================================" -ForegroundColor Green
Write-Host "🚀 DÉMARRAGE DE NGROK POUR TEST MOBILE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Gardez cette fenêtre ouverte !" -ForegroundColor Yellow
Write-Host "🔗 L'URL pour votre téléphone apparaîtra ci-dessous" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

try {
    # Lancer ngrok
    & ngrok http 5173
} catch {
    Write-Host "❌ Erreur lors du lancement de ngrok: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "❌ NGROK S'EST ARRÊTÉ" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
