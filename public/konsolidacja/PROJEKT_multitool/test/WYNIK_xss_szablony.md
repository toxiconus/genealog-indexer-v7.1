# Wynik testu XSS szablonów (przebudowa po 72b4d1f)

Test: `PROJEKT_multitool/test/test_xss_szablony.py` (Playwright, Chromium, `file://`, viewport 390 px).
Wrogie wartości w danych osadzonych w pliku: `"><img src=x onerror="window.__xss=1">` i `<script>window.__xss=1</script>`,
dopisane do wszystkich tekstów poza kluczem wiersza (nazwiska, imiona, uwagi, miejscowości, nazwy plików).
Kryteria: `window.__xss` nadal `undefined`, brak `img[src="x"]` w DOM, brak błędów JS.

## Przebudowane pliki

| Plik | Build | Wynik testu |
|---|---|---|
| `dopasowanie/dopasowanie_osob.html` (w repo, śledzony, zaktualizowany) | `dopasowanie/build.py` (bez argumentów) | XSS: nie. DOM: 0 wrogich `img`. Błędy JS: 3 na czystych danych, 6 z wstrzykniętymi (patrz niżej) |
| `narzedzia/edytor_korekt` (wynik poza repo, zgodnie z PRZEKAZANIE_1783) | `narzedzia/build.py <dst>` | OK, bez błędów |
| `haiku/weryfikacja_malzenstw` (wynik poza repo) | `haiku/build_weryfikacja_malzenstw.py SCANS OUT --bez-skanow` | OK, bez błędów. Build bez skanów: katalog skanów `J:` nieobecny (0 skanów, 15 aktów) |
| `haiku/weryfikacja_zgonow` | `haiku/build_weryfikacja.py LUBGENS.txt SKANY OUT` | NIE ZBUDOWANO: brak pliku indeksu `LUBGENS.txt` (w repo jest tylko `LUBGENS_BLINOW_KSIEGI.md`, inny format). Skrypt kończy się `FileNotFoundError`. Test nie wykonany |

## Kontrola negatywna

Ten sam test na `dopasowanie_osob.html` zbudowanym z szablonu sprzed 72b4d1f (`git show 72b4d1f^`):
`window.__xss` = number, 60 wrogich elementów `img` w DOM. Test wykrywa niezabezpieczony szablon.

## Błędy JS niezwiązane z XSS (do osobnej poprawki)

- `dopasowanie_osob.html`: kliknięcie wiersza slotu (`.srow`) w widoku urodzenia zgłasza
  `Cannot read properties of undefined (reading 'fn')`. Błąd występuje też na czystych danych z repo, więc nie wynika z testu.
  Przyczyny nie szukano.

## Uwagi

- `dopasowanie/build.py` osadza dane przez `json.dumps` bez zamiany `</` na `<\/` (narzedzia i malzenstwa to robią).
  Wartość z `</script>` w CSV zepsułaby stronę. Stwierdzone przeglądem kodu, nie testem.
- Test nie obejmuje zakładek i akcji, których dane nie są w blokach danych (np. import CSV przez interfejs).
