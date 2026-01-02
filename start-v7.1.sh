#!/bin/bash
# ============================================
# Genealog Indexer v7.1 - Akt Mode Launcher
# For WSL/Linux/Mac
# ============================================

echo "============================================"
echo "  Genealog Indexer v7.1 - Akt Mode"
echo "  Enhanced Ergonomic Act Processing"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Navigate to project directory
cd "$(dirname "$0")"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found!"
    echo "This file should be in: $(pwd)"
    exit 1
fi

# Check if node_modules exists, if not - install
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

echo "============================================"
echo "Starting Genealog Indexer v7.1..."
echo "============================================"
echo ""
echo "Features:"
echo "  • Card-style act buttons (fishy design)"
echo "  • Arrow key navigation (Left/Right)"
echo "  • Clean act-focused workflow"
echo "  • Heavy-Duty postprocessing preset"
echo ""
echo "Opening: http://localhost:5173/viewer-osd-v8.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo "============================================"
echo ""

npm run dev
