@echo off
setlocal
cd /d E:\Work\BetReports\backend

if exist .env ren .env .env.localdev

railway up

if exist .env.localdev ren .env.localdev .env

echo Backend deployed.
