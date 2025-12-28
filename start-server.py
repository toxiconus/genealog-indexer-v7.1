#!/usr/bin/env python3
"""
Genealog Indexer v3.2 - Server Launcher
Launches the Vite dev server for the genealogical document editor.
"""

import os
import sys
import subprocess
import webbrowser
import time

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print("\n" + "="*50)
    print("  Genealog Indexer v3.2 - Server")
    print("="*50 + "\n")
    
    # Check if Node.js is installed
    try:
        subprocess.run(['node', '--version'], check=True, capture_output=True)
    except (FileNotFoundError, subprocess.CalledProcessError):
        print("ERROR: Node.js is not installed!")
        print("Please install from: https://nodejs.org/")
        sys.exit(1)
    
    # Check if package.json exists
    if not os.path.exists('package.json'):
        print("ERROR: package.json not found!")
        print(f"Expected in: {script_dir}")
        sys.exit(1)
    
    # Install dependencies if needed
    if not os.path.exists('node_modules'):
        print("Installing dependencies...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', '--upgrade', 'pip'], 
                      capture_output=True)
        subprocess.run(['npm', 'install'], check=True)
        print()
    
    # Start server
    print("Starting server on http://localhost:5173/viewer-osd.html\n")
    time.sleep(1)
    
    # Open browser
    try:
        webbrowser.open('http://localhost:5173/viewer-osd.html', new=2)
    except:
        pass
    
    # Run dev server
    try:
        subprocess.run(['npm', 'run', 'dev'], check=False)
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
        sys.exit(0)

if __name__ == '__main__':
    main()
