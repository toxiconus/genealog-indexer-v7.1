# Analiza pracy genealoga na pliku chrztów (Blinów 1783–1908)

Data: 2026-10-24. Plik: `chrzty — kopia.csv` (archiwum z dysku J:). Test: import i praca w Genealog v6, na prawdziwych danych. Skanów tego pliku nie czytałem, bo ich w nim nie ma. Weryfikację ze skanem opisuję jako krok, a nie jako wykonaną.

## 1. Co jest w pliku (policzone)

- 7727 wierszy, 5 kolumn tabulatorem: NAZWISKO, IMIĘ, AKT, ROK, UWAGI. Lata 1783–1908 (127 roczników).
- **Kodowanie Windows-1250**, nie UTF-8. Odczyt jako UTF-8 psuje ogonki i nagłówek `IMIĘ`.
- UWAGI w 6916 wierszach mają wzorzec `Miejscowość, O: ojciec, M: matka`. 628 wierszy to samo `nr karty N` (wpis tylko z indeksu), 159 ma inny zapis, 24 są nieregularne.
- Kolumna AKT nie zawsze jest numerem aktu. W latach 1783–1794 to numer karty (wspólny dla kilku dzieci), w latach 1797–1816 nazwa miesiąca (`listop.`, `stycz.`), od 1827 numer aktu.
- Jeden wiersz ma przesunięte kolumny (Markiewicz, 1891).

## 2. Kroki, które wykonuję jako genealog

1. **Oceniam źródło przed wprowadzeniem:** kodowanie, liczba kolumn, zakres lat, co znaczy AKT w każdym okresie, które wiersze są tylko z indeksu.
2. **Importuję partiami, z mapowaniem kolumn.** Sprawdzam liczbę wierszy, dodanych i pominiętych. Pominięcia traktuję jak sygnał ostrzegawczy, bo mogą ukrywać różne osoby.
3. **Rozbijam uwagi na pola:** miejscowość, imię i wiek ojca, imię, nazwisko i wiek matki. Oryginalny zapis zostaje w uwagach oryginalnych.
4. **Porównuję ze skanem.** Rekordy przechodzą przez status „Do sprawdzenia”, a pola niepewne dostają „?”. Wiek zapisuję jako `~RRRR` z surowym tekstem w notatkach.
5. **Porównuję z drugim źródłem** (indeks internetowy lub własna baza) po roku i numerze aktu. Różnice zatwierdzam ręcznie, nic nie zmienia się samo.
6. **Kontrola:** duplikaty, przeskoki numeracji, wiek rodziców poza zakresem, braki w polach wymaganych.
7. **Eksport** z zachowaniem oznaczeń niepewności oraz kopia zapasowa.

## 3. Co mi pomogło (w v6)

- Mapowanie kolumn z automatycznym rozpoznaniem nagłówków i pamięcią mapowania.
- Raport importu z liczbą dodanych i pominiętych wierszy. To on ujawnił błąd z punktu 4.
- Kontrola przeskoków numeracji i wieku rodziców.
- Status rekordu, znacznik „?” przy polu, podpowiedź `l.38 → ~rok`, podpowiedzi imion historycznych (Joannes → Jan).
- Nowe: **Porównanie** z innym źródłem i duplikaty z przejściem do rekordu.

## 4. Co przeszkadzało i zostało naprawione tego dnia

| Problem | Skutek | Naprawa |
|---|---|---|
| Plik odczytywany jako UTF-8 | Zepsute ogonki, kolumna IMIĘ niezmapowana | Wykrywanie UTF-8, a przy błędnych bajtach Windows-1250 |
| Duplikat = rok + numer + nazwisko | 90 różnych dzieci pominiętych jako „duplikaty” (rodzeństwo na jednej karcie) | Klucz zawiera też imię i uwagi: import wczytuje 7727 z 7727 |
| Porównanie dopasowywało po roku i numerze | Pomyłki przy numerze karty wspólnym dla kilku dzieci | Przy wielu kandydatach rozstrzyga imię, a gdy się nie da, wiersz jest „niejednoznaczny” i pomijany |

## 5. Czego nadal brakuje (kolejność wg zysku)

1. **Automatyczne rozbijanie UWAGI na pola.** Wzorzec `Miejscowość, O: … l.N, M: … l.N` obejmuje 6916 z 7727 wierszy (ok. 90%). Każdy z nich wymaga dziś ręcznego przepisania 5–7 pól. Reguły do ustalenia: „z Wcisłów” to nazwisko panieńskie matki, `lat N` i `l.N` to wiek, a nazwisko ojca wyprowadzam z nazwiska dziecka tylko po potwierdzeniu, bo dla córek forma różni się (Białkowska/Białkowski). Nieregularne wiersze (24) zostają do ręcznej obróbki.
2. **Znaczenie kolumny AKT zależne od okresu:** pole „numer karty” i pole „miesiąc” zamiast jednego „numeru aktu”.
3. **Wpisy tylko z indeksu (628):** osobny status „tylko indeks”, żeby nie liczyły się jako braki.
4. **Wiersz z przesuniętymi kolumnami** wykrywać przy imporcie (rok nie jest liczbą).
5. **Widok pracy po rocznikach** (filtr roku, licznik do końca rocznika).

## 6. Zasady, których się trzymam

Nie poprawiam nazwisk bez pewności. Odczyt AI to propozycja, nie fakt. Surowy zapis zawsze zostaje w uwagach oryginalnych. Nic nie jest kasowane ani nadpisywane bez zatwierdzenia.
