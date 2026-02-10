#!/bin/bash

# Script สำหรับติดตั้ง Git hooks
# รันด้วย: bash scripts/setup-hooks.sh

echo "🔧 Setting up Git hooks..."

# ตั้งค่า Git ให้ใช้ .githooks แทน .git/hooks
git config core.hooksPath .githooks

# ทำให้ hooks สามารถรันได้
chmod +x .githooks/*

echo "✅ Git hooks installed successfully!"
echo ""
echo "ℹ️  Hooks installed:"
echo "  - post-merge: Auto-run migrations after git pull"
echo ""
echo "🎉 Done! The hooks will now run automatically."
