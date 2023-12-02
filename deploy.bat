@echo off
SETLOCAL EnableDelayedExpansion

:: Construire le projet
call npm run build
IF NOT %ERRORLEVEL% == 0 (
    echo La construction du projet a échoué.
    exit /b 1
)
:: Sauvegarder la branche actuelle
FOR /F "tokens=*" %%i IN ('git rev-parse --abbrev-ref HEAD') DO SET "current_branch=%%i"

:: Créer une nouvelle branche temporaire
git checkout -b temp-deploy

:: Ajouter et committer le dossier dist
git add dist -f
git commit -m "Déploiement du dossier dist"

:: Pousser sur la branche dev du dépôt deploy
git push deploy temp-deploy:dev

:: Revenir à la branche originale
git checkout %current_branch%

:: Supprimer la branche temporaire
git branch -d temp-deploy

echo Déploiement réussi sur la branche dev.
ENDLOCAL
