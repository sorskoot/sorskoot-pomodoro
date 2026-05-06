#!/bin/bash
cd /c/dev/Pomodoro
echo "=== npm install ==="
npm install 2>&1 | tail -50
echo ""
echo "=== npm run build ==="
npm run build 2>&1 | tail -100
echo ""
echo "=== npm test ==="
npm test 2>&1 | tail -100
