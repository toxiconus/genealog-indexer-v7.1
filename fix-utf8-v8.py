#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os

# Czytaj plik v8 z UTF-8
filepath = 'public/viewer-osd-v8.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Lista zamiany zniekształceń
replacements = [
    ('AKTĂ"W', 'AKTÓW'),
    ('maĹ‚e', 'małe'),
    ('â€–', '–'),
    ('pin-upĂłw', 'pin-upów'),
]

print("Naprawianie zniekształceń UTF-8 w v8.html...")
for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        print(f'✅ Zamieniono: "{old}" -> "{new}"')
    else:
        print(f'❌ Nie znaleziono: "{old}"')

# Zapisz plik
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ Plik zapisany w UTF-8 bez BOM')
