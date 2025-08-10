# OnlineJudge AWS Deployment Guide

## 🚀 Quick Start for Windows Users

### Step 1: Install AWS CLI
```cmd
# Run this batch file to install AWS CLI
aws-deployment\windows-setup.bat
```

### Step 2: Configure AWS Credentials
```cmd
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your region (us-east-1)
# Enter output format (json)
```

### Step 3: Update Environment Variables
Edit `aws-deployment\.env.production` and update:
- `MONGODB_URI` with your MongoDB Atlas connection string
- `JWT_SECRET` with a secure random string

### Step 4: Deploy to AWS
```cmd
aws-deployment\windows-deploy.bat
```

## 📋 Prerequisites

### Required Software:
- **AWS CLI** - Download from [AWS CLI Installer](https://aws.amazon.com/cli/)
- **Docker Desktop** - Download from [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **AWS Account** - Sign up at [AWS Console](https://aws.amazon.com/console/)

### AWS Permissions Needed:
- AmazonEC2ContainerRegistryFullAccess
- AmazonECS_FullAccess
- AmazonVPCFullAccess
- IAMFullAccess
- CloudWatchFullAccess

## 🔧 Manual Installation (Alternative)

### Install AWS CLI Manually:
1. Download AWS CLI MSI installer: https://awscli.amazonaws.com/AWSCLIV2.msi
2. Run the installer as Administrator
3. Restart your command prompt
4. Verify installation: `aws --version`

### Install Docker Desktop:
1. Download from https://www.docker.com/products/docker-desktop
2. Run the installer
3. Restart your computer
4. Verify installation: `docker --version`

## 🎯 Deployment Commands

### Build and Push Images:
```cmd
# Build production images
docker build -t onlinejudge-backend:latest -f Dockerfile.aws .
docker build -t onlinejudge-compiler:latest -f Compiler/Dockerfile.aws ./Compiler
docker build -t onlinejudge-frontend:latest -f Frontend/Dockerfile.aws ./Frontend

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [ACCOUNT-ID].dkr.ecr.us-east-1.amazonaws.com
docker push [ACCOUNT-ID].dkr.ecr.us-east-1.amazonaws.com/onlinejudge-backend:latest
```

## 🐛 Troubleshooting

### AWS CLI Not Found:
1. Restart your command prompt after installation
2. Check PATH: `echo %PATH%`
3. Reinstall using windows-setup.bat

### Docker Issues:
1. Ensure Docker Desktop is running
2. Check Docker daemon: `docker info`
3. Restart Docker Desktop if needed

### Permission Errors:
1. Ensure AWS credentials are configured
2. Check IAM permissions
3. Verify region settings

## 📞 Support
For issues, check:
- AWS CLI documentation: https://docs.aws.amazon.com/cli/
- Docker documentation: https://docs.docker.com/
- AWS ECS documentation: https://docs.aws.amazon.com/ecs/
