#!/bin/bash
# AWS Deployment Script for OnlineJudge

set -e

# Configuration
AWS_REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO_PREFIX="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
CLUSTER_NAME="onlinejudge-cluster"
SERVICE_PREFIX="onlinejudge"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting AWS deployment for OnlineJudge...${NC}"

# Login to ECR
echo -e "${YELLOW}Logging into ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO_PREFIX}

# Create ECR repositories if they don't exist
echo -e "${YELLOW}Creating ECR repositories...${NC}"
aws ecr describe-repositories --repository-names onlinejudge-backend --region ${AWS_REGION} || \
  aws ecr create-repository --repository-name onlinejudge-backend --region ${AWS_REGION}

aws ecr describe-repositories --repository-names onlinejudge-compiler --region ${AWS_REGION} || \
  aws ecr create-repository --repository-name onlinejudge-compiler --region ${AWS_REGION}

aws ecr describe-repositories --repository-names onlinejudge-frontend --region ${AWS_REGION} || \
  aws ecr create-repository --repository-name onlinejudge-frontend --region ${AWS_REGION}

# Build production images
echo -e "${YELLOW}Building production Docker images...${NC}"
docker build -t onlinejudge-backend:latest -f Dockerfile.aws .
docker build -t onlinejudge-compiler:latest -f Compiler/Dockerfile.aws ./Compiler
docker build -t onlinejudge-frontend:latest -f Frontend/Dockerfile.aws ./Frontend

# Tag images for ECR
echo -e "${YELLOW}Tagging images for ECR...${NC}"
docker tag onlinejudge-backend:latest ${ECR_REPO_PREFIX}/onlinejudge-backend:latest
docker tag onlinejudge-compiler:latest ${ECR_REPO_PREFIX}/onlinejudge-compiler:latest
docker tag onlinejudge-frontend:latest ${ECR_REPO_PREFIX}/onlinejudge-frontend:latest

# Push images to ECR
echo -e "${YELLOW}Pushing images to ECR...${NC}"
docker push ${ECR_REPO_PREFIX}/onlinejudge-backend:latest
docker push ${ECR_REPO_PREFIX}/onlinejudge-compiler:latest
docker push ${ECR_REPO_PREFIX}/onlinejudge-frontend:latest

# Create ECS cluster if it doesn't exist
echo -e "${YELLOW}Creating ECS cluster...${NC}"
aws ecs describe-clusters --clusters ${CLUSTER_NAME} --region ${AWS_REGION} | grep -q "ACTIVE" || \
  aws ecs create-cluster --cluster-name ${CLUSTER_NAME} --region ${AWS_REGION}

# Register task definition
echo -e "${YELLOW}Registering ECS task definition...${NC}"
# Replace placeholders in task definition
sed -e "s/ACCOUNT_ID/${ACCOUNT_ID}/g" \
    -e "s/REGION/${AWS_REGION}/g" \
    aws-deployment/ecs-task-definition.json > /tmp/task-definition.json

aws ecs register-task-definition --cli-input-json file:///tmp/task-definition.json --region ${AWS_REGION}

# Create or update services
echo -e "${YELLOW}Creating ECS services...${NC}"
aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_PREFIX}-backend --region ${AWS_REGION} || \
  aws ecs create-service \
    --cluster ${CLUSTER_NAME} \
    --service-name ${SERVICE_PREFIX}-backend \
    --task-definition onlinejudge-task \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}" \
    --region ${AWS_REGION}

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Your OnlineJudge application is now running on AWS ECS${NC}"
