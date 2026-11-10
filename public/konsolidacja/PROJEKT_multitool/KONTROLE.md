# Multitool – kontrole i sygnały

Trzy poziomy, jeden format, cztery zakresy (akt, osoba, rodzina, zbiór). Sygnał niczego nie zmienia w danych: wskazuje akty i pola, a użytkownik poprawia, oznacza pole jako niepewne albo ignoruje sygnał z powodem.

## 1. Poziomy

| Poziom | Znaczenie | Przykład | Co robi aplikacja |
|---|---|---|---|
| **Sprzeczność** | logicznie niemożliwe; co najmniej jedna z wartości jest błędna albo to dwie różne osoby | zgon przed urodzeniem, dziecko urodzone 3 lata po śmierci matki | czerwony znacznik; blokuje „Zatwierdź akt” do czasu poprawy lub świadomego potwierdzenia; para osób dostaje wniosek „konflikt” |
| **Anomalia** | możliwe, ale nietypowe; warto spojrzeć na skan | matka 51 lat, akt spisany 40 dni po zgonie, wdowa 17 lat | żółty znacznik; nie blokuje |
| **Wskazówka** | nie błąd, tylko trop albo brak | dziecko bez rodziców w akcie, ten sam świadek w pięciu aktach rodziny, możliwy podwójny wpis | szary znacznik; trafia do kolejki „Pytania do rozwiązania” |

Mapowanie obecnych wag z `raport.js`: `err` → sprzeczność (poza `duplikat`, który jest wskazówką), `warn` → anomalia, `info` → wskazówka.

## 2. Format sygnału
```json
{"id": "O-03|o:3|ZG.Z00011", "poziom": "sprzecznosc", "kod": "O-03", "opis": "Zgon w 1797, a w 1801 osoba występuje jako ojciec chrzczonego dziecka.",
 "zakres": "osoba", "akty": ["ZG.Z00011", "CH.LUB.BLIN.1801.014"], "pola": ["death_date", "father_first_name"], "osoby": ["o:3"], "od": ["decyzja 12"]}
```
- `id` jest stabilny (kod + obiekty), żeby ignorowanie przetrwało przebudowę danych.
- `od`: decyzje scalenia, od których sygnał zależy. Sygnał na poziomie osoby lub rodziny zawsze podpowiada dwie drogi: popraw pole albo cofnij wskazane scalenie.
- Ignorowanie to wpis w historii (`k='kontrola'`, z powodem), cofalny jak każdy inny.
- Wątpliwości zgłaszane przez odczyt AI trafiają tu jako wskazówki `A-20`, nie do rozmowy.

## 3. Akt (jeden akt, bez łączenia)

