# Architektura systemu indeksacji: v6 jako jeden z paneli

Status: PROJEKT, decyzje podjęte przeze mnie (masz wolną rękę), każdą da się zmienić (pkt 11).
Poprzednia wersja tego pliku („Założenia: v6 jako panel”) była streszczeniem starych koncepcji. Ta jest zaprojektowana od faktycznej sytuacji. Stare dokumenty (ACTA, ACTACOM, model v4.1) służą jako zasób pomysłów, ale nic z nich nie jest warunkiem.

## 1. Punkt wyjścia: co naprawdę mamy

| Zasób | Stan | Liczby |
|---|---|---|
| Indeks chrztów Blinowa (`blinow_scalone.csv`) | gotowy, z kart indeksowych | 7682 wierszy, w tym 5947 aktów, lata 1783–1908 |
| Indeks zgonów (`zgony.csv`) | gotowy | 2624, lata 1797–1880 |
| Indeks małżeństw (`malzenstwa_mal.csv`) | gotowy | 721, lata 1841–1894 |
| Każdy wiersz ma odsyłacz | tak | `wiersz_zrodlo`, `arch_id_ods`, flagi |
| Skany aktów | luźne, w kilku źródłach | AP Lublin, USC Szastarka (Lubgens), zdjęcia własne |
| Słowniki | są | `data/imiona_wszystkie.json` (315), `nazwiska_wszystkie.json` (283) |
| Narzędzia | v6 (jeden plik), edytory w repo, starsze v4–v9 | v6 ma ROI, prostowanie, filtry, podpowiedzi |

**Wniosek, który zmienia projekt:** większość pracy to nie „wpisz akt od zera”, tylko **zweryfikuj wiersz indeksu ze skanem i uzupełnij to, czego karta nie miała** (daty dni, chrzestni, świadkowie, ksiądz, wiek w oryginalnym zapisie, uwagi marginesowe). Indeks z kart jest warstwą 1, akt na skanie warstwą 2. System musi je trzymać osobno i pokazywać różnice.

## 2. Twarde zasady (nie do negocjacji w żadnym panelu)

1. **Nic nie ginie.** Zmiany są dopisywane (historia), nie nadpisywane. Usunięcie to oznaczenie, nie skasowanie.
2. **Zapis z aktu jest święty.** Normalizacja dodaje pole obok, nie zastępuje.
3. **Nazwisk i imion nie poprawiam bez pewności.** Warianty zostają, powiązanie robi człowiek.
4. **Odczyt maszynowy to propozycja, nie dane** (pkt 7). Do bazy wchodzi tylko to, co zatwierdził człowiek.
5. **Skan jest dowodem.** Każdy zatwierdzony rekord wskazuje obraz i ramkę. Bez tego rekord ma status „z indeksu”, nie „zweryfikowany”.
6. **Praca offline, dane w zwykłych plikach.** Żadnej bazy, której nie da się otworzyć w edytorze tekstu.
7. **Pewność jest per pole**, nie per rekord.

## 3. Struktura projektu na dysku

```
projekt-blinow/
  projekt.json                  nazwa, wersja formatu, dane parafii
  ksiegi/
    chrzty_1783.json            manifest księgi (okres, język, szablon, lista skanów)
    zgony_1873.json
  rekordy/
    chrzty_1783.json            migawka rekordów
    chrzty_1783.log.jsonl       dziennik zmian (dopisywany)
  skany/
    chrzty_1783/001.jpg ...     oryginały, nigdy nie zmieniane
  transformacje/
    chrzty_1783.json            obrót, punkty prostowania per skan
  slowniki/
    imiona.json  nazwiska.json  miejscowosci.json  duchowni.json  zawody.json  skroty.json
  osoby/
    wystapienia.json            osoby wyciągnięte z rekordów
    osoby.json                  powiązania (tylko potwierdzone)
  eksport/                      CSV, JSON, SQLite, GEDCOM
```

