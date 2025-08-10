@echo off
echo OnlineJudge AWS Deployment for Windows
echo ======================================
echo.

:: Check if AWS CLI is installed
aws --version >nul 2>&1
if %errorlevel% neq 0 (
    echo AWS CLI not found. Please run windows-setup.bat first.
    pause
    exit /b 1
)

:: Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker not found. Please install Docker Desktop for Windows.
    pause
    exit /b 1
)

:: Set variables
set AWS_REGION=us-east-1
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set ACCOUNT_ID=%%i
set ECR_REPO_PREFIX=%ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com

echo AWS Account: %ACCOUNT_ID%
echo Region: %AWS_REGION%
echo.

:: Login to ECR
echo Logging into ECR...
aws ecr get-login-password --region %AWS_REGION% | docker login --username AWS --password-stdin %ECR_REPO_PREFIX%

:: Create ECR repositories
echo Creating ECR repositories...
aws ecr describe-repositories --repository-names onlinejudge-backend --region %AWS_REGION% >nul 2>&1 || aws ecr create-repository --repository-name onlinejudge-backend --region %AWS_REGION%
aws ecr describe-repositories --repository-names onlinejudge-compiler --region %AWS_REGION% >nul 2>&1 || aws ecr create-repository --repository-name onlinejudge-compiler --region %AWS_REGION%
aws ecr describe-repositories --repository-names onlinejudge-frontend --region %AWS_REGION% >nul 2>&1 || aws ecr create-repository --repository-name onlinejudge-frontend --region %AWS_REGION%

:: Build production images
echo Building production Docker images...
docker build -t onlinejudge-backend:latest -f Dockerfile.aws .
docker build -t onlinejudge-compiler:latest -f Compiler/Dockerfile.aws ./Compiler
docker build -t onlinejudge-frontend:latest -f Frontend/Dockerfile.aws ./Frontend

:: Tag images for ECR
echo Tagging images for ECR...
docker tag onlinejudge-backend:latest %ECR_REPO_PREFIX%/onlinejudge-backend:latest
docker tag onlinejudge-compiler:latest %ECR_REPO_PREFIX%/onlinejudge-compiler:latest
docker tag onlinejudge-frontend:latest %ECR_REPO_PREFIX%/onlinejudge-frontend:latest

:: Push images to ECR
echo Pushing images to ECR...
docker push %ECR_REPO_PREFIX%/onlinejudge-backend:latest
docker push %ECR_REPO_PREFIX%/onlinejudge-compiler:latest
docker push %ECR_REPO_PREFIX%/onlinejudge-frontend:latest

:: Create ECS cluster
echo Creating ECS cluster...
aws ecs describe-clusters --clusters onlinejudge-cluster --region %AWS_REGION% | findstr "ACTIVE" >nul 2>&1 || aws ecs create-cluster --cluster-name onlinejudge-cluster --region %AWS_REGION%

:: Register task definition
echo Registering ECS task definition...
powershell -Command "(Get-Content aws-deployment\ecs-task-definition.json) -replace 'ACCOUNT_ID', '%ACCOUNT_ID%' -replace 'REGION', '%AWS_REGION%' | Set-Content aws-deployment\task-definition.json"
aws ecs register-task-definition --cli-input-json file://aws-deployment/task-definition.json --region %AWS_REGION%

echo.
echo ======================================
echo Deployment completed successfully!
echo.
echo Next steps:
echo 1. Update aws-deployment\.env.production with your MongoDB Atlas URI
echo 2. Run: aws configure (to set up AWS credentials)
echo 3. Run: aws-deployment\windows-deploy.bat (to deploy)
echo ======================================
pause
