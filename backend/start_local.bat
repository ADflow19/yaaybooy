@echo off
echo === Yaaybooy Backend - Lancement local (Python 3.12) ===
echo.
cd /d "%~dp0"

REM Utiliser Python 3.12 explicitement
py -3.12 --version
if errorlevel 1 (
    echo ERREUR: Python 3.12 non trouve
    pause
    exit /b 1
)

REM Supprimer l'ancien venv si present
if exist ".venv" rmdir /s /q .venv

echo [1/4] Creation de l'environnement virtuel Python 3.12...
py -3.12 -m venv .venv
if errorlevel 1 ( echo ERREUR: creation venv & pause & exit /b 1 )

echo [2/4] Activation...
call .venv\Scripts\activate.bat

echo [3/4] Installation des dependances...
python -m pip install --upgrade pip --quiet
pip install -r requirements.txt
if errorlevel 1 ( echo ERREUR: dependances & pause & exit /b 1 )

echo [4/4] Migrations Alembic...
python -m alembic upgrade head
if errorlevel 1 (
    echo ERREUR: migrations - verifie que la base yaaybooy existe dans pgAdmin
    pause
    exit /b 1
)

echo.
echo === Serveur : http://localhost:8000      ===
echo === Docs    : http://localhost:8000/docs ===
echo === CTRL+C pour arreter                 ===
echo.
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
