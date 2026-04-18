#!/bin/bash
# Script untuk membuild dan mempush image Docker ke Docker Hub
# Pastikan Anda sudah login: docker login

DOCKERHUB_USERNAME="lushien"
VERSION="1.0.0"

echo "─── Building and Pushing Ticketing Images ───"

# 1. Backend
echo "Building Backend..."
cd backend
docker build -t $DOCKERHUB_USERNAME/ticketing-backend:$VERSION .
echo "Pushing Backend..."
docker push $DOCKERHUB_USERNAME/ticketing-backend:$VERSION
cd ..

# 2. Frontend
echo "Building Frontend..."
cd frontend
docker build -t $DOCKERHUB_USERNAME/ticketing-frontend:$VERSION .
echo "Pushing Frontend..."
docker push $DOCKERHUB_USERNAME/ticketing-frontend:$VERSION
cd ..

echo "✅ Semua image berhasil di-push ke Docker Hub!"
