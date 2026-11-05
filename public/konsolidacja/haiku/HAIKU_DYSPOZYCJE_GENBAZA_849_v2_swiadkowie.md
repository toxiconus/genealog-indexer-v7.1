# Dyspozycje v2 – GenBaza 849, akty urodzenia 1896–97: świadkowie i chrzestni (odczyt po kawałkach)

Poprzedni odczyt (czesc_A..E) nie rozczytał świadków ani chrzestnych, bo skany były czytane w całości. Teraz skany są pocięte na kawałki z powiększeniem: `/home/claude/genbaza_849/crops/NN_<L|P><1|2|3>.png` (NN = numer skanu 01–15; L = lewa strona, P = prawa; 1/2/3 = góra/środek/dół z zakładką 10%). Pełne skany: `/home/claude/genbaza_849/NN_*.jpg`.

## Jak wygląda akt (rosyjski, ok. 10 wierszy rękopisu)
Na lewym marginesie: numer aktu, miejscowość, nazwisko i imię dziecka. W treści, w tej kolejności:
1. „Состоялось в селе Блинове … [data juliańska (gregoriańska)] … 189x года в … часов …” – data zapisu.
2. „Явился [OJCIEC/ZGŁASZAJĄCY imię nazwisko] [wiek] лет, земледелец, проживающий в …, в присутствии [ŚWIADEK 1 imię nazwisko] [wiek] и [ŚWIADEK 2 imię nazwisko] [wiek] лет, … земледельцев …” – tu są świadkowie aktu z wiekiem.
3. „… и предъявил нам младенца мужеского/женского пола, объявив, что он/она родился/родилась в … [data urodzenia] … от законной его жены [MATKA imię] урожденной [nazwisko panieńskie] [wiek] лет.”
4. „Младенцу при святом крещении … дано имя [IMIĘ DZIECKA], а восприемниками его были [CHRZESTNY imię nazwisko] и [CHRZESTNA imię nazwisko].” – chrzestni.
5. Podpis księdza na końcu (np. „К. В. Сольницкій”-podobny).

Polskie wersje imion i nazwisk często stoją w nawiasie łacinką (np. „(Wojciech Dobrzyk)”) – przepisuj je dokładnie, to najpewniejsze.

## Zadanie
Dla każdego aktu na swoich skanach odczytaj WSZYSTKO z poniższej listy, czytając wiersz po wierszu na kawałkach (zacznij od `NN_L1`, `NN_P1` itd.; ten sam akt może być na dwóch kawałkach – złóż go). Zapisz plik CSV `/home/claude/genbaza_849/czesc2_<litera>.csv` (separator `;`, UTF-8). **Wiersz = jeden akt; dokładnie 25 kolumn; w żadnym polu nie używaj średnika (zamień na ` / `) ani nowej linii.**

Kolumny (nagłówek dokładnie taki): `plik;nr;rok_z_tekstu;data_aktu;data_urodzenia;data_chrztu;miejscowosc;dziecko_imie;plec;ojciec_imie;ojciec_nazwisko;ojciec_wiek;matka_imie;matka_nazwisko_panienskie;matka_wiek;zglaszajacy;swiadek1;swiadek2;chrzestny1;chrzestny2;ksiadz;uwagi;baza_id;zgodnosc_z_baza;pewnosc`

- Wiek zawsze osobno jako liczba (np. 40); imię i nazwisko osobno przy ojcu i matce; `zglaszajacy`, `swiadek1/2`, `chrzestny1/2` = „Imię Nazwisko (wiek)” w polskiej formie (jeśli jest nawias łacinką – z niego).
- Gdzie niepewne dodaj `?`, nieczytelne `[niecz.]` – nie zgaduj, ale **próbuj**: zmień kawałek (sąsiedni kawałek, pełny skan) i przeczytaj jeszcze raz, zanim wpiszesz `[niecz.]`.
- Rok odczytaj z tekstu (słowami: „девяносто шестого” = 1896, „девяносто седьмого” = 1897) lub z nagłówka; nazwy plików 11–15 mylą (te akty są z 1897).
- Daty: zapisz w formie `15 (27) IV` (juliańska i w nawiasie gregoriańska).
- `baza_id` / `zgodnosc_z_baza`: porównaj z wierszem `blinow_akty.csv` (public/konsolidacja/, ten sam `rok` i `nr`; nazwiska muszą pasować, w razie wątpliwości sprawdź drugi rok). `zgodnosc_z_baza` = `zgodny` lub krótka lista rozbieżności bez średników.
- `pewnosc`: wysoka / średnia / niska.
- Nie zmieniaj plików w repo ani w bazie. Na końcu jedno zdanie: ile aktów, ile pól świadków/chrzestnych udało się odczytać.
