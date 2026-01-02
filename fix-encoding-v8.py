#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os

# Czytaj plik
with open('public/viewer-osd-v8.html', 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Lista zamiany skorupowanych znaków
replacements = {
    'đź"´': '🔴',          # Red status
    'đźźˇ': '🟡',          # Yellow status  
    'đźź˘': '🟢',          # Green status
    'đź\'ˇ': '💡',        # Light bulb
    'đź"\'': '🔒',         # Lock
    'â­': '⭐',            # Star
    'â€\"': '–',           # Em dash
    'bieĹĽÄ…cego': 'bieżącego',  # Polish word
}

print("=" * 60)
print("NAPRAWA KODOWANIA viewer-osd-v8.html")
print("=" * 60)

total_replacements = 0

# Wykonaj zamiany
for old, new in replacements.items():
    count = content.count(old)
    if count > 0:
        print(f"✓ Znaleziono {count}x: {repr(old)} → {repr(new)}")
        content = content.replace(old, new)
        total_replacements += count

# Zapisz plik UTF-8
with open('public/viewer-osd-v8.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("=" * 60)
print(f"✅ Plik naprawiony! Łącznie zamieniono: {total_replacements} znaków")
print("=" * 60)