| Kod | Poziom | Reguła | Stan |
|---|---|---|---|
| A-01 | sprzeczność | data zgonu późniejsza niż data aktu (`zgon-po-akcie`) | jest |
| A-02 | sprzeczność | wiek poniżej 15 lat i stan żonaty / zamężna / wdowa (`wiek-stan`) | jest |
| A-03 | sprzeczność | data nie istnieje w kalendarzu (31 lutego) albo zły format (`data-zla`) | jest (poprawka `dzien()` z 2026-11-10; przebudować pliki wygenerowane) |
| A-04 | sprzeczność | wiek rodzica w akcie chrztu poniżej 12 lat albo matka powyżej 55 | nowe |
| A-05 | sprzeczność | pan młody lub panna młoda poniżej 14 lat | nowe |
| A-06 | anomalia | akt spisany ponad 10 dni po zgonie (`zgon-dawno`); chrzest ponad 30 dni po urodzeniu | jest / nowe |
| A-07 | anomalia | rok zdarzenia nie pasuje do roku księgi (`rok-zgonu`) | jest |
| A-08 | anomalia | wiek powyżej 110 lat (`wiek-duzy`); wdowa lub wdowiec poniżej 18 (`wiek-wdowiec`) | jest |
| A-09 | anomalia | dziecko z zawodem (pomija Agricola) lub z małżonkiem (`dziecko-zawod`, `dziecko-malzonek`) | jest |
| A-10 | anomalia | panna lub kawaler z wpisanym małżonkiem (`stan-malzonek`) | jest |
| A-11 | anomalia | płeć niezgodna z imieniem albo z formą nazwiska (`plec-imie`, `plec-nazwisko`); mężczyzna z nazwiskiem rodowym (`mezczyzna-rodowe`) | jest |
| A-12 | anomalia | numer aktu rośnie, a data maleje w obrębie roku (`chronologia`) | jest |
| A-13 | anomalia | odczyt AI i indeks różnią się w polu identyfikującym (nazwisko, imię, rok) | jest jako filtr „Konflikty”; przenieść do sygnałów |
| A-14 | anomalia | nazwisko „podobne” do częstego w parafii, ale inne (Dobrzańska / Dobrzyńska) | jest w „Pisowni”; przenieść |
| A-15 | anomalia | rodzice o tym samym nazwisku rodowym; świadek o imieniu i nazwisku zmarłego | nowe |
| A-16 | wskazówka | brak pola wymaganego dla epoki (`brak-*`), licznik braków | jest |
| A-17 | wskazówka | dziecko bez rodziców w akcie (`dziecko-rodzice`) | jest |
| A-18 | wskazówka | możliwy podwójny wpis: ta sama osoba i data w dwóch aktach (`duplikat`, `duplikat-rok`) | jest |
| A-19 | wskazówka | akt bez skanu; pole `ok` bez wskazania skanu | nowe |
| A-20 | wskazówka | pole niepewne (`unc`) z powodem podanym przez odczyt | jest jako filtr „Niepewne” |
| A-21 | wskazówka | data w akcie łacińskim to data zgłoszenia; `30.12.1899` to brak daty | nowe (etykieta i filtr) |

## 4. Osoba (klaster wystąpień po decyzjach `scal`)
Te same reguły liczy `identity.js` **przed** scaleniem (jako sprzeczności w propozycji) i `chronologia.js` **po** scaleniu (jako sygnały).

| Kod | Poziom | Reguła |
|---|---|---|
| O-01 | sprzeczność | dwa akty zgonu w różnych latach |
| O-02 | sprzeczność | dwa akty chrztu (różne lata lub numery) |
| O-03 | sprzeczność | osoba występuje jako żyjąca (rodzic chrzczonego dziecka, państwo młodzi, świadek, chrzestny) po dacie zgonu; ojciec: ponad 9 miesięcy po zgonie |
| O-04 | sprzeczność | osoba występuje jako dorosła przed własnym urodzeniem albo w wieku poniżej 12 lat |
| O-05 | sprzeczność | różna płeć w wystąpieniach |
| O-06 | sprzeczność | oboje rodzice inni w dwóch wystąpieniach |
| O-07 | sprzeczność | ślub jako panna lub kawaler po wcześniejszym własnym ślubie bez zgonu małżonka pomiędzy |
| O-08 | anomalia | przedziały roku urodzenia z różnych aktów nie mają części wspólnej |
| O-09 | anomalia | jedno z rodziców inne (możliwy błąd odczytu albo dwie osoby) |
| O-10 | anomalia | ślub przed 16 (kobieta) lub 18 (mężczyzna) rokiem życia; pierwsze dziecko przed ślubem; ślub wdowca lub wdowy w miesiącu zgonu małżonka |
| O-11 | anomalia | luka ponad 30 lat między kolejnymi wystąpieniami dorosłej osoby |
| O-12 | anomalia | stan cywilny cofa się (zamężna → panna) |
| O-13 | wskazówka | różne miejscowości albo numery domów (przeprowadzka, przenumerowanie) |
| O-14 | wskazówka | różne zapisy nazwiska lub imienia w klastrze (kandydat na klasę wariantów) |
| O-15 | wskazówka | osoba ma chrzest i ślub, ale nie ma zgonu do końca zakresu ksiąg (i odwrotnie): „warto poszukać”, nigdy „akt istnieje” |
| O-16 | wskazówka | wartość pola w jednym wystąpieniu podana, w innym `[_]`: brak można uzupełnić w uwagach, nie w polu aktu |

## 5. Rodzina (rodzice + dzieci po decyzjach)

