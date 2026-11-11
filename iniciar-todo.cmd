@echo off
chcp 65001 >nul
title Iniciar todo - Instituto de Merida + FortunaBet
set "LOTERIA=C:\Users\Jesus\Desktop\Proyectos con Claude\Loteria"
set "WALLET=C:\Users\Jesus\Desktop\Proyectos con Claude\WalletLoteria"
set "INSTITUTO=%~dp0"

echo.
echo  Iniciando FortunaBet, Wallet de Agencias e Instituto de Merida...
echo.

rem 1) Docker (base de datos de FortunaBet)
docker info >nul 2>&1
if not errorlevel 1 goto docker_listo
echo  Abriendo Docker Desktop, espera un momento...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
:esperar_docker
timeout /t 3 /nobreak >nul
docker info >nul 2>&1
if errorlevel 1 goto esperar_docker
:docker_listo
echo  Docker listo.

rem 2) FortunaBet: API :3000 y web :5173
start "FortunaBet (Loteria) - no cerrar" /D "%LOTERIA%" cmd /k npm.cmd run dev
echo  Esperando a FortunaBet...
:esperar_fortuna
timeout /t 2 /nobreak >nul
curl -s -o nul http://localhost:3000/api/v1/ 2>nul
if errorlevel 1 goto esperar_fortuna

rem 3) Wallet de Agencias :5174
start "Wallet de Agencias - no cerrar" /D "%WALLET%" cmd /k npm.cmd run dev

rem 4) Instituto de Merida :5180 (web + portal)
start "Instituto de Merida - no cerrar" /D "%INSTITUTO%" cmd /k npm.cmd run iniciar

timeout /t 6 /nobreak >nul
start "" http://localhost:5180/agencias-online

echo.
echo  Listo:
echo    Instituto de Merida ........ http://localhost:5180
echo    Agencias online ............ http://localhost:5180/agencias-online
echo    FortunaBet ................. http://localhost:5173
echo    Wallet de Agencias ......... http://localhost:5174
echo.
echo  Para apagar: Ctrl + C en cada ventana.
echo.
pause