Panele to osobne pliki HTML otwierane na tym samym folderze (przeglądarka Chromium, `showDirectoryPicker`). Zapamiętany uchwyt folderu + kopia w IndexedDB jako bufor. Jeśli przeglądarka nie pozwala, działa tryb „importuj/eksportuj” jak dziś. **Panele nie rozmawiają przez serwer ani API, tylko przez wspólne pliki i jeden schemat.**

## 4. Schemat rekordu (wersja 1)

Przykład: zgon z 1873 r. (wiersz `Z02394` w `zgony.csv`), poprawiony według skanu. Indeks miał rodziców w dopełniaczu („Antoniego”, „Marianny”) i nie miał dnia zgonu. Skan dodał datę 1 stycznia, a oryginalny zapis rodziców zostaje w `o`.

```json
{
  "id": "BLIN.Z.1873.001",
  "ksiega": "zgony_1873",
  "obraz": {"plik": "skany/zgony_1873/001.jpg", "strona": 1},
  "roi": {"x": 1120, "y": 140, "w": 790, "h": 300},
  "szablon": "zgon",
  "v": {
    "nazwisko": "Kisielewska", "imie": "Marianna", "plec": "K",
    "data_zgonu": "1873-01-01", "miejscowosc": "Blinów",
    "wiek": "~1870", "ojciec_imie": "Antoni", "matka_imie": "Marianna"
  },
  "o": {"wiek": "l.2,5", "ojciec_imie": "Antoniego", "matka_imie": "Marianny"},
  "poz": {"nazwisko": 2, "wiek": 1},
  "propozycje": [],
  "zrodlo_indeksu": {"plik": "zgony.csv", "id": "Z02394"},
  "status": "zweryfikowany",
  "kto": "rafal", "kiedy": "2026-10-23T22:08:00+02:00"
}
```

- `v` wartości znormalizowane zgodnie z szablonem, `o` zapis dosłowny, gdy różni się od `v`.
- `poz` pewność pola: 2 = pewne, 1 = niepewne, 0 = nieczytelne. Brak = nie sprawdzano.
- `status`: z_indeksu, w_toku, do_sprawdzenia, zweryfikowany.
- `roi` zawsze we współrzędnych **oryginalnego skanu**. Prostowanie jest osobną transformacją (pkt 6).
- `id` stały, nigdy nie używany ponownie, niezależny od numeru aktu.
- Rekord nie zawiera „osób”. Osoby są w panelu osób (pkt 8).

## 5. Księgi i szablony według okresu

Szablon wynika z okresu, języka i formy aktu. To dane w manifeście księgi, nie kod.

| Okres | Język i forma | Uwagi praktyczne |
|---|---|---|
| do 1808 | łacina, akt narracyjny, karty indeksowe | daty w formie „ij 2 Januarii”, imiona łacińskie |
| 1808–1867 | polski, akt narracyjny | akta stanu cywilnego prowadzone przez księdza |
| 1868–1914 | rosyjski (pismo odręczne) | stałe formuły, trudne nazwy; indeks bardzo pomaga |
| 1915–1943 | polski, formularze | często z dopiskami marginesowymi (zgony, odpisy) |
| 1944–1946 | polski, księga małżeństw z protokołem rewizyjnym | rejestr alfabetyczny na początku księgi |
| po 1946 | USC, przeniesione do rejestru elektronicznego | stempel z numerem aktu (np. Szastarka, 2016) |

Każda księga ma: `typ` (chrzty/małżeństwa/zgony), `lata`, `jezyk`, `szablon`, `kalendarz` (domyślnie gregoriański, zmiana tylko jawnie), listę skanów z kolejnością, oraz **arkusz formuł** (stałe zwroty języka księgi, do podpowiadania).

## 6. Obrazy: oryginał, transformacja, ramki

- Oryginał w `skany/` jest **niezmienny**.
- Transformacja (obrót, prostowanie „Kartka”) zapisana osobno: `{obrot, punkty}` dla każdego skanu.
- ROI w układzie **oryginału**. Wyświetlanie przelicza ramkę przez aktualną transformację. Dzięki temu można prostować w dowolnym momencie bez utraty ramek.
- Wyprostowana wersja to **pochodna** (cache), odtwarzana z oryginału i transformacji.

