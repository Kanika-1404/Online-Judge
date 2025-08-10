@echo off
echo Setting up AWS CLI for Windows...
echo.

:: Check if AWS CLI is installed
aws --version >nul 2>&1
if %errorlevel% neq 0 (
    echo AWS CLI not found. Installing...
    
    :: Download AWS CLI installer
    echo Downloading AWS CLI...
    powershell -Command "Invoke-WebRequest -Uri 'https://awscli.amazonaws.com/AWSCLIV2.msi' -OutFile 'AWSCLIV2.msi'"
    
    :: Install AWS CLI
    echo Installing AWS CLI...
    msiexec.exe /i AWSCLIV2.msi /quiet
    
    :: Wait for installation to complete
    timeout /t 30
    
    :: Refresh PATH
    setx PATH "%PATH%;C:\Program Files\Amazon\AWSCLIV2\bin"
    
    echo AWS CLI installed successfully!
    echo Please restart your command prompt or terminal.
) else (
    echo AWS CLI is already installed.
)

:: Verify installation
aws --version
if %errorlevel% neq 0 (
    echo AWS CLI installation verification failed.
    echo Please restart your computer and try again.
) else (
    echo AWS CLI is ready to use!
)

pause
