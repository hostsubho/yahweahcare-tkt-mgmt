#!/bin/bash
cd "$(dirname "$0")"
echo "Starting migration from neondb → yc_tms..."
node run-migrate.js
echo ""
echo "Press any key to close..."
read -n 1
