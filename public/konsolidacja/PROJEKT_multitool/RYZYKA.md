# Multitool – ryzyka

Skala: prawdopodobieństwo / skutek (niskie, średnie, wysokie). Liczby pochodzą z repo i z prototypu w tym folderze.

## 1. Rozmiar pliku
**Stan:** `baza_zgonow_1797-1945.html` ma 12 MB (skany base64 pomniejszone do 1700 px); `haiku/skany_lm/` to 29 MB w 27 plikach; skany ASC i 1935–45 są poza repo. Próbka prototypu: 271 aktów = 679 KB JSON, czyli ok. 2,5 KB na akt, z czego większość to powtarzane `source` przy każdym polu. Pełny zbiór (ok. 9 tys. aktów metrykalnych + spisy) dałby ok. 25 MB samych danych, zanim dojdą skany.

| Ryzyko | P / S | Zabezpieczenie |
|---|---|---|
| Plik „wszystko w jednym” przekracza to, co telefon otwiera płynnie (parsowanie JSON, pamięć) | wysokie / wysokie | Dane i skany rozdzielone. Wariant podstawowy: jeden plik HTML **bez skanów** (dane + kod) i skany z folderu lub z magazynu `skany` w IndexedDB. Wariant ze skanami tylko na życzenie i tylko dla wybranego zakresu lat. |
| `dane.json` rośnie przez powtarzane `source` | pewne / średnie | Zapis zwarty: tabela źródeł `[plik, skan, strona]` w nagłówku, w polu numer wpisu + wiersz; pola `lub` bez `unc`, gdy fałsz. Szacunek: 2,5 KB → poniżej 1 KB na akt (ok. 9 MB na całość, ok. 2 MB po gzip). Model logiczny bez zmian; rozwija go funkcja ładująca. |
| Liczenie propozycji dla wszystkich wystąpień blokuje interfejs (próbka: 926 wystąpień, 2,7 s; pełny zbiór to ok. 30 tys. wystąpień, a częste nazwisko tworzy blok kilku tysięcy) | wysokie / średnie | Liczenie na żądanie dla otwartej osoby; reszta w tle w Web Workerze, porcjami, z wynikiem w IndexedDB i unieważnianiem tylko dla zmienionych aktów. Blok dzielony dodatkowo po imieniu. |
| Lista aktów i osób: tysiące węzłów DOM | średnie / średnie | Wirtualizacja listy (jest w v6), stronicowanie po roczniku. |
| Repo puchnie od wygenerowanych plików HTML (12 MB na każdą przebudowę) | pewne / niskie | W repo wersja „folder” i źródła; duże pliki wynikowe budowane lokalnie albo jako wydanie, nie przy każdym commicie. Decyzja użytkownika (dziś pliki są wysyłane do czatu). |
| Limit rozmiaru wersji ze skanami w IndexedDB / na dysku telefonu | średnie / średnie | `navigator.storage.estimate()` w ustawieniach; ostrzeżenie przed dodaniem skanów ponad wolne miejsce. |

## 2. Utrata zatwierdzeń
**Stan:** zatwierdzenia żyją w `localStorage` pod `D.key` (`bazazgonow3`, `wm1`, `dop.v1`, `blinow_edytor_v1`). W repo są dwa eksporty CSV (881 aktów, 8 ze statusem `ok`). Podbicie `D.key` zaczyna od pustego stanu. Historia zmian jest przycinana do 4000 wpisów, a przy braku miejsca do 300 (`S.hist.splice`), czyli część historii znika bez komunikatu. „Wczytaj kopię roboczą” robi `Object.assign(S, JSON.parse(plik))` bez sprawdzenia.

