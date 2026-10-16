#!/usr/bin/env bash
set -e

DATA_DIR="$HOME/.local/share/ulo_pg"
LOG_FILE="/tmp/ulo_pg.log"
PORT=5433

export PATH="/usr/lib/postgresql/18/bin:$PATH"

case "$1" in
  start)
    mkdir -p "$DATA_DIR"
    if [ ! -f "$DATA_DIR/PG_VERSION" ]; then
      echo "Initializing database cluster in $DATA_DIR..."
      initdb -D "$DATA_DIR" -U postgres -A trust
    fi
    echo "Starting PostgreSQL on port $PORT..."
    pg_ctl -D "$DATA_DIR" -l "$LOG_FILE" -o "-p $PORT -k /tmp" start || true
    pg_isready -h localhost -p $PORT
    createdb -h localhost -p $PORT -U postgres ulo 2>/dev/null || true
    echo "PostgreSQL is ready at postgresql://postgres@localhost:$PORT/ulo"
    ;;
  stop)
    echo "Stopping PostgreSQL..."
    pg_ctl -D "$DATA_DIR" stop || true
    ;;
  status)
    pg_isready -h localhost -p $PORT
    ;;
  *)
    echo "Usage: $0 {start|stop|status}"
    exit 1
    ;;
esac
