# Baza zgonów 1797–1945 (baza_zgonow_1797-1945.html)
Jedna aplikacja weryfikacji: silnik v3 (`weryfikacja_szablon_v3.html`) + dane wszystkich lat. Budowa: `python3 buduj_baza_v4.py`.
Dane wejściowe: `dane/zgony_1935_mini.html`, `dane/zgony_1943-45_mini.html`, `weryfikacja_zgonow_ASC_1870-79.html` (odczyty ASC), `../zgony.csv` (indeks), `../haiku/ODCZYTY/*_dom_przyczyny.csv` (odczyty ręczne: dom, przyczyna, rodzice).
Nowy odczyt = nowy plik `*_dom_przyczyny.csv` w `haiku/ODCZYTY/` i przebudowa. Nawigacja: stulecie → dekada → rok → akt; „Tylko ze skanem"; skany z dysku J: lub wbudowane.
