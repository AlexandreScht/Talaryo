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

:: Créer une nouvelle branche temporaire à partir de dev
git fetch deploy %deploy_branch%
git checkout -b temp-branch deploy/%deploy_branch%

:: Ajouter le dossier build
git add chemin/vers/le/dossier/build

:: Demander le message de commit
echo Entrez le message de commit :
SET /P commit_message=
git commit -m "%commit_message%"

:: Pousser sur la branche dev
git push deploy temp-branch:%deploy_branch%

:: Nettoyage
git checkout %current_branch%
git branch -d temp-branch

echo Deploiement sur la branche << %deploy_branch% >> termine avec succes.
ENDLOCAL
