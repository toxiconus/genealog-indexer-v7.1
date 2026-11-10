# Pomysły na ulepszenia (z audytu zewnętrznego, 2026-11-10) – do przemyślenia na potem

Źródło: uwagi z zewnętrznego modelu, który oglądał tylko `baza_zgonow_1797-1945_MINI_bez_skanow.html`. Nic z tego nie jest jeszcze wdrożone ani zatwierdzone. Zasady stałe z `PRZEKAZANIE_2026-11-10_*.md` pkt 1 mają pierwszeństwo (m.in. nic nie scala się samo).

## Już w planie (pkt 5 przekazania)
- Model Osoba / Wystąpienie / Relacja; propozycje scaleń z punktacją, zatwierdzane przez użytkownika (kroki b, e).
- Eksport GED z zatwierdzonych klastrów (krok f).
- Historia zmian, import/eksport CSV (powłoka, krok c).
- Priorytet zewnętrzny (Osoba + łączenie, warianty nazwisk i dat, raport sprzeczności) jest zgodny z kolejnością planu.

## Nowe, warte rozważenia
1. **Raport sprzeczności genealogicznych**: dziecko starsze od rodzica lub po jego śmierci, ślub przed realnym wiekiem, zgon przed ślubem, różne daty urodzenia tej samej osoby, brak ojca/matki gdy inne akty je podają. Rozszerzenie istniejących „Sygnałów i kontroli”.
2. **„Pytania do rozwiązania”**: lista wątpliwych przypadków z powodem (zgodne z zasadą: wątpliwości do aplikacji, nie do czatu).
3. **Pasek „tożsamość osoby”** przy akcie: szac. rok urodzenia, małżonek, rodzice, poprzednie i późniejsze akty tej osoby; karta osoby.
4. **Wyszukiwanie**: fonetyczne i wieloznaczne (`Kow*ski`), warianty historyczne nazwisk, przedziały dat i wieku, słownik zawodów (rolnik / włościanin / kmieć), słownik miejscowości z wariantami, filtr „ma skan”.
5. **Wyszukiwanie brakującego małżonka** (kobiety o nazwisku X zmarłe w latach Y–Z, mąż mógł być Y).
6. **Kolejka pracy**: Do transkrypcji / Do weryfikacji / Wymaga skanu / Konflikt danych / Gotowe; skróty klawiszowe (zatwierdź pole, następny/poprzedni akt, „do weryfikacji”, przełącz skan).
7. **Skan**: stałe powiązanie pole ↔ fragment obrazu (rozwinięcie ROI), powiększenie, kontrast.
8. **Mini-drzewo wokół aktu** (rodzice, małżonek, dzieci) z oznaczeniem pewności relacji.
9. **Statystyki zbioru** (akty, lata, nazwiska, zawody, rozkład wieku zgonu, braki).
10. **Kreator poszukiwań** (co i gdzie szukać dla brakującej daty) – zgodnie z zasadą trzymać poza GED, w plikach `HIPOTEZY_*`.
11. Tryb mobilny ze zdjęciem aktu; automatyczne kopie zapasowe z przywracaniem wersji (częściowo pokrywa eksport CSV przed podbiciem `D.key`).

## Uwaga
Zewnętrzny model nie widział repo ani skanów; część pozycji (historia zmian, warianty pisowni) może już być w aplikacji. Przed wdrożeniem sprawdzić w szablonie `weryfikacja_szablon_v3.html`, co istnieje.
