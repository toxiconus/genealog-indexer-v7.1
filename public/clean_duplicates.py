import csv
from collections import defaultdict

# Ścieżka do pliku
file_path = r"J:\projekt 2025\projekt-akta-v2\public\chrzty orginał Blinów.txt"
output_path = r"J:\projekt 2025\projekt-akta-v2\public\chrzty_cleaned.txt"

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
    
    cleaned_data = []
    for id_val, group in id_groups.items():
        if len(group) == 1:
            cleaned_data.append(group[0])
        else:
            # Sprawdź, czy wszystkie są identyczne
            if all(row == group[0] for row in group):
                # Zachowaj jedną
                cleaned_data.append(group[0])
                print(f'Usunięto {len(group)-1} identycznych duplikatów dla ID: {id_val}')
            else:
                # Dodaj końcówki
                for i, row in enumerate(group):
                    new_id = f"{id_val}{chr(97 + i)}"  # a, b, c...
                    new_row = row.copy()
                    new_row[0] = new_id
                    cleaned_data.append(new_row)
                print(f'Dodano końcówki dla {len(group)} duplikatów ID: {id_val} -> {new_id} itp.')
    
    # Zapisz do nowego pliku
    with open(output_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f, delimiter='\t')
        writer.writerow(header)
        writer.writerows(cleaned_data)
    
    print(f'Plik wyczyszczony zapisany jako: {output_path}')
    print(f'Oryginalne rekordy: {len(data)}, Po czyszczeniu: {len(cleaned_data)}')
    
except Exception as e:
    print("Błąd: " + str(e))