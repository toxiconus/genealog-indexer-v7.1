# Dyspozycje dla Haiku – tabele likwidacyjne (AP Lublin, zespół 168, sygn. 1054, Blinów/Brzozówka, pow. janowski)

Skany: `/home/claude/tablice_1054/35_168_0_6_1054_<N>_<id>.jpg` (N = numer skanu 1–29). Skan 1 = karta ewidencyjna, 3 = okładka („Blinów”), pozostałe = rozkładówki: lewa strona to drukowana tabela po rosyjsku z ręcznie wpisanymi nazwiskami gospodarzy, prawa to rubryki serwitutów i uwag (często puste). Dokument: tabele likwidacji serwitutów po ukazie z 19 II (2 III) 1864 – lista gospodarstw włościan (gospodarz, grunty, wymiar powinności).

## Zadanie
Dla każdego wiersza tabeli na swoich skanach zapisz rekord CSV (separator `;`, UTF-8) do `/home/claude/genbaza_849/../tablice_1054/czesc_<litera>.csv`, czyli `/home/claude/tablice_1054/czesc_<litera>.csv`.

Powiększaj fragmenty (PIL: crop + resize x2), czytaj po 8–10 wierszy naraz. Cyrylicę zapisuj w polskiej transkrypcji (Кендзера Матвей → Kędzior Mateusz; Куръчакъ Викентій → Kurczak Wincenty; Павлосекъ Адамъ → Pawłosek Adam). Gdzie pismo niepewne dodaj `?`, nieczytelne `[niecz.]`. Nie zgaduj liczb – lepiej `[niecz.]`.

Kolumny: `skan;strona_ksiegi;dzial;wies;lp;nr_w_tabeli;gospodarz_pl;gospodarz_oryg;uwaga_przy_nazwisku;zabud_m;zabud_p;rola_m;rola_p;laki_m;laki_p;pastw_m;pastw_p;nieuz_m;nieuz_p;razem_m;razem_p;powinnosc_rub;powinnosc_kop;serwituty;uwagi;pewnosc`

- `lp` – kolumna „по порядку” (lewa), `nr_w_tabeli` – „по проекту ликвидационной табели”. Wiersz ze znakiem „—” w pierwszej kolumnie zapisz z `lp` = `-`.
- `dzial` – nagłówek sekcji nad wierszem (np. „I – gospodarstwa przechodzące na własność włościan na podstawie ukazów 19 II (2 III) 1864”, „II – osady podwórników”); wpisuj ten sam do kolejnych wierszy do zmiany.
- `wies` – nazwa wsi z nagłówka strony/sekcji (Blinów, Brzozówka itd.), jeśli podana; inaczej puste.
- `uwaga_przy_nazwisku` – np. „wdowa” (Вдова), „ten sam” itp.
- `m`/`p` = morgi/pręty (моргъ/прутъ); kolumny gruntów: pod zabudowaniem i ogrodem, pod rolą, pod łąkami, pod pastwiskami, nieużytki, razem.
- `powinnosc_*` – wymiar powinności w rublach i kopiejkach (jeśli rubryka na rozkładówce jest ucięta, zapisz tylko to, co widać).
- `serwituty` i `uwagi` – prawa strona rozkładówki (Примѣчанія); przepisuj dosłownie lub `[niecz.]`; puste = puste.
- Wpisy czerwonym atramentem lub dopiski ołówkiem zaznacz w `uwagi` jako `[czerwony]` / `[ołówek]`.
- Skany bez tabeli (okładki, karty tytułowe, spisy) opisz jednym wierszem z `gospodarz_pl` puste i opisem w `uwagi`.
- Nie zmieniaj niczego w repo, tylko raport. Na końcu odpisz jednym zdaniem: ile wierszy odczytano, jakie wsie/działy wystąpiły, co było nieczytelne.