## 7. Odczyt maszynowy (OCR i modele): tylko propozycje

Doświadczenie z tego projektu: model mylił rok (1703 zamiast 1783), nazwisko ojca (Szopówna zamiast Szopa), wskazywał nieistniejący konflikt, błędnie czytał nazwiska świadków (Marczuk zamiast Mazurek) i miejscowość. Dlatego:

- Odczyt maszynowy ląduje w `propozycje: [{pole, wartosc, zrodlo, kiedy}]`, nigdy w `v`.
- Panel pokazuje propozycję obok pola jako szarą sugestię z przyciskiem „przyjmij”. Przyjęcie zapisuje autora (człowiek) i oznacza pole jako `poz: 1`, dopóki nie zostanie potwierdzone na skanie.
- Odczyt wspiera się **indeksem**: zanim model zgaduje nazwisko z obrazu, sprawdza, czy ten wiersz jest już w indeksie.
- Obrazy do odczytu przechodzą przez filtry (wyrównanie tła, wzmocnienie słabego tuszu), a nie przez ostre progowanie, które gubi cienkie kreski.

## 8. Osoby i łączenie

- Panel indeksacji produkuje rekordy aktów. **Wystąpienia osób** (dziecko, ojciec, matka, chrzestny, świadek, pan młody itd.) wyciąga się z rekordów automatycznie do `wystapienia.json`.
- **Łączenie** wystąpień w osoby jest ręcznym potwierdzeniem, ze wsparciem: klucz nazwiska (bez ogonków, `fold`), imię (po słowniku form), miejscowość, lata, wiek (~RRRR), rodzice. Wynik: propozycja z oceną, nigdy automatyczne scalenie.
- Pierwszy przypadek użycia: rodzina jednego nazwiska (np. Kopiwoda) przez cały zasób. Łatwo ocenić, czy łączenie działa.
- GEDCOM powstaje wyłącznie z potwierdzonych osób.

## 9. Panele

| Panel | Czyta | Zapisuje | Status |
|---|---|---|---|
| Indeksacja (v6) | księgi, skany, rekordy, słowniki | rekordy, dziennik, transformacje | działa, wymaga zmian z pkt 10 |
| Weryfikacja indeksu | rekordy „z_indeksu”, skany | rekordy | **nowy, najważniejszy** (rozmiar: duży) |
| Słowniki | rekordy | slowniki | zalążek w v6 (podpowiedzi, skróty) |
| Kontrola | rekordy | raport | zalążek w v6 (wiek, duplikaty, luki) |
| Osoby | rekordy, wystąpienia | osoby | później |
| Eksport | wszystko | eksport/ | CSV działa |

Panel „Weryfikacja indeksu” to widok v6 z dwoma kolumnami: wartość z indeksu i wartość ze skanu, różnice zaznaczone. Przejście do następnego wiersza po zatwierdzeniu. To realizuje workflow z pkt 1.

## 10. Zmiany w v6, w kolejności opłacalności

1. **Tryb weryfikacji indeksu**: wczytanie wierszy z CSV jako rekordy `z_indeksu`, widok „indeks | skan | różnice”, szybkie „zgodne / popraw”. (duży, największy zysk)
2. **ROI w układzie oryginału** + zapis transformacji (obrót i punkty prostowania). (średni)
3. **Pewność per pole** (`poz`) i `o` (oryginał) jako standard zapisu; interfejs: klawisz „?” przy polu. (średni)
4. **Trwały zapis w folderze projektu** (File System Access API) zamiast samego IndexedDB, z dziennikiem zmian. (średni)
5. **Manifest księgi i szablon według okresu**, w tym szablony rosyjskie (zgony i chrzty 1868–1914) i małżeństw. (średni)
6. **Pole `propozycje`** i obsługa szarej sugestii. (mały)
7. **Słowniki w plikach** (`imiona.json`, `miejscowosci.json`, `duchowni.json`) wczytywane z projektu. (mały)
8. **Stabilne `id` źródłowe** i wersja formatu w pliku. (mały)

