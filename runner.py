#!/usr/bin/env python3
import subprocess
import sys
import os

os.chdir('c:/dev/Pomodoro')

print("=" * 80)
print("STEP 1: Running npm install")
print("=" * 80)
result = subprocess.run('npm install', shell=True, capture_output=True, text=True, timeout=180)
print("npm install output (last 1000 chars):")
print(result.stdout[-1000:] if result.stdout else "")
if result.stderr:
    print("STDERR:", result.stderr[-500:])
print(f"RC: {result.returncode}\n")

print("=" * 80)
print("STEP 2: Running npm run build")
print("=" * 80)
result_build = subprocess.run('npm run build', shell=True, capture_output=True, text=True, timeout=180)
print("BUILD OUTPUT (last 3000 chars):")
print(result_build.stdout[-3000:] if result_build.stdout else "")
if result_build.stderr:
    print("\nBUILD STDERR (last 2000 chars):")
    print(result_build.stderr[-2000:])
print(f"RC: {result_build.returncode}\n")

print("=" * 80)
print("STEP 3: Running npm test")
print("=" * 80)
result_test = subprocess.run('npm test', shell=True, capture_output=True, text=True, timeout=180)
print("TEST OUTPUT (last 3000 chars):")
print(result_test.stdout[-3000:] if result_test.stdout else "")
if result_test.stderr:
    print("\nTEST STDERR (last 2000 chars):")
    print(result_test.stderr[-2000:])
print(f"RC: {result_test.returncode}\n")

print("=" * 80)
print("FINAL STATUS")
print("=" * 80)
print(f"Build: {'✅ PASS' if result_build.returncode == 0 else '❌ FAIL'}")
print(f"Test: {'✅ PASS' if result_test.returncode == 0 else '❌ FAIL'}")
