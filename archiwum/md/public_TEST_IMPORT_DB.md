# 🎯 Przewodnik Testowania v8.20.1 - Import Bazy Danych

## Szybki Start

### 1. Uruchom aplikację
- Otwórz `viewer-osd-v8.20.html` w przeglądarce (HTTP serwer wymagany!)
- Lub użyj: `python -m http.server 8000` w folderze `public/`

### 2. Załaduj testową bazę
1. W aplikacji kliknij przycisk **"Importuj DB"** w toolbar (obok "JSON")
2. Wybierz plik `test_database.csv`
3. Poczekaj na załadowanie (powinien być komunikat ✅)

### 3. Sprawdź wyniki
- Tabela powinna zawierać 7 wierszy
- 3 z nich będą z **żółtym tłem** (duplikaty ID "CH.LUB.BLIN.1783.001")
- Hover nad żółtym wierszem pokaże tooltip: "⚠️ Duplikat! Jest 3 rekordów z ID: CH.LUB.BLIN.1783.001"

### 4. Edytuj duplikat
1. Kliknij na żółty wiersz
2. W prawym panelu pojawi się formularz edycji
3. Zmień np. "Uwagi" na coś innego
4. Kliknij "Zapisz"
5. Rekord zostanie zaktualizowany (status zmieni się na "edited")
6. Tabela się odświeży

### 5. Usuń rekord
1. Kliknij 🗑️ na końcu wiersza, lub
2. Zaznacz checkbox i kliknij "Usuń" w tabeli

## Test Przypadki

### TC1: Import CSV
✅ **Expected**: 7 rekordów w tabeli
- Kolumny: ID, ROK, Nr., Nazwisko, Imię, Miejscowość, ImięO, NazwiskoO, wO, IM, NM, wM, uwagi, UWAGI ORG, Akcje

### TC2: Wykrywanie duplikatów
✅ **Expected**: Wiersze 1, 2, 7 mają żółte tło (ID = "CH.LUB.BLIN.1783.001")
- Licznik duplikatów: 3

### TC3: Edycja duplikatu
1. Kliknij wiersz 1
2. Zmień "Uwagi" z "Chrzest w parafii" na "Edytowany rekord"
3. Kliknij "Zapisz"
4. ✅ **Expected**: Komunikat "✅ Rekord zaktualizowany" + tabela się odświeży

### TC4: Usuwanie
1. Kliknij 🗑️ na wierszu 7
2. ✅ **Expected**: Wiersz znika, zostaje 6 rekordów

### TC5: Import JSON
1. Stwórz plik `test_database.json`:
```json
[
  {"id": "CH.LUB.BLIN.1783.006", "rok": "1783", "nr": "6", "nazwisko": "Test", "imie": "User", "miejscowosc": "Blinów", "imieO": "", "nazwiskoO": "", "wO": "", "im": "", "nm": "", "wM": "", "uwagi": "Test JSON", "uwagiOrg": ""},
  {"id": "CH.LUB.BLIN.1783.007", "rok": "1783", "nr": "7", "nazwisko": "Another", "imie": "Person", "miejscowosc": "Lublin", "imieO": "", "nazwiskoO": "", "wO": "", "im": "", "nm": "", "wM": "", "uwagi": "Another test", "uwagiOrg": ""}
]
```
2. Kliknij "Importuj DB" → wybierz JSON
3. ✅ **Expected**: 2 nowe rekordy dodane (razem 8, jeśli przywrócisz wiersz 7)

## Znane Ograniczenia

1. **Mapowanie kolumn CSV** - najlepiej używać tab-separated values (TSV), nie CSV
2. **Unicode** - pewnie obsługiwane, ale testuj na polskich znakach
3. **Duplikaty** - pokazują się jako żółte tło, ale można je edytować niezależnie
4. **LocalStorage** - dane przechowywane w przeglądarce (brak synchronizacji między urządzeniami)

## Troubleshooting

### Problem: "Baza danych nie jest zainicjowana"
- **Rozwiązanie**: Poczekaj na załadowanie strony (aż zniknie loading overlay)

### Problem: CSV nie paruje prawidłowo
- **Rozwiązanie**: Upewnij się że kolumny są oddzielone TABEM, nie spacją
- Użyj: `ID\tROK\tNr.\t...` (backslash-t = TAB)

### Problem: Dane nie pojawiają się w tabeli
- **Rozwiązanie**: 
  - Otwórz DevTools (F12)
  - Sprawdź Console pod kątem błędów
  - Szukaj komunikatów "✅ Zaimportowano X rekordów"

### Problem: Edycja nie zapisuje
- **Rozwiązanie**: Upewnij się że klikasz "Zapisz" a nie "Anuluj"
- Sprawdź Console czy nie ma błędów

## Dalsze Usprawnienia

### ToDo na później:
- [ ] Eksport rekordów "edited" do CSV
- [ ] Merge duplikatów (scal pola)
- [ ] Historia zmian (kto/kiedy edytował)
- [ ] Walidacja danych (wymagane pola)
- [ ] Batch operacje (usuń wszystkie duplikaty, zmień pole dla wielu rekordów)
- [ ] Paginacja lepsze (teraz tylko do 100 aktów naraz)

## Powiązane pliki

- `viewer-osd-v8.20.html` - główna aplikacja
- `test_database.csv` - testowy plik CSV
- `IMPORT_DATABASE_v8.20.1.md` - dokumentacja techniczna
