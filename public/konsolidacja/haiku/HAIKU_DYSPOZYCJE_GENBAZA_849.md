# Dyspozycje dla Haiku – akty urodzenia Blinów 1896–1897 (GenBaza, księga Blinow_849, 1886–1908)

Skany: `/home/claude/genbaza_849/NN_*.jpg` (rozkładówki; pisane po rosyjsku cyrylicą, polskie nazwiska często dopisane łacinką w nawiasach). Baza porównawcza: `public/konsolidacja/blinow_akty.csv` (kolumny: id;rok;nr;dziecko_nazwisko;dziecko_imiona;miejscowosc;ojciec_imiona;ojciec_nazwisko;ojciec_wiek;matka_imiona;matka_nazwisko;matka_wiek;uwagi;…).

## Zadanie
Dla każdego aktu na swoich skanach (numer aktu stoi na lewym marginesie: „№ 22 / miejscowość / dziecko") odczytaj dane i zapisz wiersz CSV (separator `;`, UTF-8, nagłówek poniżej) do pliku `/home/claude/genbaza_849/czesc_<litera>.csv`.

Powiększaj fragmenty (PIL: crop + resize x2) i czytaj po 2–3 akty naraz. Nie zgaduj: gdzie pismo jest nieczytelne wpisz `[niecz.]`, gdzie niepewne dodaj `?`. Pole puste = brak w akcie.

Kolumny: `plik;nr;rok_z_tekstu;data_aktu;data_urodzenia;data_chrztu;miejscowosc;dziecko_imie;plec;ojciec_imie;ojciec_nazwisko;ojciec_wiek;matka_imie;matka_nazwisko_panienskie;matka_wiek;zglaszajacy;swiadek1;swiadek2;chrzestny1;chrzestny2;ksiadz;uwagi;baza_id;zgodnosc_z_baza;pewnosc`

- Rok czytaj z tekstu aktu (słowami: „девяносто шестого” = 1896, „девяносто седьмого” = 1897); nazwa pliku może się mylić.
- Daty w aktach są podwójne: styl rosyjski (juliański) i w nawiasie gregoriański – zapisz oba w formie `15 (27) IV`.
- `zglaszajacy` – kto się stawił (zwykle ojciec; imię, nazwisko, wiek). `swiadek1/2` – świadkowie obecni przy spisaniu aktu (imię nazwisko, wiek). `chrzestny1/2` – восприемники (rodzice chrzestni). Pisz polskie formy imion (Wojciech, Walenty, Zofia…), nazwiska z nawiasów łacinką bierz tak, jak są napisane.
- `baza_id` / `zgodnosc_z_baza`: znajdź w `blinow_akty.csv` wiersz o tym samym `rok` i `nr`. Jeżeli nazwiska nie pasują, sprawdź drugi rok (1896/1897) – numeracja zaczyna się co roku od 1. `zgodnosc_z_baza` = `zgodny` albo lista rozbieżności, np. `matka_nazwisko: baza Smyl / skan Smyk`; `brak w bazie` gdy brak wiersza.
- `pewnosc`: wysoka / średnia / niska.
- Nie zmieniaj plików w repo, nie poprawiaj bazy – tylko raport.
- Na końcu odpisz jednym zdaniem: ile aktów odczytano, ile rozbieżności z bazą.
