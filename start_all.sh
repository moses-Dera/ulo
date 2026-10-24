#!/usr/bin/env bash
# ==============================================================================
# Ụlọ System - Defense Day 1-Click Startup Script (Linux / macOS)
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "========================================================================"
echo "   🚀 STARTING ỤLỌ DEFENSE STACK (PostgreSQL + Local Stack + Next.js)   "
echo "========================================================================"

# 1. Start Database (Docker Compose if daemon running, otherwise native local PostgreSQL)
if command -v docker &> /dev/null && docker info &> /dev/null; then
  echo "📦 Step 1: Docker detected and running. Starting Database & Adminer..."
  docker compose up -d postgres adminer
  
  echo "⏳ Waiting for PostgreSQL container to become healthy..."
  until docker compose ps postgres | grep -q "(healthy)"; do
    sleep 1
  done
  echo "✅ PostgreSQL container is healthy on port 5433!"
  echo "✅ Adminer DB Viewer is available at: http://localhost:8080"
else
  echo "📦 Step 1: Starting native local PostgreSQL cluster on port 5433..."
  ./scripts/db.sh start
  echo "✅ Native PostgreSQL is active on port 5433!"
  echo "💡 Tip: You can connect to localhost:5433/ulo using DBeaver, TablePlus, or Adminer"
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
echo "  2. Landlord / Admin Login:  http://localhost:3000/auth/login"
echo "     • Super Admin:           admin@ulo.ng | SuperAdmin123!"
echo "     • Landlord (Verified):   okey.nnamdi@example.com | Landlord123!"
echo "     • Student:               chinedu.okeke@unn.edu.ng | Password123!"
echo "  3. Database Connection:     postgresql://postgres@localhost:5433/ulo"
echo "========================================================================"
echo "Starting Next.js Development Server..."
exec npm run dev