| Kod | Poziom | Reguła |
|---|---|---|
| R-01 | sprzeczność | dziecko urodzone po zgonie matki albo ponad 9 miesięcy po zgonie ojca |
| R-02 | sprzeczność | dziecko starsze od rodzica albo rodzic poniżej 12 lat przy urodzeniu |
| R-03 | sprzeczność | dwoje dzieci jednej matki urodzone w odstępie poniżej 8 miesięcy (poza bliźniętami: ten sam dzień lub akty sąsiednie) |
| R-04 | sprzeczność | ta sama osoba jako dziecko w dwóch rodzinach (dziś lista `DZIECI_w_kilku_rodzinach_do_decyzji.csv`) |
| R-05 | sprzeczność | małżonkowie to rodzeństwo wg zatwierdzonych relacji; osoba jest własnym przodkiem |
| R-06 | anomalia | matka powyżej 48 lub poniżej 16 lat, ojciec powyżej 70 przy urodzeniu dziecka |
| R-07 | anomalia | odstęp między dziećmi poniżej 11 miesięcy albo powyżej 6 lat (możliwy brakujący akt lub druga rodzina o tych samych imionach) |
| R-08 | anomalia | dwoje żyjących dzieci o tym samym imieniu (zwykle pierwsze zmarło: szukać zgonu) |
| R-09 | anomalia | drugi ślub przed zgonem pierwszego małżonka |
| R-10 | anomalia | dziecko z innym nazwiskiem niż ojciec (wariant, nieślubne, błąd) |
| R-11 | wskazówka | dziecko zmarłe bez aktu chrztu w bazie albo odwrotnie (luka w księgach, patrz `BRAKI_SKANOW.md`) |
| R-12 | wskazówka | ten sam świadek lub chrzestny w kilku aktach rodziny (możliwy krewny) |
| R-13 | wskazówka | rodzina w tym samym domu w spisie lub inwentarzu (ciągłość osiadłości) |
| R-14 | wskazówka | dwie rodziny o tych samych imionach rodziców w tych samych latach i tej samej wsi (kandydat do scalenia rodziców albo dwóch imienników: przypadek „dwóch Marcinów”) |

## 6. Zbiór (dane i proces)

| Kod | Poziom | Reguła |
|---|---|---|
| W-01 | sprzeczność | dwa akty o tym samym id; wystąpienie wskazuje pole, którego nie ma w akcie |
| W-02 | sprzeczność | decyzja wskazuje nieistniejące wystąpienie (po przebudowie danych); decyzja `scal` łączy parę odrzuconą |
| W-03 | anomalia | dwa skany o tej samej nazwie i różnej treści; ten sam skan pod dwiema nazwami |
| W-04 | anomalia | numeracja aktów w roku ma lukę albo powtórzenie |
| W-05 | anomalia | pole `ok` różni się od tego samego pola w nowo wczytanym CSV zatwierdzeń |
| W-06 | wskazówka | rocznik bez skanów albo bez odczytu (z `REJESTR_ODCZYTANYCH_SKANOW`) |
| W-07 | wskazówka | uzasadnienie zapisane przy decyzji `scal` różni się od liczonego dziś (zmieniły się dane lub reguły): pokaż, co doszło, zwłaszcza nowe sprzeczności |
| W-08 | wskazówka | decyzji bez kopii w pliku jest więcej niż 20 albo ostatnia kopia starsza niż 7 dni |

## 7. Widok
- Przy akcie: lista sygnałów aktu oraz osób i rodzin, do których należą jego wystąpienia.
- Zakładka „Kontrole”: filtr po poziomie, zakresie, kodzie, roku; eksport CSV w formacie `raportCsv` (`id;waga;kod;opis;powiazane`) rozszerzonym o `poziom` i `zakres`.
- Kolejka „Pytania do rozwiązania”: wskazówki i pola niepewne z powodem; rozwiązanie pytania to zwykła edycja pola lub decyzja.
- „Co zależy od tego ustalenia”: po zmianie pola lista sygnałów i propozycji, które się zmieniły (różnica przed/po), bez cichego przepisywania czegokolwiek.

## 8. Progi
Wszystkie liczby (12, 14, 16, 48, 55, 70 lat; 8, 9, 11 miesięcy; 10, 30 dni) leżą w jednej tabeli konfiguracyjnej w `kontrole.js`, z opisem. Zmiana progu to wpis w historii.
