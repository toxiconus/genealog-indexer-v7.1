# Multitool – scalanie osób: propozycje z uzasadnieniem

Kod: `moduly/norm.js`, `moduly/identity.js`, `moduly/wystapienia.js`, `moduly/decyzje.js`. Test: `node test/test_scalanie.mjs` (wynik: `test/wynik_ranking.csv`). Działa w `prototyp/multitool_prototyp.html`.

## 1. Zasady
- Program **nie scala**. Pokazuje parę wystąpień i cztery listy: zgodności, rozbieżności, sprzeczności, braki danych, oraz wniosek słowny. Decyduje użytkownik; decyzja trafia do dziennika i można ją cofnąć.
- **Nie ma liczby punktów.** Wniosek wynika z jawnej tabeli (pkt 4). Kolejność na liście to: wniosek, liczba zgodności rodzinnych, liczba mocnych zgodności, liczba rozbieżności.
- Brak danych nie jest ani zgodnością, ani rozbieżnością. Jest wypisany osobno, żeby było widać, czego szukać.
- Scalenie propozycji innej niż „sprawdź” wymaga wpisania powodu (zostaje w historii).
- Para oznaczona „to różne osoby” nie wraca i blokuje scalenie pośrednie (A=B, B=C, gdy A≠C odrzucono): program odmawia i wskazuje kolidującą decyzję.

## 2. Co porównujemy

| Kryterium | Zgodność | Rozbieżność | Sprzeczność (niemożliwe) | Uwagi |
|---|---|---|---|---|
| Płeć | – | – | różna płeć | płeć z pola, z roli (ojciec, matka) albo z imienia (tylko do porównań) |
| Nazwisko | równe; wariant pisowni; klasa ze słownika | podobne (1 litera), różne | – | pkt 3.1; bez zgodnego nazwiska i imienia para nie jest propozycją |
| Imię | dowolny człon równy po sprowadzeniu do formy polskiej | bliskie (pary mylone), różne | – | pkt 3.2 |
| Rok urodzenia | przedziały się przecinają (mocna, gdy wąskie) | odstęp do 5 lat ponad tolerancję; większy = istotna | – | pkt 3.3; wiek nigdy nie daje sprzeczności |
| Chronologia | ten sam rok zgonu (możliwy podwójny wpis) | – | żyje po zgonie; dziecko urodzone po zgonie (ojciec: ponad rok); dwa zgony w różnych latach; dwa akty chrztu; dorosły przed własnym urodzeniem | pkt 3.5 |
| Ojciec, matka | imię równe (mocna, rodzinna) | bliskie; inne (istotna) | oboje inni, chyba że zgadza się nazwisko rodowe matki | rodzic znany tylko z jednej strony = brak danych |
| Nazwisko rodowe matki | równe lub wariant (mocna, rodzinna) | inne (istotna) | – | |
| Małżonek | imię równe (mocna, rodzinna) | inny (możliwe drugie małżeństwo) | – | |
| Miejscowość | ta sama; prawdopodobnie ta sama | inna (nieistotna: ludzie się przenoszą) | – | pkt 3.4 |
| Numer domu | ten sam numer w tej samej wsi, akty w odstępie do 30 lat (mocna) | – | – | inny numer nic nie znaczy (przenumerowania) |

## 3. Normalizacja

### 3.1 Nazwiska (`kluczNazwiska`, `porNazwiska`)
Dwa klucze liczone obok wartości, wartość w akcie zostaje:
- **k1 (ścisły):** małe litery, bez ogonków, bez końcówek żeńskich `-owa`, `-owna`, `-ówna`, `-anka`, `-onka`, `-ianka`; `-ska/-cka/-dzka` → `-ski/-cki/-dzki`. Równe k1 = „równe”.
- **k2 (dawna pisownia):** dodatkowo y=i, rz=ż=z, ch=h, ó=u=o, `-owski`=`-oski`, ę=en/em, ą=on/om, podwojone litery, `ść`=`ć`, `ks`=`x`, końcowa samogłoska rdzenia. Równe k2 = „wariant pisowni” (Szydłoski / Szydłowski, Kendziora / Kędziora, Suloski / Sulowski, Pscionek / Pcionek, Gręda / Grenda).
- **Słownik klas:** gdy użytkownik zatwierdzi, że dwa zapisy to jedno nazwisko (decyzja `wariant_nazwiska`, np. Pcion ≈ Pcionek ≈ Pścionek), oba klucze trafiają do jednej klasy. Źródłem propozycji klas jest `slownik_nazwisk.csv` (wiersze `wymaga_decyzji=nie` jako propozycje do hurtowego przejrzenia, `tak` pojedynczo). Mcion ↔ Pcion **nie** jest klasą, dopóki nie ma aktu, który to wykaże.
- **Podobne (1 litera różnicy, klucz ≥ 5 liter):** tylko ostrzeżenie „sprawdź na skanie”, nigdy zgodność (Dobrzańska ≠ Dobrzyńska, Kurczak ≠ Kurczuk).
- **Kobiety:** nazwisko mężowskie i rodowe to dwa pola. Porównuje się każde z każdym. Jeśli zgadza się rodowe z rodowym albo nazwisko z rodowym, to zgodność. Jeśli jedyne, co można zestawić, to mężowskie z rodowym i są różne, wynik to „nie da się porównać” (brak danych), nie rozbieżność.
- `-ina/-yna` nie są obcinane automatycznie (Kalina, Malina to nazwiska podstawowe); obsługuje je słownik form z buildera (`MALE`).

