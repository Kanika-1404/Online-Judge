@echo off
echo Fixing AWS ECR Login Issues for Windows...
echo ==========================================
echo.

:: Check for admin privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Please run this script as Administrator!
    pause
    exit /b 1
)

:: Reset Docker credentials
echo Resetting Docker credentials...
docker logout public.ecr.aws 2>nul
docker logout public.ecr.aws/y4h4k1u2 2>nul

:: Backup and reset Docker config
if exist "%USERPROFILE%\.docker\config.json" (
    echo Backing up Docker config...
    copy "%USERPROFILE%\.docker\config.json" "%USERPROFILE%\.docker\config.json.backup"
    del "%USERPROFILE%\.docker\config.json"
)

:: Reset Docker credential store
echo Resetting Docker credential store...
docker context use default 2>nul

:: Use alternative authentication method
echo Attempting ECR login with alternative method...
set AWS_REGION=us-east-1
aws ecr-public get-login-password --region %AWS_REGION% > %TEMP%\ecr-token.txt
docker login --username AWS --password-stdin public.ecr.aws/y4h4k1u2 < %TEMP%\ecr-token.txt
del %TEMP%\ecr-token.txt

:: Verify login
echo Verifying login...
docker pull public.ecr.aws/y4h4k1u2/hello-world:latest 2>nul
if %errorlevel% neq 0 (
    echo Login verification failed. Trying manual method...
    echo.
    echo Manual steps:
    echo 1. Run: aws ecr-public get-login-password --region us-east-1
    echo 2. Copy the output
    echo 3. Run: docker login --username AWS --password-stdin public.ecr.aws/y4h4k1u2
    echo 4. Paste the token when prompted
) else (
    echo ECR login successful!
)

pause
