# Krok 3 – lista kontrolna z MODULY.md §4 (stan 2026-11-11)

Test: `node test/test_krok3_akt.cjs` (Playwright). Oznaczenia: [x] przeniesione i sprawdzone testem, [~] logika przeniesiona, brak interfejsu, [ ] brak.

- [x] Tryby tekstu i `[?]` – Edycja / Podgląd [?] / Sugestie (lista znaczników z „Usuń znacznik”, poprawki z zatwierdzonych pól z „Zastosuj” i „Zastosuj wszystkie”); `ui_narzedzia.js`, test H. Brak: widoku zbiorczego `fixAllTexts` (jest tylko w imporcie)
- [x] Kreator pól – okno: zatwierdź i dalej / pomiń / wstecz, podpowiedzi AI i indeksu (test H)
- [~] Zatwierdzanie grupy na górze i na dole – jest „Zatwierdź akt” i „Przyjmij zgodne pola” (u góry); `approveAll` i pasek na dole nie przeniesione
- [x] Picker jednostki wieku – liczba + jednostka (lat, miesięcy, tygodni, dni, godzin) → „41” / „3 mies.” (test H)
- [x] Kalendarz i stary styl – `dateShort`, `dateBad`, `jdn*`, `dw*` przeniesione i objęte parytetem (edycja daty skrótem „12 maj”, data nieistniejąca); widżet kalendarza dodany: dzień/miesiąc/rok, stary styl (juliański) → nowy, odrzucenie nieistniejących dat (test H)
- [x] Ukrywanie pól `[_]`/`[-]` (z listą ukrytych i przyciskiem „pokaż”)
- [~] Licznik braków – jest postęp pól (`progOf`, parytet); `missingAudit` przeniesione, bez widoku
- [x] Nawigacja stulecie → dekada → rok – trzy zależne listy, zapamiętywane w stanie (test H)
- [x] „Tylko ze skanem” – według ścieżki skanu z danych; podgląd skanu: patrz niżej
- [~] Filtr „Rejestr + protokoły” – jest opcja filtra i komunikat o braku danych (rejestru i protokołów nie ma w `dane_zgony.json`); widoków brak do czasu dodania danych (test H)
- [~] Słownik poprawek – `learnFix` zbiera poprawki do `S.fixes` (magazyn `slowniki`); widoku „Pisownia” brak
- [~] Autozapis do pliku – `kopiaAutoWybierz`/`kopiaAutoZapis` (File System Access); w Chromium headless API niedostępne, kod nietestowany
- [x] Import CSV w trybie „dopisz” i „zastąp” – z walidacją, podglądem różnic, migawką (test: 881 aktów, 8 ok)
- [x] Podgląd skanu: wybór folderu (`<input webkitdirectory>`), obraz lokalnie przez `URL.createObjectURL`, zero żądań sieciowych (test G); przesuwanie/zoom (mysz, kółko, dwa palce)
- [x] ROI aktu i ramki pól – rysowane na skanie, zapis w stanie (`akty.roi`, `akty.fr`, IndexedDB + kopia pełna z walidacją 0–1), „Cofnij własny ROI”; eksport ROI i ramek (menu → JSON) (test G). Wymaga ponownego wskazania folderu po każdym otwarciu karty (przeglądarka nie pozwala zapamiętać folderu bez File System Access; autozapis ma osobny uchwyt)
- [~] Raport spójności – sygnały przy akcie (`raportSpojnosci`, parytet 32 sygnałów na 30 aktach); ignorowanie i przywracanie dodane (zapis w stanie, test H); widok zbiorczy brak
- [ ] Hipotezy powiązań rodzinnych (`relFor`, `relCsv`)
- Poza zakresem kroku 3: dopasowanie, edytor, spisy (kroki 5–10).

- Poprawka przy okazji: `D.lata`/`D.zakres` liczone z danych (`dane_adapter.js`); bez tego `dateBad` odrzucał każdą datę spoza 1940–1946 (domyślny zakres księgi 1943).
- Test: 42 kontrole (23 dotychczasowych + 19 nowych: G skan/ROI, H narzędzia). W teście usunięto tylko zawężenie selektora `#main img` → `img:not(#skImg)`.
