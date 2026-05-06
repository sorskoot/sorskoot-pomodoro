#!/usr/bin/env python3
import subprocess
import sys
import os

os.chdir('c:/dev/Pomodoro')

print("=" * 80)
print("STEP 1: Running npm install (if needed)")
print("=" * 80)
result = subprocess.run(['npm', 'install'], shell=True, capture_output=True, text=True, timeout=120)
if result.returncode != 0:
    print("npm install STDERR:", result.stderr[-1000:])
else:
    print("npm install completed successfully")

print("\n" + "=" * 80)
print("STEP 2: Running npm run build")
print("=" * 80)
result_build = subprocess.run(['npm', 'run', 'build'], shell=True, capture_output=True, text=True, timeout=180)
print("BUILD STDOUT (last 3000 chars):")
print(result_build.stdout[-3000:] if len(result_build.stdout) > 3000 else result_build.stdout)
if result_build.stderr:
    print("\nBUILD STDERR (last 2000 chars):")
    print(result_build.stderr[-2000:] if len(result_build.stderr) > 2000 else result_build.stderr)
print(f"\nBuild Return Code: {result_build.returncode}")

print("\n" + "=" * 80)
print("STEP 3: Running npm test")
print("=" * 80)
result_test = subprocess.run(['npm', 'test'], shell=True, capture_output=True, text=True, timeout=180)
print("TEST STDOUT (last 3000 chars):")
print(result_test.stdout[-3000:] if len(result_test.stdout) > 3000 else result_test.stdout)
if result_test.stderr:
    print("\nTEST STDERR (last 2000 chars):")
    print(result_test.stderr[-2000:] if len(result_test.stderr) > 2000 else result_test.stderr)
print(f"\nTest Return Code: {result_test.returncode}")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Build Status: {'✅ PASSED' if result_build.returncode == 0 else '❌ FAILED'}")
print(f"Test Status: {'✅ PASSED' if result_test.returncode == 0 else '❌ FAILED'}")

sys.exit(max(result_build.returncode, result_test.returncode))