### 3.2 Imiona (`kluczImienia`, `porImiona`)
- Słownik form: łacina i dawna pisownia → dzisiejsze polskie (Adalbertus, Woyciech → Wojciech; Hiacynt → Jacek; Jędrzej → Andrzej; Maryanna → Marianna). Docelowo jeden słownik z `NPL`, `GEN`, `PGEN` (builder) i `data/imiona_wszystkie.json`.
- Imiona podwójne: wystarczy zgodność jednego członu (Jan Nepomucen = Jan).
- **Pary mylone** (Maciej / Mateusz, Maria / Marianna, Stefan / Szczepan, Stefan / Stanisław, Łucja / Łukasz, Józef / Józefat): wynik „bliskie” = rozbieżność istotna z dopiskiem, nigdy równość. To są dokładnie przypadki z listy konfliktów odczytu (nr 405, nr 113).

### 3.3 Wiek niedokładny (`przedzialUr`)
Wiek z aktu daje **przedział** roku urodzenia, nie rok:

| Wiek | Tolerancja |
|---|---|
| poniżej 1 roku (dni, tygodnie, miesiące) | 0 (rok aktu lub poprzedni) |
| 1–9 | ±1 |
| 10–24 | ±2 |
| 25–44 | ±4 |
| 45–64 | ±6 |
| 65 i więcej | ±9 |
| wiek „okrągły” od 30 lat: pełne dziesiątki / piątki | dodatkowo +2 / +1 |

Akt chrztu daje przedział [rok−1, rok]. Rok z oznaczeniem „około” daje ±4. Dwa przedziały, które się przecinają, to zgodność; „mocna” tylko gdy oba są wąskie. Odstęp do 5 lat to rozbieżność zwykła, większy to istotna. Wiek bez jednostki = lata. Wiek z `?` jest używany, ale zgodność dostaje dopisek „wiek niepewny” (do zrobienia w `identity.js`).

### 3.4 Miejscowości (`kluczMiejsca`, `porMiejsca`)
- Słownik miejsc: `{id, nazwa dzisiejsza, warianty z dokumentów, lata}`. Nazwa z aktu zostaje w polu, klucz jest obok.
- Warianty zapisu: Mocydła, Moczyda, Moczydło → Moczydła; Brzozzówka → Brzozówka; Kacyniec → Kaczyniec.
- Nazwy niejednoznaczne: samo „Majdan” może być Majdanem Moczydeł lub Blinowskim. Wynik „prawdopodobnie ta sama” (zgodność słaba), a rozstrzygnięcie to decyzja `miejsce` użytkownika, nie automat.
- Zmiana nazwy lub podział wsi w czasie: wpis słownika ma zakres lat; dwa zapisy są „równe” tylko w latach, gdy oznaczały to samo. Nie łączymy miejscowości po samym podobieństwie nazw.
- Inna miejscowość nigdy nie jest sprzecznością.

### 3.5 Chronologia
Z każdego wystąpienia wynikają fakty o życiu: `zmarły` → rok zgonu; ojciec, matka, państwo młodzi, świadkowie, chrzestni → żyje w roku aktu; rodzic w akcie chrztu → dziecko urodzone w tym roku. Rodzice w akcie ślubu i zgonu nie liczą się jako żyjący (akt tego nie przesądza). Sprzeczność powstaje, gdy fakty jednej strony wykluczają fakty drugiej. To najskuteczniejsze reguły w teście (pkt 5).

## 4. Wniosek (tabela decyzyjna)

| Wniosek | Warunek |
|---|---|
| **konflikt** | co najmniej jedna sprzeczność |
| (brak propozycji) | nazwisko lub imię niezgodne |
| **sprawdź** (mocna propozycja) | nazwisko i imię zgodne, co najmniej 2 mocne zgodności, w tym co najmniej 1 rodzinna (ojciec, matka, nazwisko rodowe matki, małżonek), żadnej istotnej rozbieżności |
| **możliwe** | nazwisko i imię zgodne, co najmniej 1 mocna zgodność, najwyżej 1 istotna rozbieżność; albo jedyny w całej bazie kandydat o tym imieniu i nazwisku ze zgodnym rokiem urodzenia |
| **za mało danych** | zgadza się tylko imię i nazwisko (ewentualnie miejscowość) |
| **odrzucone** | wyłącznie decyzja użytkownika |