| Ryzyko | P / S | Zabezpieczenie |
|---|---|---|
| Zmiana klucza stanu (`D.key`) osieroca zatwierdzenia | wysokie / wysokie | Do migracji: twarda zasada z przekazania (eksport CSV **i** kopia JSON przed każdą zmianą klucza), wpisana jako pierwszy krok buildera: builder odmawia zmiany `key` bez pliku kopii z bieżącą datą w `haiku/ZATWIERDZENIA/`. Docelowo: stała nazwa bazy, stan zapisany względem wartości bazowej (plan §2.2), klucz nie zmienia się nigdy. |
| Wyczyszczenie danych przeglądarki, tryb prywatny, zmiana telefonu | średnie / wysokie | Wskaźnik „zmian bez kopii: N”, przypomnienie, autozapis do pliku, `storage.persist()`. Zatwierdzone pola wracają do repo jako CSV i stają się danymi (`status=ok` w `dane.json`). |
| Przeniesienie lub zmiana nazwy pliku HTML zmienia przydział pamięci przeglądarki | średnie / wysokie | Migracja wyłącznie z pliku kopii; sprawdzenie na przeglądarkach użytkownika w kroku 0; ostrzeżenie przy starcie, gdy baza jest pusta, a w danych jest znacznik „była kopia”. |
| Wspólny limit `localStorage` (ok. 5 MB) dla kilku narzędzi otwieranych z dysku | średnie / wysokie | Przejście na IndexedDB; do tego czasu baner „nie zapisano” już istnieje (`saveBanner`). |
| Ciche przycinanie historii | pewne (przy długiej pracy) / średnie | Historia w osobnym magazynie bez limitu; archiwizacja do pliku zamiast kasowania. Przed migracją: eksport historii CSV. |
| Import nadpisuje nowsze wybory starszym plikiem | średnie / wysokie | Podgląd różnic, domyślnie „dopisz”, migawka przed importem, cofnięcie importu w całości. |
| Przebudowa danych zmienia id aktu (np. `lm-<skan>-<n>` zależy od kolejności wczytywania) i decyzje tracą cel | średnie / wysokie | Id nadawane raz i zapisane w pliku źródłowym odczytu (nowa kolumna `id_aktu`), nie liczone przy budowie; `id_dawne`; kontrola W-02; magazyn `osierocone`. |
| Eksport CSV uznany za kopię („zapisano”), choć nie zawiera historii, decyzji, relacji | pewne / średnie | Dwie osobne akcje i dwa osobne wskaźniki: „Eksport CSV” i „Pełna kopia”; tylko druga gasi ostrzeżenie. |
| Scalenie osób nie do odwrócenia | – | Wykluczone konstrukcją: scalenie to wpis w dzienniku, cofnięcie to kolejny wpis; test prototypu sprawdza, że liczba aktów i wystąpień się nie zmienia. |
| Dwie karty lub dwa urządzenia piszą równolegle | niskie / średnie | Dziennik decyzji tylko dopisywany, import „dopisz” łączy dwa dzienniki po `(n, t)` z przenumerowaniem (jest w prototypie); dla pól: zdarzenie `storage`/`BroadcastChannel` i ostrzeżenie o drugiej karcie. |

## 3. Kolizje nazw skanów
**Stan:** builder kluczuje skany samą nazwą pliku (`key = full.split('/')[-1]`), aplikacja szuka po `a.file`, skany dodane z telefonu trafiają do IndexedDB pod `f.name`. Zdarzył się już duplikat treści pod dwiema nazwami (`blinow_lm-10.jpg` = `lm_str16-17.jpg`). Nazwy typu `001.jpg`, `image.jpg`, `f5296bd0-image.jpg` powtórzą się między rocznikami i źródłami.

| Ryzyko | P / S | Zabezpieczenie |
|---|---|---|
| Dwa różne skany o tej samej nazwie: akt pokazuje nie ten obraz, a zatwierdzenie „na skanie” dotyczy innej strony | wysokie (po dołączeniu chrztów i małżeństw) / wysokie | Id skanu = początek sha256 treści (`sk:0af0e32a2965`); nazwa i ścieżka to atrybuty. Builder liczy sumy i **przerywa** przy tej samej nazwie z różną sumą, dopóki konflikt nie ma wpisu w tabeli skanów. |
| Ten sam skan pod dwiema nazwami: podwójna praca, dwa „różne” źródła | średnie / niskie | Jedna pozycja w tabeli skanów z listą ścieżek; kontrola W-03. |
| Skan dodany przez użytkownika nadpisuje wbudowany o tej samej nazwie | średnie / średnie | Magazyn `skany` kluczowany sumą; przypisanie skanu do aktu to jawna czynność z podglądem. |
| Pomniejszona kopia base64 ma inną sumę niż oryginał | pewne / niskie | Suma liczona z oryginału; kopia pochodna dziedziczy id (`pochodna: true`, wymiary). ROI w układzie oryginału (ułamki 0–1, jak dziś). |
| Ścieżki bezwzględne (`file:///J:/Genealog/...`) w danych | pewne / niskie | W danych tylko ścieżka względna do katalogu głównego skanów; katalog w ustawieniach użytkownika (jak dziś `scanBase`). |

