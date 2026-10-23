# Założenia: v6 jako jeden panel większego systemu indeksacji

Status: PROJEKT do akceptacji. Żaden kod z archiwum nie został przeniesiony, poza dwiema rzeczami opisanymi w pkt 8.

Cel: gdy v6 stanie się jednym z paneli większego systemu, ma już dziś trzymać się wspólnych zasad. Stąd poniższy zbiór założeń. Źródłem są dokumenty z `J:\genealog-indexer-v5\archiwum` oraz doświadczenia z indeksacji Blinowa (1783, 1873, 1943).

## 1. Co przeczytałem i jak to traktuję

| Źródło (archiwum) | Zawartość | Jak traktuję |
|---|---|---|
| `z-acta-scalenie/DATA_MODEL.md` | model zdarzeń metrykalnych ACTA v1, proweniencja, specyfika zaborów | **pomysł i słownik pojęć**, nie opis stanu |
| `z-dysk/ACTA — kopia/actacom-specification-v3.md` | ACTACOM v3: osoby, warianty nazwisk, hipotezy, konflikty, wiarygodność, obrazy | **plan docelowy**, nigdy w pełni wdrożony |
| `z-dysk/Baza — kopia/specyfikacja-actacom.md`, `rozszerzenia-actacom.md` | format ACTACOM 1.0 (daty, miejsca, pewność, proweniencja) | **wzór formatu wymiany** |
| `z-Genealog/genealog-indexer/DATA-MODEL-v4.1.md` | Osoba / Zdarzenie / Relacja / Obraz, SQLite | **najbliższy realnej implementacji** |
| `z-akta-v2/EXPORT_IMPORT_MAPPING.md`, `DYNAMIC_FORMS_v8.21.md`, `fields-config.json`, `WORKFLOW_OBRAZY_v8.20.2.md` | mapowanie pól Supabase↔SQLite, formularze z konfiguracji, obraz+ROI | **kontrakt pól**, v6 ma to już w `templates-config.js` |
| `GENEALOGICAL_SYMBOLS.md`, `CALENDAR_SYSTEMS.md`, `SKROTY_GENEALOGICZNE.md` | symbole, kalendarze, skróty aktów | wiedza referencyjna, patrz pkt 4 |

Zasada: dokumenty ACTA/ACTACOM to w większości **plany**. Zanim cokolwiek z nich wejdzie do systemu, sprawdzam to w kodzie albo w danych, a nie w opisie.

## 2. Podział na panele (docelowy)

1. **Indeksacja aktów** (v6): obraz, ramki ROI, formularz, tabela rekordów. Wyjście: rekordy aktów.
2. **Skany i prostowanie**: wczytywanie, kolejność stron, „Kartka”, filtry, obrót. Wyjście: obrazy z metadanymi transformacji.
3. **Słowniki**: imiona (formy łacińskie i dawne → współczesne), nazwiska i ich warianty, miejscowości, zawody, skróty, duchowieństwo.
4. **Kontrola i konflikty**: duplikaty numerów, luki, wiek, logika dat, rozbieżności między źródłami.
5. **Scalanie osób**: z rekordów aktów powstają osoby i relacje. To nie jest zadanie panelu 1.
6. **Eksport i wymiana**: CSV dla Office, JSON, SQLite, opcjonalnie ACTACOM/GEDCOM.

Zasada podziału: panel indeksacji zapisuje **to, co jest w akcie**, a interpretacja (kto jest tą samą osobą, jakie nazwisko jest „podstawowe”) należy do paneli 3–5.

## 3. Model danych, wspólny kontrakt

Z v4.1 i ACTACOM przyjmuję rozdzielenie czterech pojęć:

- **Rekord aktu** (to produkuje v6): jeden akt na jednym obrazie, z polami z szablonu. Nigdy nie zawiera „zlanych” osób.
- **Osoba**, **Zdarzenie**, **Relacja**: powstają w panelu scalania z rekordów aktów. Rekord aktu zostaje jako źródło i nie jest nadpisywany.
- **Źródło/obraz**: stabilny identyfikator + współrzędne ROI.

Pola rekordu aktu w v6 (dziś): `id`, `tpl`, `v:{pole:wartość}`, `page`, `roi:{x,y,w,h,page}`, `status` (nowy / w toku / do sprawdzenia / gotowe), `by`, `at`, `uncertain`.
Założenia na przyszłość:

1. **`id` źródłowy jest stały** (np. `CH.LUB.BLIN.1783.001`) i nigdy nie jest używany ponownie. Zmiana numeru aktu nie zmienia `id`.
2. **Wersjonowanie**: każda zmiana pola ma wpis `{pole, stara, nowa, kto, kiedy}` (v6 ma już cofanie w sesji; do utrwalenia).
3. **Pewność na poziomie pola**, nie tylko rekordu: lista pól niepewnych (`uncertain_fields`, już w szablonie chrztu) + powód („wyblakły tusz”, „nieczytelne”).
4. **Oryginał zawsze obok**: wartość znormalizowana nie zastępuje zapisu z aktu (patrz pkt 5).

