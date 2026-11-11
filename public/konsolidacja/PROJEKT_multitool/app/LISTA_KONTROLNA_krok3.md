# Krok 3 – lista kontrolna z MODULY.md §4 (stan 2026-11-11)

Test: `node test/test_krok3_akt.cjs` (Playwright). Oznaczenia: [x] przeniesione i sprawdzone testem, [~] logika przeniesiona, brak interfejsu, [ ] brak.

- [ ] Tryby tekstu i `[?]` – silnik tokenów (`qList`, `assignTok`, `textSugs`, `applyWitText`, `fixAllTexts`) jest w `akt_zgon.js` (używa go `commit` i import CSV), widoku trybów brak; w karcie tylko pole „Tekst aktu” [~]
- [ ] Kreator pól
- [~] Zatwierdzanie grupy na górze i na dole – jest „Zatwierdź akt” i „Przyjmij zgodne pola” (u góry); `approveAll` i pasek na dole nie przeniesione
- [~] Picker jednostki wieku – `normAge` działa (import, edycja); widżetu brak
- [~] Kalendarz i stary styl – `dateShort`, `dateBad`, `jdn*`, `dw*` przeniesione i objęte parytetem (edycja daty skrótem „12 maj”, data nieistniejąca); widżetu kalendarza brak
- [x] Ukrywanie pól `[_]`/`[-]` (z listą ukrytych i przyciskiem „pokaż”)
- [~] Licznik braków – jest postęp pól (`progOf`, parytet); `missingAudit` przeniesione, bez widoku
- [ ] Nawigacja stulecie → dekada → rok – jest tylko wybór roku
- [x] „Tylko ze skanem” – według ścieżki skanu z danych; bez podglądu skanu
- [ ] Filtr „Rejestr + protokoły” – rejestru i protokołów nie ma w `dane_zgony.json`
- [~] Słownik poprawek – `learnFix` zbiera poprawki do `S.fixes` (magazyn `slowniki`); widoku „Pisownia” brak
- [~] Autozapis do pliku – `kopiaAutoWybierz`/`kopiaAutoZapis` (File System Access); w Chromium headless API niedostępne, kod nietestowany
- [x] Import CSV w trybie „dopisz” i „zastąp” – z walidacją, podglądem różnic, migawką (test: 881 aktów, 8 ok)
- [ ] Eksport ROI (ramki pól nie są jeszcze edytowalne; podgląd skanu poza krokiem 3)
- [~] Raport spójności – sygnały przy akcie (`raportSpojnosci`, parytet 32 sygnałów na 30 aktach); ignorowanie i widok zbiorczy brak
- [ ] Hipotezy powiązań rodzinnych (`relFor`, `relCsv`)
- Poza zakresem kroku 3: dopasowanie, edytor, spisy (kroki 5–10).