## 4. Escapowanie `innerHTML`
**Stan:** 89 przypisań `innerHTML` w pięciu szablonach (dopasowanie 26, małżeństwa 23, v3 19, edytor 17, spisy 4). Dane wchodzą z zewnątrz przez import CSV (zatwierdzenia, odczyt AI), kopię JSON, GED, nazwy plików skanów i pola edytowane ręcznie. `esc()` istnieje i jest używany, ale nie ma gwarancji, że wszędzie; jeden pominięty przypadek wystarczy, żeby wartość `<img onerror=…>` z cudzego pliku wykonała kod z dostępem do całego stanu.

| Ryzyko | P / S | Zabezpieczenie |
|---|---|---|
| Wartość z importu wstawiona bez `esc()` | średnie / wysokie | Reguła: `innerHTML` tylko w `ui/*`, zawsze przez jedną funkcję szablonu `html` (szablon znakowany), która escapuje każdą wstawkę domyślnie; surowy HTML wymaga jawnego `raw()`. Test w `zbuduj.py`: `grep` odrzuca `innerHTML`, `insertAdjacentHTML`, `outerHTML` poza `ui/` i poza tą funkcją. |
| Atrybuty: `data-id="${id}"`, `title="…"`, `href` | średnie / wysokie | `esc()` obejmuje cudzysłowy (obecny już to robi); id aktów walidowane wzorcem przy imporcie; adresy skanów tylko `blob:`, `data:image/`, `file:` lub względne. |
| `</script>` albo U+2028 w danych wbudowanych w plik | niskie / wysokie | `zbuduj.py` zamienia `</` na `<\/` oraz U+2028/2029 (jest w prototypie). |
| `prompt`/`confirm` z treścią z danych | niskie / niskie | To tekst, nie HTML; zostaje. |
| Kod w pliku kopii (`__proto__`, nieznane klucze) | niskie / średnie | Walidacja schematu z białą listą kluczy; żadnego `Object.assign` na surowym pliku. |
| Audyt istniejących 89 miejsc pominie przypadek | średnie / średnie | Audyt przy przenoszeniu każdego widoku (kroki 3, 5, 6, 8, 9), nie osobno; test Playwright wczytuje CSV z wartościami `<b>x</b>`, `"><img src=x onerror=alert(1)>` we wszystkich polach i sprawdza, że nie powstał żaden element spoza szablonu i nie pojawił się dialog. |

W prototypie wszystkie wstawki przechodzą przez `esc()`; test z wrogimi wartościami jest do dopisania w kroku 3.

## 5. Pozostałe
| Ryzyko | P / S | Zabezpieczenie |
|---|---|---|
| Przepisywanie silnika v3 gubi funkcję (ok. 190 KB kodu, wiele trybów) | wysokie / wysokie | Nie przepisywać: adapter danych + wydzielanie modułów po jednym, z porównaniem eksportu przed/po i listą kontrolną (`MODULY.md` §4). |
| Rozjazd normalizacji Python ↔ JS | średnie / średnie | Jeden zestaw testów parytetu (krok 1); docelowo normalizacja tylko w JS, builder woła ją przez `node`. |
| Reguły scalania za ostre lub za łagodne | średnie / średnie | Brak automatu ogranicza skutek do kolejności listy; strojenie na decyzjach użytkownika; wersja reguł zapisana w decyzji, kontrola W-07. |
| Dane prywatne (drzewo GED) trafiają do repo przez `dane.json` albo wyniki testów | średnie / wysokie | `zbuduj_dane.py` czyta wyłącznie indeksy i odczyty archiwalne; drzewo ładuje użytkownik lokalnie; test rankingu zapisuje tylko identyfikatory. Uwaga: `GED_scalone/*.ged` i `RANKING_scalen_zgony.csv` już są w repo publicznym i zawierają osoby z drzewa własnego; do decyzji użytkownika. |
| Jedna osoba, długi projekt: plan stanie w połowie | średnie / średnie | Każdy krok zostawia używalne narzędzie; stare pliki działają do końca; kroki 5–10 niezależne. |
| Zakres rośnie (pomysły z audytów) | wysokie / średnie | Pomysły poza planem trafiają do `POMYSLY_ulepszen_*.md`; wdrożenie tylko po decyzji użytkownika. |
