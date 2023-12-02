@echo off
SETLOCAL EnableDelayedExpansion

:: Vérifiez si l'argument est fourni
IF "%1"=="" (
    echo Usage: %0 [dev|prod]
    exit /b 1
)

:: Déterminez la branche de déploiement en fonction de l'argument
IF "%1"=="dev" (
    SET "deploy_branch=dev"
) ELSE IF "%1"=="prod" (
    SET "deploy_branch=prod"
) ELSE (
    echo Argument invalide. Utilisez 'dev' ou 'prod'.
    exit /b 1
)

:: Sauvegardez la branche actuelle
FOR /F "tokens=*" %%i IN ('git rev-parse --abbrev-ref HEAD') DO SET "current_branch=%%i"

:: Assurez-vous que vous êtes sur la branche main
git checkout main

:: Exécutez npm run build
call npm run build
IF NOT %ERRORLEVEL% == 0 (
    echo La commande a échoué: npm run build
    exit /b 1
)

:: Ajouter le dossier build
git add dist --force
git add package.json

:: Demander le message de commit
echo Entrez le message de commit :
SET /P commit_message=
git commit -m "%commit_message%"

:: Pousser la branche main sur la branche spécifiée sur le dépôt distant deploy
git push deploy main:%deploy_branch%

:: Nettoyage
git checkout %current_branch%

echo Deploiement sur la branche << %deploy_branch% >> termine avec succes.
ENDLOCAL