## 4. Zasady merytoryczne zebrane z materiału

### 4.1 Imiona i nazwiska
- **Nie poprawiamy bez pewności.** Panel zapisuje formę z aktu. Z ACTACOM zostaje klasyfikacja wariantów: pisownia (SPELLING), panieńskie (MAIDEN), zamężne (MARRIED), wdowie (WIDOW), adaptowane (ADAPTED).
- Formy żeńskie zależne od stanu (-ówna, -anka, -owa, -icha) to **warianty tego samego nazwiska**, nie osobne nazwiska. Zapisujemy to, co jest w akcie, a powiązanie robi panel scalania.
- W akcie bywa formą mnogą rodu: „z Sulowskich małżonków Kopiwodów” oznacza, że matka jest z domu Sulowska. Zapisujemy dosłownie, a panel scalania wyprowadza formę.
- Wiek: `~RRRR` w polu, a surowy zapis (`l.2,5`, `m.6`, `t.4`, `d.5`) w notatkach oryginalnych. Jednostki z `SKROTY_GENEALOGICZNE`: l.=lata, m.=miesiące, t.=tygodnie, d.=dni.

### 4.2 Daty
- Format wymiany: dokładna, **około**, **przed**, **po**, zakres, niepełna, z oznaczeniem kalendarza (z ACTACOM). Pole daty trzyma zapis oryginalny, a znormalizowana wartość powstaje obok.
- **Kalendarz**: w archiwum (`CALENDAR_SYSTEMS.md`, `DATA_MODEL.md`) stoi, że zabór rosyjski używał kalendarza juliańskiego do 1915 r. Dla akt parafii katolickich w Królestwie Polskim to **nie jest przyjęte bez sprawdzenia** (akta były zwykle w stylu gregoriańskim). Tabela różnic dni (10/11/12/13) jest poprawna jako arytmetyka, ale to, kiedy jej użyć, ma wskazać użytkownik na podstawie aktu. Domyślnie: kalendarz gregoriański, jawna flaga dla innych.
- Lata przejściowe i podwójne daty (np. 1734/5) zostają dosłownie w zapisie, bez automatycznej konwersji.

### 4.3 Miejscowości i parafie
- Miejscowość z aktu to zapis dosłowny. Hierarchia (wieś → parafia → dekanat → powiat) w słowniku miejscowości. Przykład z Blinowa: parafia obejmowała Brzozówkę do 1989 r., a dekanat zmieniał się (janowski, kraśnicki, zaklikowski, zakrzówecki). Słownik musi mieć **daty obowiązywania** przynależności.

### 4.4 Wiarygodność i proweniencja
- Z ACTACOM przyjmuję trzy osie oceny: **źródło** (oryginał / indeks / wtórne), **ekstrakcja** (czytelność, OCR z korektą, odczyt trudny), **interpretacja** (jednoznaczna / z alternatywami).
- Wagi z dokumentu (0,4 / 0,35 / 0,25) traktuję jako **przykład**, nie obowiązujący wzór. Do czasu realnych danych wystarczą etykiety (wysoka / średnia / niska) i pole „powód”.
- Proweniencja minimalna: skąd dana wartość (odczyt z obrazu / wpis ręczny / obliczone / ze słownika / import), kto, kiedy. Klasy z `DATA_MODEL.md` (S1–S4, I1–I4, E1–E3, D1–D3) są dobre jako lista, ale wystarczy podzbiór: **odczyt (S), import (I), wpis (E), obliczone (D)**.

### 4.5 Konflikty i kontrola
Trzy poziomy z ACTACOM:
- **DIRECT**: dwie wartości tego samego pola z różnych źródeł (np. nazwisko ojca w akcie i w indeksie).
- **LOGICAL**: zgon przed urodzeniem, dziecko po śmierci ojca.
- **STATISTICAL**: wiek matki poza 13–55, ojca poza 15–85, odstępy między porodami.

v6 ma dziś STATISTICAL (wiek rodziców) i powtórzone numery aktów. LOGICAL i DIRECT wymagają osób i wielu źródeł, więc należą do panelu 4–5.

### 4.6 Obrazy i ROI
- ROI jest zapisane w układzie **wyświetlanego obrazu**. Wyprostowanie strony („Kartka”) zmienia geometrię, więc ramki zaznaczone przed prostowaniem się przesuną.
- **Założenie na przyszłość**: ROI trzymać w układzie obrazu **oryginalnego** i osobno zapisywać transformację (obrót, punkty prostowania). Wtedy można prostować w dowolnym momencie bez utraty ramek. Do czasu zmiany: najpierw prostować, potem zaznaczać.
- Obraz ma stały identyfikator (nazwa pliku + opcjonalnie suma kontrolna) i stronę. Miniatury i WebP to sprawa warstwy przechowywania, nie panelu.