Już zrobione w v6: podpowiedzi form imion (66 par z danych Blinowa), wiek z jednostkami (l., m., t., d.) z podpowiedzią ~RRRR, ramki ROI z cofaniem, prostowanie stron z perspektywą i zagięciem, filtry czytelności, tabela z wirtualizacją, kontrola jakości.

## 11. Decyzje, które podjąłem, i jak je cofnąć

| Decyzja | Dlaczego | Jak cofnąć |
|---|---|---|
| Rekord aktu + wystąpienia + osoby (nie pełny model v4.1) | indeks jest już „rekordowy”, osoby to dopiero cel | dodać tabele osób bez zmiany rekordów |
| Własny JSON, nie ACTACOM | prostszy, kontroluję schemat | eksporter ACTACOM jako dodatkowy |
| Folder z plikami, nie baza | działa offline, widać w edytorze, kopia = kopiuj/wklej | eksport do SQLite już jest planowany |
| ROI w układzie oryginału | prostowanie bez utraty ramek | – (to poprawka błędu projektu) |
| Odczyt AI jako propozycja | doświadczenie z tego projektu | – (zasada bezpieczeństwa danych) |
| Gregoriański domyślnie | tak są zapisane akty parafii katolickich w Królestwie Polskim; flaga dla wyjątków | zmiana kalendarza w manifeście księgi |
| Panele jako osobne pliki na wspólnym folderze | prostota, brak serwera | osadzenie w jednej aplikacji później |

## 12. Z dawnych dokumentów (archiwum): bierzemy / nie bierzemy

**Bierzemy:** trzy poziomy konfliktów (bezpośredni, logiczny, statystyczny), klasyfikację wariantów nazwisk (pisownia, panieńskie, zamężne, wdowie), format dat (dokładna, około, przed, po, zakres), formularze z konfiguracji (`templates-config.js`), skróty genealogiczne (`l.`, `m.`, `t.`, `d.`, `kaw.`, `wd.`, `zd.`), ideę proweniencji (skąd wartość: odczyt / wpis / obliczone / ze słownika).

**Nie bierzemy:** Supabase/Firestore jako bazy głównej, Electron/SQLite jako wymogu, hipotez i teorii (za wcześnie), wag wiarygodności z liczbami (brak danych do kalibracji), tabeli „zabór rosyjski = kalendarz juliański” (niezgodna z praktyką akt parafii w Królestwie Polskim), numeracji wersji (ACTA v1, ACTACOM v3, v5, v7.1, v8.21, v6 to nie jest jeden ciąg).

## 13. Ryzyka

- **Zakres:** tryb weryfikacji to największa zmiana. Zaczynać od jednej księgi (np. zgony 1873, 50 wierszy w indeksie) i dopiero potem skalować.
- **Pliki zamiast bazy:** dziennik zmian rośnie. Rozwiązanie: migawka co N zmian, archiwizacja dziennika.
- **Jakość skanów:** część aktów (np. początek ksiąg z 1783 r.) ma tekst przebijający i zlewający się. Lepszy skan z archiwum zmienia więcej niż jakikolwiek filtr.
- **Jedna osoba pracuje:** dlatego „zweryfikowany” oznacza „sprawdzony na skanie”, a nie „zatwierdzony przez drugą osobę”. Jeśli dojdzie druga osoba, wystarczy dodać pole `sprawdzil`.

## 14. Najbliższe kroki

1. Zaczynam od pkt 10.1 (tryb weryfikacji) na zgonach 1873 jako próbce. Do tego potrzebuję skanów tej księgi, jeśli masz więcej niż jedną stronę.
2. Potem pkt 10.2 (ROI w układzie oryginału), bo bez tego prostowanie niszczy ramki.
3. Zapis zmian w repo po każdym kroku (v6 w `public/v6/`).
