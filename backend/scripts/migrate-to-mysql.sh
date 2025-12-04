#!/bin/bash
# Bash Script untuk Migrasi ke MySQL
# Usage: ./migrate-to-mysql.sh

echo "🚀 Starting MySQL Migration Process..."

# Step 1: Backup PostgreSQL Schema
echo ""
echo "📦 Step 1: Backing up PostgreSQL schema..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
if [ -f "prisma/schema.prisma" ]; then
    cp prisma/schema.prisma "prisma/schema.postgresql.backup_$TIMESTAMP"
    echo "✅ Schema backed up to: schema.postgresql.backup_$TIMESTAMP"
else
    echo "⚠️  Could not backup schema (file might not exist)"
fi

# Step 2: Check if schema.mysql.prisma exists
echo ""
echo "🔍 Step 2: Checking for MySQL schema..."
if [ -f "prisma/schema.mysql.prisma" ]; then
    echo "✅ MySQL schema found!"
else
    echo "❌ schema.mysql.prisma not found! Please create it first."
    exit 1
fi

# Step 3: Check .env file
echo ""
echo "🔍 Step 3: Checking .env file..."
if [ -f ".env" ]; then
    if grep -q "DATABASE_URL.*mysql" .env; then
        echo "✅ MySQL DATABASE_URL found in .env"
    else
        echo "⚠️  DATABASE_URL doesn't seem to be MySQL. Please update .env file."
        echo "   Expected format: DATABASE_URL='mysql://user:password@host:3306/database'"
    fi
else
    echo "⚠️  .env file not found. Please create it with DATABASE_URL."
fi

# Step 4: Generate Prisma Client
echo ""
echo "🔧 Step 4: Generating Prisma Client for MySQL..."
cd prisma
npx prisma generate --schema=schema.mysql.prisma
if [ $? -eq 0 ]; then
    echo "✅ Prisma Client generated successfully!"
else
    echo "❌ Failed to generate Prisma Client"
    cd ..
    exit 1
fi
cd ..

# Step 5: Create Migration
echo ""
echo "📝 Step 5: Creating MySQL migration..."
echo "   This will create all tables in MySQL database."
read -p "   Continue? (Y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled by user"
    exit 0
fi

npx prisma migrate dev --name init_mysql --schema=prisma/schema.mysql.prisma
if [ $? -eq 0 ]; then
    echo "✅ Migration created successfully!"
else
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi

# Step 6: Check if seed exists
echo ""
echo "🌱 Step 6: Checking for seed script..."
if [ -f "prisma/seed.ts" ]; then
    read -p "   Seed script found. Run it now? (Y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "   Running seed script..."
        npx ts-node prisma/seed.ts
        if [ $? -eq 0 ]; then
            echo "✅ Seed completed successfully!"
        else
            echo "⚠️  Seed completed with errors. Please check."
        fi
    fi
else
    echo "ℹ️  No seed script found. Skipping..."
fi

# Summary
echo ""
echo "============================================================"
echo "✅ Migration Process Completed!"
echo "============================================================"
echo ""
echo "Next steps:"
echo "1. Test your backend: npm run start:dev"
echo "2. Test API endpoints to ensure everything works"
echo "3. If everything is OK, you can switch to MySQL permanently"
echo ""
echo "To rollback to PostgreSQL:"
echo "1. Restore schema: cp prisma/schema.postgresql.backup_$TIMESTAMP prisma/schema.prisma"
echo "2. Update DATABASE_URL in .env to PostgreSQL"
echo "3. Run: npx prisma generate"

