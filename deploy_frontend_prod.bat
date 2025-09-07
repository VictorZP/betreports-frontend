@echo off
setlocal
cd /d E:\Work\BetReports\frontend

REM временно убираем локальный env из сборки
if exist .env.local ren .env.local .env.local.localdev

REM деплой фронта
railway up

REM возвращаем локальный env обратно
if exist .env.local.localdev ren .env.local.localdev .env.local

echo Frontend deployed.
