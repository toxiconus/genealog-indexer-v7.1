import csv
from collections import Counter, defaultdict

# Ścieżka do pliku
file_path = r"J:\projekt 2025\projekt-akta-v2\public\chrzty orginał Blinów.txt"

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter='\t')
        rows = [row for row in reader if row]
    
    # Nagłówek
    header = rows[0]
    data = rows[1:]
    
    # Grupuj po ID
    id_groups = defaultdict(list)
    for row in data:
        id_groups[row[0]].append(row)
    
    # Znajdź duplikaty
    duplicates = {id: rows for id, rows in id_groups.items() if len(rows) > 1}
    
    if duplicates:
        print('Znaleziono duplikaty w kolumnie ID:')
        for id, rows in duplicates.items():
            print(f'\nID: {id} (występuje {len(rows)} razy)')
            for i, row in enumerate(rows, 1):
                print(f'  Wersja {i}: {row}')
    else:
        print('Brak duplikatów w pierwszej kolumnie ID.')
        
    print(f'\nŁącznie przetworzono {len(data)} rekordów.')
    
except FileNotFoundError:
    print(f'Nie znaleziono pliku: {file_path}')
except Exception as e:
    print(f'Błąd: {e}')