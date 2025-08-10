@echo off
echo Configuring Docker Credential Helper for Windows...
echo.

:: Install Docker Credential Helper for Windows
echo Installing Docker Credential Helper...
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/docker/docker-credential-helpers/releases/latest/download/docker-credential-wincred.exe' -OutFile '%ProgramFiles%\Docker\docker-credential-wincred.exe'"

:: Create Docker config with credential helper
echo Creating Docker configuration...
mkdir "%USERPROFILE%\.docker" 2>nul
(
echo {
echo   "credsStore": "wincred",
echo   "auths": {}
echo }
) > "%USERPROFILE%\.docker\config.json"

echo Docker credential helper configured!
echo You can now try the ECR login again.
pause
