#!/usr/bin/env bash
# ==============================================================================
# Ụlọ System - Defense Day 1-Click Shutdown Script (Linux / macOS)
# ==============================================================================
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "🛑 Stopping Ụlọ defense stack..."

# Stop Next.js if running in background
pkill -f "next dev" || true

# Stop Docker Compose containers
if command -v docker &> /dev/null; then
  docker compose down
fi

# Stop native postgres if running
if [ -f "./scripts/db.sh" ]; then
  ./scripts/db.sh stop || true
fi

echo "✅ All defense services cleanly shut down."
