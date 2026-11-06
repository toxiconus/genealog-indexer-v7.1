# Rejestr skanów tabel likwidacyjnych (Blinów / Brzozówka)

Plik `TABELE_LIKWIDACYJNE_REJESTR_SKANOW.csv`: jeden wiersz = jeden skan z szukajwarchiwach.gov.pl.
Skan identyfikuje nazwa pliku `35_168_0_6_<sygnatura>_<nr skanu>_<id skanu>.jpg` — wystarczy sprawdzić **sygnaturę + nr skanu** (lub id skanu).
Przed dodaniem nowych skanów: porównać nazwy plików z kolumną `plik`/`id_skanu_szukajwarchiwach`; już odczytane (status „odczytany") pomijać.
Nowe jednostki: dopisać wiersze ze statusem „do odczytu", po odczycie zmienić status i wpisać liczbę wierszy.

Stan: sygn. 1054 (Blinów) — skany 1–29 odczytane. Sygn. 1067 (Brzozówka I-II, gm. Brzozówka, 1867–1932) — 16 skanów, do odczytu. Sygn. 1126 (Mocydła, pow. Janów, 5 skanów, maszynopis polski z lat 20.) — do odczytu. Kolejne jednostki — do uzupełnienia po wklejeniu listy z szukajwarchiwach.


## Pliki
- `TABELE_LIKWIDACYJNE_REJESTR_JEDNOSTEK.csv` — jedna jednostka = jeden wiersz: archiwum, zespół, sygnatura, miejscowość/zawartość, rodzaj dokumentu, status.
- `TABELE_LIKWIDACYJNE_REJESTR_SKANOW.csv` — jeden skan = jeden wiersz.
- Uwaga: zespół 44 AP Radom (sygn. 2667, dobra Brzozówka 1815–1829) to nie tabele likwidacyjne; może dotyczyć innej Brzozówki — do weryfikacji.
