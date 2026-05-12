@echo off
REM Windows: you cannot run "mongo:ping" alone in PowerShell — it is an npm script, not an .exe.
REM Double-click this file, or from this folder run:  mongo-ping.cmd
cd /d "%~dp0"
call npm run mongo-ping-cli
exit /b %ERRORLEVEL%
