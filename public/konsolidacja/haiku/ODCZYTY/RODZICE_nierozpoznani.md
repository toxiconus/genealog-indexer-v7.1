# Rodzice nierozpoznani przez builder (parents / parents_pl)

Data: 2026-11-10. Tylko analiza, bez zmian w słownikach i w kodzie.

## Metoda

- Skrypt: `/tmp/claude-0/-home-claude/98dd8170-cf13-5431-a6d5-7a8da626defc/scratchpad/nierozp_rodzice.py` (poza repo).
- Funkcje `parents`, `parents_pl`, `psur`, `fold`, `addm` oraz przypisania `GEN`, `PGEN` wyciągnięte z `narzedzia/buduj_baza_v4.py` przez `ast`; builder nie jest uruchamiany.
- `MALE` zbudowane jak w builderze: `zgony.csv` (plec=m) plus `ojciec_nazwisko` z `blinow_akty.csv`, przez `addm`.
- Wejścia: `haiku/ODCZYTY/*_dom_przyczyny.csv` oraz `haiku/ODCZYTY/lm/*.csv`. Wiersze bez nazwiska i imienia są pomijane tak jak w builderze.
- Numer wiersza = numer fizyczny w pliku (nagłówek = wiersz 1).

## Liczby

| Pozycja | Liczba |
|---|---|
| Wierszy przetworzonych (nazwisko lub imię niepuste) | 679 |
| Niepuste `rodzice` | 252 |
| Rozpoznane (`parents` lub `parents_pl` zwraca wynik) | 246 |
| Nierozpoznane (obie zwracają `{}`) | 6 |

## Tabela nierozpoznanych

| plik | wiersz | rok | nr_wpisu_DB | nazwisko | imię | rodzice (wartość) | hipoteza | propozycja |
|---|---|---|---|---|---|---|---|---|
| haiku/ODCZYTY/blinow_zgony_1803-1806_Blinow_dom_przyczyny.csv | 18 | 1804 | 172 | Stępniowa | Justyna | wdowa | pole zawiera stan cywilny, a nie rodziców | zostawić w parents_raw; poprawić odczyt (stan = wdowa) |
| haiku/ODCZYTY/blinow_zgony_1803-1806_Blinow_dom_przyczyny.csv | 40 | 1805 | 194 | Pcionkowa | Jadwiga | żona Pciona/Pcionka | pole zawiera małżonka, a nie rodziców | zostawić w parents_raw; poprawić odczyt (małżonek w uwagach) |
| haiku/ODCZYTY/lm/lm-30.csv | 6 | 1803 | 686 | Białkowska | Sophia | filia Mathiae Białkowski | `parents()` nie obsługuje prefiksu „filia”; w `parents_pl()` „Mathiae” nie jest w PGEN, choć jest w GEN (`mathiae` → Maciej) | błąd w kodzie, nie w słowniku: dodać obsługę prefiksu „filia” (jak syn/córka) w `parents()`; wtedy wynik z GEN |
| haiku/ODCZYTY/lm/lm-30.csv | 21 | 1804 | 701 | Grudzień | Helisabeth | wdowa, agricola | stan i zawód w polu rodziców, brak imion rodziców | zostawić w parents_raw; poprawić odczyt (stan = wdowa, zawód = agricola) |
| haiku/ODCZYTY/lm/lm-36.csv | 5 | 1819 | 848 | Bigos | Marianna | Andrzeja? i Katarzyny Bigosów | znak `?` przyklejony do imienia ojca; `parents_pl()` szuka klucza `andrzeja?`, a nie `andrzeja` (w PGEN jest) | błąd w kodzie: zdjąć `?()` z imienia przed wyszukaniem w PGEN; słownik bez zmian |
| haiku/ODCZYTY/lm/lm-41.csv | 21 | 1820 | 965 | Wieleba? | Marianna | Nowak(?) i Tekli Wielebów | imię ojca nieodczytane, w polu jest nazwisko „Nowak”; w akcie niepewne (wpis w DB: Wieleba) | zostawić w parents_raw; nie dopisywać „nowak” do słownika (to nazwisko, nie imię) |

Uwagi do tabeli:
- Wiersz 6 z lm-30 i wiersz 5 z lm-36 dają się rozpoznać po drobnej zmianie kodu, bez wpisu w słowniku.
- Trzy z sześciu wierszy (wdowa, żona, wdowa/agricola) to dane w złej kolumnie. Ich rozpoznanie nie jest możliwe i nie jest potrzebne; naprawa leży w odczycie.
- Wiersze z niepustym `rodzice` bez nazwiska i imienia nie są liczone (builder ich nie przetwarza).

## Propozycje dopisków do slowniki_imion.json (GEN / PGEN)

Brak. Żaden z sześciu wierszy nie wymaga nowego klucza:

| słownik | klucz | imię | status |
|---|---|---|---|
| GEN | (brak) | (brak) | `mathiae` już istnieje; problemem jest prefiks „filia” |
| PGEN | (brak) | (brak) | `andrzeja` już istnieje; problemem jest `?` w wartości |

Zmiany do rozważenia są w kodzie buildera (nie w słowniku):
1. `parents()`: zdjąć prefiks `filia|syn|córka|dziecko` przed dopasowaniem (jak robi to `parents_pl()`).
2. `parents()` i `parents_pl()`: zdjąć `?()` z pierwszego tokenu przed `.lower()` i wyszukaniem w słowniku.

Po wdrożeniu obu zmian rozpoznane powinny być 2 z 6 wierszy (lm-30 ur. 686 i lm-36 ur. 848). Pozostałe 4 zostają w `parents_raw` (wpis z błędną kolumną lub nieodczytane imię ojca).
