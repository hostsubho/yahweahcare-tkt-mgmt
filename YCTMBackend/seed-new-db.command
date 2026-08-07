#!/bin/bash
cd "$(dirname "$0")"
echo "Running schema + seed on yc_tms..."

export DATABASE_URL="postgresql://neondb_owner:npg_yGDK7rPbU1St@ep-hidden-hat-a78c5hgh-pooler.ap-southeast-2.aws.neon.tech/yc_tms?sslmode=require&channel_binding=require"

echo ""
echo "Step 1: Applying schema..."
node run-schema.js

echo ""
echo "Step 2: Seeding roles, permissions, lookup tables..."
node run-seed.js

echo ""
echo "Done! Press any key to close..."
read -n 1
