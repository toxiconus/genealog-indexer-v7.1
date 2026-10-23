# Ocena projektu i plan pierwszych kroków (2026-10-23)

Gałąź: `ocena/ocr-i-plan-2026-10-23`. Ten dokument nie zmienia kodu. Opiera się na przeczytaniu plików, nie na uruchomieniu aplikacji.

## 1. Stan obecny

- **Działająca wersja:** `public/viewer-osd-v8.21.html` (commit z 2026-02-03). Wczytuje skany, rysuje ROI przy polach, ma OCR per pole (Tesseract.js z CDN), zapis do bazy i eksport CSV.
- **Najnowsza wersja:** `public/viewer-osd-v9.html` (ACTA v1, zależy od `acta-v1-models.js`). Część zadań z roadmapy v9.2 nie jest zrobiona.
- **v10:** modularny szkielet (~20%). Logika OCR i formularzy jest tylko zaślepką. Nie nadaje się jeszcze do użycia.
- **Repo:** kilkadziesiąt kopii `viewer-osd-v*.html`, `backup*`, `kopia` i równoległe podejścia. Dokumentacja pochodzi z różnych wersji (grudzień 2025 – luty 2026) i częściowo się wyklucza.

## 2. Problemy, które widzę

1. **OCR jest najbardziej zawodną częścią.** Błędy są pokazywane tylko na chwilę, a wynik poniżej 30% pewności kończy się komunikatem „nie rozpoznał tekstu”. Nie ma diagnostyki, więc nie wiadomo, czy zawodzi pobieranie silnika, języka, canvas, czy sam odczyt.
2. **Zależności z CDN.** Tesseract (unpkg, tessdata z zewnętrznego serwera) i OpenSeadragon. Bez sieci część funkcji nie działa, a dane językowe są duże.
3. **Cztery magazyny danych** (localStorage, SQLite, Supabase, Firebase) bez jasnej decyzji, który jest źródłem prawdy.
4. **Definicje pól w kodzie i w `fields-config.json`** – ryzyko rozjazdu.
5. **Odręczne akta** są słabym przypadkiem dla Tesseracta. Przy takich skanach model z wizją prawdopodobnie da lepszy efekt, ale to zewnętrzne API.

## 3. Propozycja kolejności

**Krok 1 – diagnostyka OCR (najmniejszy, najbardziej potrzebny).**
- Dodać logowanie każdego etapu (załadowanie silnika, języka, obrazu, canvasu, wynik i pewność) do jednego miejsca na ekranie.
- Pokazać surowy tekst i pewność także przy niskim wyniku, zamiast ukrywać.
- Przetestować na 2–3 prawdziwych skanach (z tym, że odręczne mogą dać słaby wynik – to wtedy poprawne zachowanie).
- Kryterium: po jednym kliknięciu użytkownik widzi wynik albo konkretny powód błędu.

**Krok 2 – lokalne zasoby.** Pliki języka `pol` i silnik Tesseracta w repo lub obok viewera, bez CDN. Decyzja zależy od rozmiaru danych.

**Krok 3 – jedno źródło prawdy.** Zakładam IndexedDB (już jest w trybie offline v8.21) z eksportem/importem JSON i CSV. Supabase/Firebase/SQLite jako opcjonalny eksport. **Wymaga decyzji autora.**

**Krok 4 – formularz z `fields-config.json`.** Jeden plik steruje formularzem, walidacją i kolumnami CSV.

**Krok 5 – porządek w repo.** Wszystkie stare wersje do `archiwum/` (poza gałęzią główną), jeden aktywny viewer, jedna aktualna dokumentacja.

**Krok 6 (później, po decyzji) – odczyt całego aktu przez model z wizją** jako propozycje wartości do pól, zatwierdzane ręcznie. Wymaga zgody na wysyłanie skanów do zewnętrznego API.

## 4. Pytania do autora

- Magazyn danych: lokalnie (IndexedDB) czy w chmurze (Supabase)?
- Czy można wysyłać skany do zewnętrznego modelu AI?
- Priorytet: szybkie wpisywanie czy odczyt ze skanów?

## 5. Czego nie zrobiono w tej gałęzi

- Brak zmian w `viewer-osd-*.html` i `acta-v1-models.js`.
- Brak uruchomienia aplikacji i testów OCR (wymaga przykładowego skanu).