### 4.7 Skróty i symbole
- Skróty (`kaw.`, `wd.`, `zd.`, `s.`, `c.`, `O:`, `M:`, `par.`, `USC`, `Kol.`) to wiedza referencyjna panelu słowników. W polach wartości zostają dosłowne, a rozwijanie jest opcjonalne i **na żądanie** (jak dziś w v6).
- Symbole genealogiczne (`*`, `≈`, `†`, `⚭`) służą **wyświetlaniu i eksportowi**, a nie wprowadzaniu. W polach nie wpisujemy symboli.

## 5. Zasada „obie pisownie”

Każda normalizacja (imię łacińskie → współczesne, wiek → `~RRRR`) **dodaje**, a nie zastępuje: oryginał trafia do „Notatek oryginalnych” z etykietą (`imię oryg.: Adalbertus`, `Wiek ojca oryg.: l.38`). To jest wspólna reguła dla wszystkich paneli.

## 6. Wymiana między panelami

- **Format główny**: JSON z listą rekordów aktów (pola z `templates-config.js`), obrazów (identyfikator, strona, transformacja) i słowników. Wersja formatu w nagłówku pliku.
- **Pomocnicze**: CSV dla Office (jak dziś), SQLite do zapytań, opcjonalnie ACTACOM/GEDCOM jako eksport (nie jako format pracy).
- **Import**: nigdy nie nadpisuje. Rekord o tym samym `id` jest porównywany pole po polu i trafia do kolejki do sprawdzenia, a nie do cichej zamiany.
- **Offline-first**: jak w v6 (IndexedDB z kopią w localStorage, ręczny backup). Synchronizacja z Supabase/Firestore nie jest warunkiem działania.

## 7. Czego z archiwum NIE przejmuję i dlaczego

| Element | Powód |
|---|---|
| Supabase / Firestore jako baza główna | sprzeczne z pracą offline i z prostotą v6 |
| Electron + SQLite jako wymóg | v6 działa jako jeden plik, panele mogą go osadzić |
| System hipotez, luki, teorie, DNA | za wcześnie, najpierw komplet danych z aktów |
| Wagi wiarygodności z liczbami | brak danych, żeby je skalibrować |
| Tabela kalendarzy zaborów „zabór rosyjski = juliański” | niezgodne z praktyką akt parafii w Królestwie Polskim, patrz 4.2 |
| Nazewnictwo wersji (ACTA v1, ACTACOM v3, v5, v7.1, v8.21, v6) | wersje mają różne numeracje i nie są jednym ciągiem |

## 8. Co już przeniosłem do v6 (z danych, nie z dokumentów)

1. **Podpowiedź form imion**: 66 par (łacina i dawne pisownie → współczesne), zbudowanych z `blinow_scalone.csv`. Zmiana tylko na kliknięcie, oryginał zostaje w notatkach.
2. **Wiek z jednostkami**: `l.`, `m.`, `t.`, `d.`, przecinek dziesiętny, podpowiedź `~RRRR`, surowy zapis do notatek.

## 9. Otwarte decyzje (do Ciebie)

1. Czy modelem docelowym ma być **v4.1** (Osoba / Zdarzenie / Relacja / Obraz), czy prostszy wariant „rekord aktu + indeks osób”?
2. Czy format wymiany ma być własny JSON (proponuję), czy od razu ACTACOM?
3. Czy ROI przechowujemy w układzie oryginału z zapisaną transformacją (proponuję), czy zostajemy przy prostowaniu przed zaznaczaniem?
4. Gdzie trzymamy słowniki (imiona, nazwiska, miejscowości, duchowieństwo): osobny plik JSON w repo czy w bazie panelu 3?
5. Co z danymi rodziny Kopiwodów w `kopiwoda_*.actacom` (m.in. małżeństwa 1827–1943): czy mają trafić do systemu jako źródło wtórne (indeks) z oznaczeniem proweniencji?

## 10. Następne kroki

1. Akceptacja pkt 9 (cztery decyzje wystarczą, żeby zacząć).
2. Spisanie `docs/DATA-MODEL-v6-panel.md` (jedna strona, z kontraktem pól i identyfikatorów).
3. Zmiana zapisu ROI w v6 na układ oryginału + transformację (jedna zmiana, test na prostowanych stronach).
4. Słownik duchowieństwa i miejscowości (na początek Blinów, Brzozówka, Szastarka, Zakrzówek), z datami obowiązywania.
