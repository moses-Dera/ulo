#!/usr/bin/env bash
# ==============================================================================
# Ụlọ System - Defense Day 1-Click Startup Script (Linux / macOS)
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "========================================================================"
echo "   🚀 STARTING ỤLỌ DEFENSE STACK (PostgreSQL + Adminer + Next.js)       "
echo "========================================================================"

# 1. Check Docker status
if ! command -v docker &> /dev/null; then
  echo "❌ Error: Docker is not installed or not in PATH."
  echo "Fallback: Checking if native local DB can start..."
  ./scripts/db.sh start
else
  echo "📦 Step 1: Starting Database & Adminer via Docker Compose..."
  docker compose up -d postgres adminer
  
  echo "⏳ Waiting for PostgreSQL to become healthy..."
  until docker compose ps postgres | grep -q "(healthy)"; do
    sleep 1
  done
  echo "✅ PostgreSQL is healthy and accepting connections on port 5433!"
  echo "✅ Adminer DB Viewer is available at: http://localhost:8080"
fi

# 2. Check and push database migrations / schema
echo "📦 Step 2: Synchronizing Database Schema..."
npm run db:push || true

# 3. Seed fresh test data if needed
echo "🌱 Step 3: Seeding Demonstration Accounts & UNN Hostels..."
npm run db:seed || true

# 4. Launch Next.js Application
echo "========================================================================"
echo "🎯 PRE-DEFENSE SYSTEM STATUS: READY"
echo "------------------------------------------------------------------------"
echo "  1. Student / Public Portal: http://localhost:3000"
echo "  2. Landlord / Admin Portal: http://localhost:3000/auth/login"
echo "  3. Adminer Live DB Viewer:  http://localhost:8080"
echo "========================================================================"
echo "Starting Next.js Development Server..."
exec npm run dev