Konkurencja: jeśli więcej niż jeden kandydat spełnia warunek „sprawdź”, wszyscy spadają do „możliwe” z dopiskiem „niejednoznaczne: N kandydatów”. Liczba kandydatów na tym samym poziomie jest zawsze pokazana.

Przykład z prototypu (dane z indeksów):
> **Franciszka Barbarzak, dziecko, chrzest 1877 ↔ Franciszka Barbarzak, panna młoda, ślub 1894**
> Zgodności: nazwisko; imię; rok urodzenia 1876–1877 i 1874–1879; ojciec Michał; matka Zofia; nazwisko rodowe matki Kudrelek; miejscowość Blinów.
> Rozbieżności: brak. Sprzeczności: brak. Braki: małżonek nieznany w jednym wystąpieniu.
> Wniosek: mocna propozycja. Sprawdź na skanie i zdecyduj.

## 5. Test na `RANKING_scalen_zgony.csv`
Zakres: wszystkie 1123 wiersze rankingu (897 z kandydatem). Osoby i rodziny czytane w locie z `GED_scalone/drzewo_scalone_v36_rodziny.ged`; wynik zawiera tylko identyfikatory i wnioski. Dla każdej pary „zgon z indeksu ↔ najlepszy kandydat rankingu” zastosowano reguły z pkt 2–4.

| Klasa rankingu | sprawdź | możliwe | za mało danych | konflikt | imię/nazwisko niezgodne |
|---|---|---|---|---|---|
| A „mocny” (13) | 3 | 6 | 3 | 1 | – |
| B „jedyny kandydat” (300) | 2 | 4 | 278 | 15 | 1 |
| C „wielu kandydatów” (584) | 3 | 5 | 492 | 81 | 3 |
| D „brak kandydata” (226) | – | – | – | – | – |

Wnioski z testu:
1. **97 par z rankingu (11%) jest logicznie niemożliwych**: 75 razy kandydat ma dziecko urodzone po dacie zgonu, 29 razy występuje jako żyjący po zgonie, 9 razy ma oboje innych rodziców (część par ma dwa powody). Ranking tego nie sprawdzał. Te pary trzeba przejrzeć w pierwszej kolejności: albo kandydat jest zły, albo w drzewie jest błędnie przypięte dziecko.
2. **Klasa A nie jest jednolita.** Z 13 „mocnych”: 3 mają potwierdzenie rodzinne (sprawdź), 6 opiera się na wieku i częściowo na rodzicach (możliwe), 3 tylko na imieniu, nazwisku i szerokim przedziale wieku (za mało danych), 1 ma oboje innych rodziców (konflikt: Marianna Bucoń, zm. 1878, córka Antoniego i Anastazji; kandydat `@GIII5784@` ma oboje innych rodziców).
3. **86% par klas B i C to „za mało danych”**: zgadza się tylko imię i nazwisko, bo indeks zgonów ma wiek w 13% i rodziców w 11% wierszy. Żadna reguła tego nie naprawi; naprawia to odczyt aktów (wiek, rodzice, dom), czyli praca już prowadzona w bazie zgonów.
4. **8 par B i C dostaje „sprawdź”** dzięki rodzicom, których ranking nie brał pod uwagę (zgodni ojciec, matka i nazwisko rodowe matki).
5. Przy przeszukaniu całej puli (nie tylko kandydata z rankingu) reguły wskazują tego samego najlepszego kandydata w 653 z 889 przypadków; różnice dotyczą prawie wyłącznie remisów na poziomie „za mało danych”, gdzie kolejność nie ma znaczenia. W klasie D reguły znajdują 1 mocną propozycję (`@GII11609@`) do sprawdzenia.
6. Próbka prototypu (271 aktów, 926 wystąpień): 17 par „sprawdź”, 578 „możliwe”, 1354 „za mało danych”, 637 „konflikt” (głównie „dwa akty chrztu” i „żyje po zgonie” przy częstych imionach). Czas: 2,7 s na wszystkie pary.

Ograniczenia testu: nie ma zbioru par potwierdzonych przez człowieka, więc test mierzy zgodność z rankingiem i spójność logiczną, nie trafność. Pierwszych 50–100 decyzji użytkownika w aplikacji stanie się zbiorem wzorcowym do strojenia tolerancji (krok 6 planu).

## 6. Do zrobienia w regułach
- Dopisek „wiek niepewny” przy `unc`; osobna tolerancja dla wieku rodziców z chrztów.
- Odstępy między dziećmi i wiek rodzica przy urodzeniu dziecka jako rozbieżność (dziś tylko w kontrolach).
- Częstość pary imię + nazwisko w bazie jako wskazówka (Marianna Kosidło: 70 kandydatów) i wymóg zgodności rodzinnej dla częstych par.
- Scenariusze z dopasowania (`candBirth`, `candDeath`, `candMar`, `candSib`) jako generatory kandydatów: szukają także tam, gdzie nazwisko się zmieniło (kobieta po ślubie przez imię męża).
- Świadkowie i chrzestni: powtarzający się świadek jako wskazówka, nie zgodność.
