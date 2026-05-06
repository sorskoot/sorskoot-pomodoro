import subprocess
import sys
import os

os.chdir('c:/dev/Pomodoro')

# Try npm install
print("=" * 80)
print("Running: npm install")
print("=" * 80)
try:
    result = subprocess.run(
        'npm install',
        shell=True,
        capture_output=True,
        text=True,
        timeout=180,
        cwd='c:/dev/Pomodoro'
    )
    if result.returncode == 0:
        print("✓ npm install succeeded")
    else:
        print(f"✗ npm install failed (RC: {result.returncode})")
        if result.stderr:
            print("STDERR:", result.stderr[:1000])
except Exception as e:
    print(f"Error running npm install: {e}")

# Try tsc check
print("\n" + "=" * 80)
print("Running: npm run build")
print("=" * 80)
try:
    result = subprocess.run(
        'npm run build',
        shell=True,
        capture_output=True,
        text=True,
        timeout=180,
        cwd='c:/dev/Pomodoro'
    )
    print("STDOUT (last 5000 chars):")
    print(result.stdout[-5000:] if result.stdout else "(empty)")
    if result.stderr:
        print("\nSTDERR (last 2000 chars):")
        print(result.stderr[-2000:])
    print(f"\nReturn Code: {result.returncode}")
except Exception as e:
    print(f"Error running npm run build: {e}")

# Try npm test
print("\n" + "=" * 80)
print("Running: npm test")
print("=" * 80)
try:
    result = subprocess.run(
        'npm test',
        shell=True,
        capture_output=True,
        text=True,
        timeout=180,
        cwd='c:/dev/Pomodoro'
    )
    print("STDOUT (last 5000 chars):")
    print(result.stdout[-5000:] if result.stdout else "(empty)")
    if result.stderr:
        print("\nSTDERR (last 2000 chars):")
        print(result.stderr[-2000:])
    print(f"\nReturn Code: {result.returncode}")
except Exception as e:
    print(f"Error running npm test: {e}")
