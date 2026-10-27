# Dyspozycje dla Haiku – nowy rocznik (dużo stron skanów)

Najpierw przeczytaj `HAIKU_ZALOZENIA.md` (zasady odczytu, ID, ROI, formaty) – obowiązuje bez zmian. Poniżej tylko to, co dochodzi przy dużej liczbie stron.

## 0. Oszczędzanie tokenów (obowiązkowe)
- Każdą stronę oglądasz RAZ. Odczyt zapisz do plików wynikowych od razu po stronie (dopisywanie, jak w poprzednim roczniku), potem nie wracaj do niej i nie odczytuj plików wynikowych z powrotem.
- Nie powtarzaj w odpowiedziach treści aktów – wynik idzie do plików, w czacie tylko jedno zdanie na stronę (np. „str. 3: akty 12–15 zapisane, skan zapisany”).
- Skany kopiuj poleceniem plikowym (cp/copy), nie przez ponowne wczytywanie obrazu. Nie czytaj ponownie zapisanych skanów.
- Wątpliwe miejsca tylko oznacz (`?`, `[nieczytelne]`, pole uwag) – nie rozwiązuj ich drugim podejściem; sprawdzi je człowiek/Sonnet na samym fragmencie (ROI), nie na całej stronie.

## A. Kolejność pracy (strona po stronie)
1. Zrób listę wszystkich stron w paczce (nazwa pliku wejściowego, kolejność). Nie pomijaj żadnej – także stron z indeksem, pustych, z przekreśleniami.
2. Dla KAŻDEJ strony po obejrzeniu ustal: rok, zakres numerów aktów (od–do), czy to strona aktów, indeksu (skorowidz), protokołu/rejestru, czy początek następnego roku.
3. Odczytaj akty ze strony (zasady z HAIKU_ZALOZENIA), zapisz do plików wynikowych (`*_import.csv`, `*_pelny_tekst.md`, `*_roi.json`, `*_pola.json`, `*_rejestr.json`) – dopisuj po każdej stronie, nie na końcu (przy przerwaniu nic nie przepadnie).
4. DOPIERO po zapisaniu odczytu danej strony skopiuj ją do folderu docelowego pod nową nazwą (pkt B). Plik wejściowy zostaw bez zmian.
5. Na końcu zrób `PRZESYLKA_<rok>.md`: tabela: nazwa oryginalna → nazwa nowa → zakres aktów → uwagi (nieczytelne, brak strony, strona odwrócona).

## B. Zapis skanów na dysku – nazwy i folder
Folder docelowy (komputer użytkownika):
`J:\Genealog\Blinów, św. Jana Chrzciciela\Blinów - lubgens\BLIN\ZG\Z <ROK>\`
(ZG = zgony; dla urodzeń/małżeństw analogicznie `UR`/`MA` i `U <ROK>`/`M <ROK>`). Jeśli folderu nie ma – utwórz.

Nazwa pliku: `Z<ROK>_<NN>_<opis>.jpg`
- `<NN>` – dwucyfrowy numer kolejny strony w rocznikach (01, 02, …; przy >99 stron trzy cyfry),
- `<opis>` – po podkreśleniach, bez spacji i polskich znaków nie jest wymagane, ale bez `/ \ : * ? " < > |`:
  - akty: `akty_26-27`, `akty_28-31`
  - strona z częścią aktu i indeksem: `akt_64_i_rejestr`
  - indeks/skorowidz: `indeks_A-K`, `rejestr_55-64`
  - protokół początku następnego roku: `protokol_1944_akty_1944-1-2`
  - pusta/okładka: `pusta`, `okladka`
Przykłady (istniejące): `Z1943_01_akty_26-27.jpg`, `Z1943_11_akty_64_i_rejestr.jpg`, `Z1943_12_rejestr_55-64_i_protokol_1944_akty_1944-1-2.jpg`.

Zasady:
- Numeracja ciągła, bez dziur i bez duplikatów; kolejność zgodna z kolejnością w księdze, nie z kolejnością wgrania.
- Nie nadpisuj istniejącego pliku o tej samej nazwie z inną zawartością – dodaj sufiks `_v2` i zgłoś w przesyłce.
- Nie zmniejszaj ani nie kompresuj skanów, nie obracaj (jeśli strona odwrócona – zapisz oryginał i dopisz `_obrocic` w opisie).
- Strony ostatniego indeksu danego roku też zapisz (poprzednio jej brakowało!). Sprawdź, czy liczba plików = liczba stron wejściowych.
- Po zapisie wylistuj folder i porównaj liczbę oraz rozmiary z wejściem; w razie różnic napisz wprost.

## C. Zgodność z narzędziem weryfikacji
Narzędzie szuka skanów po ścieżce z tabeli `SCAN_FILES` w `build_weryfikacja.py` (hash → `Z <ROK>/<nazwa>`). W przesyłce podaj gotową linijkę do wklejenia: `"<hash-oryginału>": "Z <ROK>/Z<ROK>_<NN>_<opis>.jpg"` dla każdej strony, oraz zakres aktów strony (używany do przypisania skanu do aktu).

## D. Czego nie robić
- Nie zgaduj nieczytelnych słów – `[nieczytelne]` / `?` jak w zasadach; odczyty AI to propozycje.
- Nie poprawiaj nazwisk „na pewno” bez pewności; wątpliwe oznacz w polu uwag.
- Nie zmieniaj formatów kolumn CSV (kolejność kolumn jak w `ZGONY_ai1_import.csv`).
- Nie wrzucaj danych drzewa ani Lubgens do repo; skany i wyniki trzymaj poza repo (do repo tylko formaty i narzędzia).

## E. Raport końcowy (krótko, po polsku)
Liczba stron, liczba aktów, lista braków/podejrzeń (numery aktów), lista zapisanych plików, ścieżka folderu.

## Zmiany robocze (2026-10-27)
- Godziny zgonu (death_time) nie są już wymagane ani weryfikowane (pole wyłączone w narzędziu).
- Miejscowości zapisywać w mianowniku (Kaczyniec, Blinów, Brzozówka, Moczydła, Słodków), żonę/męża jako „Imię Nazwisko (żona)” (np. Marianna Pudło), bez „z Pudłów”.
- Nazwisko rodowe kobiety = nazwisko ojca w formie żeńskiej (także dla dzieci); dla chłopców i mężczyzn brak.

## Formaty (obowiązują też Haiku)
- **Wiek:** cyfra + pełna jednostka w poprawnej odmianie: `1 dzień`, `2 dni`, `3 miesiące`, `5 miesięcy`, `2 lata`, `5 lat`, `1 rok 5 miesięcy`; same lata = sama liczba (`73`). Bez skrótów (`mies.`, `m-ce`) i bez liczebników słownych (`dwa dni` → `2 dni`). Niepewne: `?` na końcu.
- **Małżonek:** `Imię Nazwisko` (nazwisko rodowe, forma żeńska dla żon) + znacznik `(owd.)` gdy żyje w chwili zgonu albo `(†)` gdy zmarł wcześniej; kilku: `; `.
- **Daty:** `RRRR-MM-DD`.
