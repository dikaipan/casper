#!/bin/bash

# Import SQL dump to PostgreSQL database
# Usage: ./import-from-sql.sh path/to/dump.sql

if [ -z "$1" ]; then
  echo "❌ Error: Please provide SQL file path"
  echo "Usage: ./import-from-sql.sh path/to/dump.sql"
  exit 1
fi

SQL_FILE="$1"

if [ ! -f "$SQL_FILE" ]; then
  echo "❌ Error: File not found: $SQL_FILE"
  exit 1
fi

echo "🔄 Importing SQL dump..."
echo "📁 File: $SQL_FILE"
echo ""

# Load database URL from .env
source .env

# Import SQL file
psql "$DATABASE_URL" < "$SQL_FILE"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ SQL import completed successfully!"
else
  echo ""
  echo "❌ SQL import failed!"
  exit 1
fi

