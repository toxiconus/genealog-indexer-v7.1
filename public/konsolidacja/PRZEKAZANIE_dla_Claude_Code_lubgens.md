# Przekazanie dla Claude Code: wyszukiwanie w Lubgens (Pudło, Kopiwoda, Bucoń)

Plik jest samodzielny. Opisuje cel, to co już ustalono, co jest na dysku i co trzeba zebrać.
Repo jest PUBLICZNE: nie wpisuj tu danych osobowych z drzewa GED, tylko dane archiwalne (akty, indeksy).

## 1. Cel
Ustalić pochodzenie i powiązania rodów **Pudło** i **Kopiwoda** (oraz **Bucoń**) z Brzozówki
(parafia Blinów, wcześniej prawdopodobnie Biała / Janów Lubelski), przez:
- zebranie wszystkich wpisów tych nazwisk z bazy Lubgens (Lubelskie Korzenie) dla parafii sąsiednich,
- zestawienie ich z naszym indeksem chrztów/ślubów/zgonów Blinowa i tabelą likwidacyjną Brzozówki 1865,
- zbudowanie tabeli pokoleń: kto z kim, gdzie, kiedy (wieś, rodzice, małżonkowie, chrzestni).

## 2. Co już ustalono (nie powtarzaj)
- **Kopiwoda**: w parafii Janów Lubelski (Biała) mieszkają w Krzemieniu od 1661 r. (Sebastian, rodzice Tomasz i Zofia).
  Kandydaci na przodków: Łukasz ur. 1750 Krzemień (rodzice Stanisław i Jadwiga). Łukasz Kopiwoda z żoną Elżbietą
  mieszka w Majdanie od 1783 r. (chrzest Franciszki, nr 1783/6 w Blinowie); to hipoteza, że jest to ten sam Łukasz.
  W Blinowie jest też często chrzestnym w Majdanie (1784–1785).
- **Bucoń**: w Biała tylko ok. 9 wpisów: Łążek i Brzozówka (1815–1856). W Majdanie (Blinów) 1783–1785 trzy rodziny Buconiów
  (Bartłomiej+Zofia, Kazimierz+Zofia, Wojciech+Agnieszka). „Buconiowa" w tabeli 1865 może być wdową po Buconiu.
  Marianna Bucoń z d. Bąk, żona Wojciecha, zm. 1825 (Brzozówka/Łążek).
- **Pudło**: w Biała od 1658 r. w Godziszowie (nie w Krzemieniu). Dwóch różnych Wawrzyńców Pudło w tabeli 1865:
  nr 11 (ur. 1828, syn Macieja) i nr 31 (ur. 1838, syn Michała).
- Lata 1797–1825 w indeksie chrztów Blinowa to luka; część Brzozówki mogła wtedy należeć do Biała (hipoteza).

## 3. Pliki, które mamy
W repo (public/konsolidacja/):
- `blinow_scalone.csv` — indeks Blinowa (chrzty 1783–1796, 1826–1908 itd.; kol. 14 `kol_14_26_surowe` zawiera chrzestnych).
- `haiku/BRZOZOWKA_projekt_tabeli_1865_3019_skany_4-11_odczyt_reczny.csv` — odczyt tabeli likwidacyjnej Brzozówki 1865.
- `haiku/PUDLO_KOPIWODA_Brzozowka_ustalenia.md` — ustalenia o rodach.
- `skrypty/osoby_dopasowanie.py` — dopasowanie osób (warianty nazwisk, imion, cyrylica).
Na dysku J:\Genealog\ (u mnie, nie w repo):
- `Blinów, św. Jana Chrzciciela\Blinów - lubgens\BLIN\CH\Liber natorum-urodzonych 1783-1797\` — 64 skany (blinow_ln-1..64.jpg).
- `...\BLIN\ZG\` — zgony Blinowa 1797–1825 (xlsx i skany).
- `Kopiwoda.ods`, `arkusze osobowe*.ods`, plik GED (prywatny) — nie kopiuj do repo.

## 4. Do zrobienia — Lubgens
Wyszukiwarka: https://lubgens.pl (Wyszukiwarka danych z bazy). Użyj mojej zalogowanej przeglądarki.
Na komputerze nie ma limitu 500 wyników (limit dotyczy widoku na telefonie).
1. Parafia **Janów Lubelski (Biała)**: nazwiska `Kopiw`, `Kopiwodz`, `Pudło` (dokładnie) i `Pudl`, `Buco`, `Buczo`, `Buczon`.
   Osobno urodzenia, małżeństwa, zgony; lata 1740–1920. Pomiń Pudełko, Pudlik, Pudiszak, Pudelski.
2. To samo dla parafii sąsiednich: **Batorz, Modliborzyce, Dzwola, Godziszów, Kraśnik, Szastarka (USC), Majdan Sopocki,
   Majdan Stary**, a także **Blinów** (żeby porównać z naszym indeksem i znaleźć braki w latach 1797–1825).
3. Jeśli w którejś parafii jest dużo wpisów, wykonaj zapytania w przedziałach lat i połącz.
4. Dla Kopiwodów z Krzemienia (1740–1800): zapisz pełne UWAGI (rodzice, miejscowość, chrzestni).

## 5. Format wyniku
- Folder: `J:\Genealog\Lubgens_wyniki\<parafia>\`.
- CSV UTF-8 z BOM, separator średnik, kolumny jak w wyszukiwarce (NAZWISKO; IMIĘ; PARAFIA; AKT; ROK; UWAGI;
  dla ślubów nazwisko/imię męża i żony). Nazwy: `<nazwisko>_<urodzenia|malzenstwa|zgony>.csv`.
- `POLECENIA.md`: lista zapytań, parametry, liczba wyników, data i godzina.
- `KRZEMIEN_LAZEK_BRZOZOWKA.csv`: wiersze z UWAGAMI zawierającymi Krzemień, Łążek, Brzozówka, Majdan, Godziszów,
  Kawęczyn, Bory, Andrzejów.
- Zapisuj dosłownie, bez poprawiania i interpretacji. Nie edytuj istniejących plików.

## 6. Zasady
- Jedno zapytanie na raz, z kilkusekundową przerwą. Nie obchodź zabezpieczeń.
- Nie wpisuj do repo danych z GED ani informacji o osobach żyjących.
- Po zakończeniu: podaj liczbę wierszy w każdym pliku i które zapytania dały pusty lub ucięty wynik.
