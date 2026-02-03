import csv
from collections import defaultdict

# Ścieżka do pliku
file_path = r"J:\projekt 2025\projekt-akta-v2\public\chrzty orginał Blinów.txt"
output_path = r"J:\projekt 2025\projekt-akta-v2\public\duplikaty_only.txt"

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter='\t')
        rows = [row for row in reader if row]
    
    header = rows[0]
    data = rows[1:]
    
    # Grupuj po ID
    id_groups = defaultdict(list)
    for row in data:
        id_groups[row[0]].append(row)
    
    duplicates_data = []
    for id_val, group in id_groups.items():
        if len(group) > 1:
            duplicates_data.extend(group)  # Dodaj wszystkie wersje duplikatów
    
    # Zapisz tylko duplikaty do nowego pliku
    with open(output_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f, delimiter='\t')
        writer.writerow(header)
        writer.writerows(duplicates_data)
    
    print("Plik z tylko duplikatami zapisany jako: " + output_path)
    print("Liczba linii z duplikatami: " + str(len(duplicates_data)))
    
except Exception as e:
    print("Błąd: " + str(e))