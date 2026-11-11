# Zadanie dla Haiku: odczyt aktów małżeństw Blinów 1945, nr 13–22

Skany: `/mnt/user-data/uploads/1944-1945 USC Szastarka/010.jpg` … `018.jpg` (rozkładówki; lewa i prawa strona to osobne akty). Akty 1–12 są już w bazie – nie czytaj ich.
Strona 14 księgi (plik 018) ma akty 21 i 22. Strona 10 (plik 010) ma akty 13 i 14. Niektóre strony są sfotografowane kilka razy (np. z odchyloną kartką albo wklejonym odpisem) – dla każdego aktu użyj najczytelniejszego zdjęcia, nie dubluj aktów. Plik 019 to protokół i rejestr alfabetyczny 1945 – użyj go do sprawdzenia nazwisk i numerów (rejestr: nazwisko młodego i imię z nazwiskiem panny, numer aktu).

## Wzór
Plik `MALZENSTWA_1945_wzor_akt13_claude.csv` to akt 13 odczytany przez Claude – zachowaj dokładnie ten układ kolumn (48 kolumn, separator `;`, UTF-8 z BOM, nagłówek jak we wzorze) i ten sposób wypełniania.

## Zasady
- Każdy akt = jeden wiersz, `id` = `ai1-m1945-0NN`, `marriage_year`=1945.
- Liczby i daty cyframi (data `RRRR-MM-DD`, godzina i wiek samą liczbą, bez jednostek).
- Imiona w dzisiejszej polskiej pisowni; nazwiska rodowe w formie męskiej (np. „z Bielaków” → Bielak, „Kosidłowa” → Kosidło), a w `margin_notes` adnotacja, jeśli akt podaje inaczej. Rodziców wpisuj w pola rodziców (imię i nazwisko ojca, imię i nazwisko panieńskie matki), nie w uwagi. `*_alive`: tak/nie (z „żyjących” / „zmarłego”).
- Pole stanu = stan cywilny (kawaler, panna, wdowiec, wdowa). Zawód osobno (rolnik, robotnik, wyrobnica…). „Przy rodzicach/przy matce” nie jest zawodem – zostaw `*_profession` puste.
- NIE zapisuj dat zapowiedzi (`banns` zostaw puste). `consent` tylko gdy akt wspomina zgodę lub pozwolenie (np. ustne pozwolenie ojca młodej) albo dyspensę.
- Świadkowie: imię i nazwisko, miejsce zamieszkania, zawód. Wiek świadka, gdy jest podany (albo „pełnoletni”), oraz inne ciekawostki zapisz w `margin_notes`.
- `margin_notes` (zwięźle, same fakty): wszystkie dopisane adnotacje na marginesie (inne pismo): zgon małżonka z datą, miejscem i numerem aktu, rozwód / unieważnienie (sąd, sygnatura, data, uprawomocnienie), zmiana nazwy miejscowości, przeniesienie aktu do rejestru stanu cywilnego (data, oznaczenie), dyspensy, niepiśmienni i kto podpisał, pozostałe osobliwości (np. urodzony za granicą, panna młoda córka niezamężnej…). Nie wymyślaj; opisuj tylko to, co widać.
- Brak danych w akcie → puste pole. Nie zgaduj. Wątpliwy odczyt: wpisz najlepszy odczyt i dodaj nazwę pola do `uncertain_fields` (lista po przecinku, nazwy kolumn). Wątpliwych nie omawiaj w odpowiedzi – tylko oznacz w pliku.
- `verification_status` = `ai_v1`, `verification_notes` krótko tylko gdy trzeba (np. które zdjęcie użyto). `act_text`: krótkie streszczenie z pól jak we wzorze (zaczyna się od „[odczyt rekonstruowany z pól, nie dosłowny]”).
- Sprawdź dzień tygodnia dla dat ślubów (1945) – w razie niezgodności z kalendarzem oznacz `marriage_date` jako wątpliwe.

## Wynik
Zapisz `MALZENSTWA_1945_cz2_ai1_import.csv` (akty 13–22; 13 skopiuj ze wzoru, resztę odczytaj) w tym samym katalogu co wzór (`public/konsolidacja/haiku/` w repo) oraz `MALZENSTWA_1945_cz2_skany.csv` z kolumnami `akt;plik;strona(lewa/prawa)`. W odpowiedzi podaj tylko: ile aktów odczytano, które pliki skanów użyto i jeśli któregoś aktu nie dało się znaleźć w skanach.
