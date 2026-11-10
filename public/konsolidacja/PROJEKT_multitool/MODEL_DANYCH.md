# Multitool – model danych (wersja formatu 1)

Stan: projekt, 2026-11-10. Przykład: `dane_przyklad.json`. Działająca próbka: `prototyp/dane.json` (271 aktów) budowana przez `prototyp/zbuduj_dane.py`.

## 1. Zasady
1. **Akt jest jedynym miejscem, gdzie leży wartość.** Wystąpienie, Osoba i Relacja wskazują pola aktu, nie kopiują ich.
2. **Osoba nie jest zapisywana, tylko wyliczana** z dziennika Decyzji. Cofnięcie scalenia to nowy wpis w dzienniku; akty, wystąpienia i źródła zostają nietknięte.
3. **Nic nie scala się samo.** Program tworzy propozycję z uzasadnieniem; klaster powstaje wyłącznie z decyzji `scal` użytkownika.
4. **Każde pole ma `value`, `status`, `unc`, `source`.** Inne odczyty tego samego pola zostają obok (`alt`), nie giną.
5. **Zapis z aktu zostaje** (`raw`), normalizacja jest obok. Klucze do porównań (`norm.js`) nie są zapisywane w danych.
6. Dane w repo: tylko archiwalne. Drzewo GED nie wchodzi do `dane.json`; decyzje użytkownika są w przeglądarce i w jego kopiach.

## 2. Encje

| Encja | Id | Co to jest | Skąd powstaje |
|---|---|---|---|
| Źródło | `zr:<nazwa>` | księga, indeks, odczyt, spis, inwentarz (plik w repo, sygnatura) | ręcznie, lista w `dane.json` |
| Skan | `sk:<12 znaków sha256>` | plik obrazu; nazwa i ścieżka to atrybuty, nie identyfikator | skrypt budujący |
| Akt | stałe id (pkt 4) | chrzest, małżeństwo, zgon, wpis spisu, wpis inwentarza | import z CSV i odczytów |
| Wystąpienie | `w:<akt>:<rola>` | jedna osoba w jednym akcie, w jednej roli | automatycznie z aktu |
| Relacja | `r:<typ>:<akt>:<a>:<b>` | związek dwóch wystąpień | automatycznie z aktu albo decyzją (hipoteza) |
| Decyzja | `n` (kolejny numer) | wpis dziennika: scal, odrzuć, odłóż, cofnij, wariant, relacja | tylko użytkownik |
| Osoba | `o:<n pierwszej decyzji scal>` | klaster wystąpień | wyliczana z Decyzji |

## 3. Pole
```json
{"value": "Kosidło", "status": "ok", "unc": false,
 "source": {"plik": "haiku/ODCZYTY/lm/lm-2.csv", "skan": "sk:0af0e32a2965", "strona": "P", "wiersz": "4"},
 "raw": "Kosidłowna", "by": "csv", "note": "nazwisko w akcie: Kosidłowna (forma panieńska)",
 "alt": [{"value": "Kosidłowna", "status": "lub", "unc": false, "source": {"plik": "zgony.csv", "wiersz": "11"}}]}
```
- `status`: `ai` = odczyt maszynowy (propozycja), `lub` = z indeksu (Lubgens, karty), `ok` = zatwierdzone przez użytkownika.
- `unc`: niepewne. Końcowy `?` z dotychczasowych danych przechodzi na `unc=true` i wraca przy eksporcie CSV; `?` w środku wartości zostaje.
- `source`: `plik` (ścieżka w repo), `skan` (id skanu), `strona`; dodatkowo `wiersz`. Dla wartości wpisanej ręcznie `source` wskazuje skan, z którego czytano.
- Opcjonalne: `raw` (zapis w akcie), `alt` (inne odczyty), `note`, `by` (`edit`/`csv`/`auto`/`txt`, jak dziś `src`), `skip` (pominięte), `roi` (ramka pola na skanie, układ oryginału).
- Znaczniki `[_]` (nie podano w akcie) i `[-]` (nie dotyczy) to zwykłe wartości; `norm.js` traktuje je jako brak danych.
- Zapis na dysku może skracać `source` do numeru z tabeli źródeł (patrz `RYZYKA.md` §1); model logiczny się nie zmienia.

## 4. Akt
```json
{"id": "ZG.Z00011", "typ": "zgon", "rok": 1797, "nr": "3", "miejsce": "Blinów", "epoka": "lac", "zestaw_pol": "LATF",
 "zrodla": ["zr:indeks-zgony", "zr:liber-mortuorum"], "skan": {"id": "sk:0af0e32a2965", "strona": "P", "roi": {"x": 0.5, "y": 0, "w": 0.5, "h": 1}},
 "stan": "w_toku", "id_dawne": ["idx-1797-3", "Z00011"], "tekst": "", "pola": {"…": {}}, "robocze": {}}
```
- `typ`: `chrzest`, `malzenstwo`, `zgon`, `spis`, `inwentarz`, `protokol`, `rejestr`. `stan`: `z_indeksu`, `w_toku`, `zatwierdzony`.
- `zestaw_pol`: który zestaw pól pokazać (konfiguracja typu aktu, nie kod): zgony `LATF` (<1826), `CAUSEF` (1870–79), `ORDF` (reszta), `PROT`, `REJ`; analogicznie dla chrztów i małżeństw.
- **Id aktu nie zmienia się.** Dotychczasowe id (`idx-1797-3`, `lm-<skan>-<n>`, `ai1-1935-001`, `asc-1878-029`, `Z00011`, `CH.LUB.BLIN.1783.001`, `1841/1`) trafiają do `id_dawne`; import zatwierdzeń szuka po obu. Docelowy schemat id zgonów i małżeństw: decyzja użytkownika (prototyp używa id indeksu).
- `robocze`: wszystko z obecnego stanu, czego model jeszcze nie nazywa (`qs`, `par`, `hid.death_time`, `notesOrg`, `lubAck`, `alts`), przepisane bez zmian, żeby nic nie zginęło.

## 5. Źródło i Skan
```json
{"id": "zr:liber-mortuorum", "typ": "ksiega", "nazwa": "Liber mortuorum 1797–1825", "sygnatura": "", "lata": [1797, 1825], "plik": "haiku/ODCZYTY/lm/"}
{"id": "sk:0af0e32a2965", "plik": "blinow_lm-2.jpg", "sciezka": "haiku/skany_lm/blinow_lm-2.jpg", "sha256": "0af0e32a2965…", "zrodlo": "zr:liber-mortuorum", "strony": "L,P"}
```
Skan identyfikuje suma kontrolna. Dwa pliki o tej samej nazwie w różnych folderach to dwa skany; ten sam plik pod dwiema nazwami to jeden skan z dwiema ścieżkami.

## 6. Wystąpienie
```json
{"id": "w:ZG.Z00011:zmarly", "akt": "ZG.Z00011", "rola": "zmarly",
 "mapa": {"imie": "deceased_first_name", "nazwisko": "deceased_last_name", "plec": "deceased_sex", "wiek": "age", "stan": "deceased_status", "zawod": "profession", "miejsce": "death_place", "dom": "house"}}
```
Role: `dziecko`, `ojciec`, `matka`, `chrzestny`, `chrzestna`, `pan_mlody`, `panna_mloda`, `ojciec_pana`, `matka_pana`, `ojciec_panny`, `matka_panny`, `swiadek1/2`, `zmarly`, `malzonek`, `zglaszajacy1/2`, `ksiadz`, `poprzedni_malzonek`, `osadnik`.
Atrybuty w `mapa`: `imie`, `nazwisko`, `rodowe`, `imie_nazwisko` (pole łączne, np. świadek), `plec`, `wiek`, `stan`, `zawod`, `miejsce`, `dom`.
**Profil** (rok urodzenia jako przedział, rodzice i małżonek z tego samego aktu, lata, w których osoba żyje) liczy `wystapienia.js` przy starcie; nie jest zapisywany.

## 7. Relacja
```json
{"id": "r:rodzic-dziecko:ZG.Z00011:ojciec:zmarly", "typ": "rodzic-dziecko", "a": "w:ZG.Z00011:ojciec", "b": "w:ZG.Z00011:zmarly", "status": "dokument", "zrodlo": "ZG.Z00011"}
```
- `typ`: `rodzic-dziecko`, `malzenstwo`, `swiadek`, `chrzestny`, `zglaszajacy`, `wspolny-dom`.
- `status` jak w `wspolne/model.js`: `dokument`, `hipoteza`, `poszlaka`, `wskazowka`, `konflikt`, `odrzucone`. Relacja z jednego aktu ma `dokument`, gdy pola obu stron są `ok`; inaczej `hipoteza`.
- Relacja łączy **wystąpienia**. Relacje między osobami wynikają z klastrów, więc cofnięcie scalenia nie psuje relacji.
- Relacja spoza jednego aktu (np. „to rodzeństwo”) powstaje tylko decyzją `relacja` i ma `zrodlo` = numer decyzji.

## 8. Decyzja (dziennik, tylko dopisywanie)
```json
{"n": 3, "t": "2026-11-10T07:15:00.000Z", "typ": "scal", "a": "w:CH.LUB.BLIN.1877.012:dziecko", "b": "w:MA.1894.23:panna_mloda",
 "wniosek": "sprawdz", "reguly": 1, "why": "", "uzasadnienie": {"zgodnosci": ["…"], "rozbieznosci": [], "sprzecznosci": [], "braki": ["…"]}}
{"n": 2, "typ": "cofnij", "cofa": 1, "why": "…"}
```
| typ | znaczenie |
|---|---|
| `scal` | dwa wystąpienia to jedna osoba |
| `odrzuc` | to różne osoby; para nie wraca jako propozycja i blokuje scalenie pośrednie |
| `odloz` | wrócić później |
| `brak` | szukano odpowiednika, brak w księgach (dziś `none` w dopasowaniu) |
| `wariant_nazwiska`, `wariant_imienia`, `miejsce` | dwa zapisy to ten sam wpis słownika (klasa wariantów) |
| `relacja` | hipoteza relacji między wystąpieniami z różnych aktów |
| `cofnij` | unieważnia decyzję `cofa`; niczego nie kasuje |

Decyzja zapisuje uzasadnienie widziane w chwili decyzji i wersję reguł (`reguly`). Gdy reguły lub dane się zmienią, kontrola porównuje stare i nowe uzasadnienie (`KONTROLE.md`, W-07).

## 9. Osoba (pochodna)
```json
{"id": "o:3", "wystapienia": ["w:CH.LUB.BLIN.1877.012:dziecko", "w:MA.1894.23:panna_mloda"], "decyzje": [3], "aliasy": [], "status": "zatwierdzona"}
```
- Klaster = spójna składowa aktywnych decyzji `scal`. Id = `o:` + najmniejszy numer decyzji w klastrze; pozostałe numery to `aliasy` (po połączeniu dwóch osób stare id dalej działa).
- Wystąpienie bez decyzji to „osoba jednoelementowa” o tożsamości nierozstrzygniętej (jak dziś `tozsamosc:'nierozstrzygnięta'`).
- Status `propozycja` i `odrzucona` z przekazania dotyczą **par**, nie osób: propozycja to wynik reguł, odrzucenie to decyzja `odrzuc`.
- Wartość „najlepsza” dla osoby (np. data urodzenia) nie jest przechowywana. Karta osoby pokazuje wszystkie wartości z wystąpień; wybór do GED robi eksport według jawnej kolejności (akt chrztu przed wiekiem z aktu zgonu, `ok` przed `lub` przed `ai`).

## 10. Mapowanie istniejących danych

### 10.1 Zgony (silnik v3, `buduj_baza_v4.py`)
Id pól zostają bez zmian (to już wspólny słownik z `templates-config.js` → `death`).

| Zestaw | Pola |
|---|---|
| `ORDF` | death_place, deceased_last_name, deceased_first_name, act_date, informant1, informant2, death_date, death_time, deceased_maiden_name, age, profession, deceased_status, deceased_spouse, deceased_birth_place, deceased_residence, deceased_sex, father_first_name, father_last_name, mother_first_name, mother_last_name, officiant, notes |
| `LATF` (<1826) | death_place, house, deceased_last_name, deceased_first_name, death_date (etykieta „Data zgonu / zgłoszenia”), deceased_sex, age, deceased_status, profession, parents_raw, father_first_name, father_last_name, mother_first_name, mother_last_name, cause_of_death, notes |
| `CAUSEF` (1870–79) | `ORDF` + cause_of_death przed notes |
| `PROT` / `REJ` | p_date, p_count, p_signer, p_note / deceased_last_name, deceased_first_name, death_act_number |

| Dziś | Model |
|---|---|
| `a.ai[f]` | Pole `status=ai`; `source.plik` = plik odczytu (`haiku/ODCZYTY/lm/lm-N.csv`, `*_dom_przyczyny.csv`, odczyt ASC) |
| `a.lub[f]`, `lubRaw` | Pole `status=lub`, `source.plik=zgony.csv`, `wiersz`; `lubRaw` → pole `notes_org` |
| `S.acts[id].f[f] = {v, src, ok, unc, note, skip}` | `value=v`, `status=ok` gdy `ok`, `by=src`, `unc`, `note`, `skip`; poprzednia wartość → `alt` |
| `a.unc[]`, `?` na końcu | `unc=true` |
| `a.alts[f]` | `alt` (status `ai`, z opisem) |
| `a.file`, `a.roi`, `S.acts[id].scan/roi`, `a.pola[f]` | `akt.skan` (id z sumy kontrolnej), `roi`; ramki pól → `pole.roi` |
| `a.tekst`, `S.acts[id].text`, `tnotes`, `qs` | `akt.tekst` (+ wersja poprawiona), `robocze` |
| `S.acts[id].done` | `akt.stan = zatwierdzony` |
| `S.hist` (`{n,t,id,k,f,before,after,why}`) | dziennik historii bez zmian formatu; decyzje o osobach to `k='dec'` |
| `S.rel`, `S.repIgn`, `S.fixes` | decyzje `relacja`; ustawienia kontroli; słownik poprawek |
| role z `modelZZgonu` | wystąpienia `zmarly`, `ojciec`, `matka`, `malzonek`, `zglaszajacy1/2` (dziś `swiadek1/2`) |

Wystąpienia zgonu: `zmarly` {imie: deceased_first_name, nazwisko: deceased_last_name, rodowe: deceased_maiden_name, plec: deceased_sex, wiek: age, stan: deceased_status, zawod: profession, miejsce: deceased_residence lub death_place, dom: house}; `ojciec` {father_first_name, father_last_name}; `matka` {imie: mother_first_name, rodowe: mother_last_name}; `malzonek` {imie_nazwisko: deceased_spouse}; `zglaszajacy1/2` {imie_nazwisko: informant1/2}; `ksiadz` {imie_nazwisko: officiant}.

### 10.2 Chrzty
Słownik docelowy = szablon `chrzest` z `templates-config.js`. Szablon `birth` zostaje w pliku; jego pola są tylko mapowane.

| Źródło | → pole `chrzest` |
|---|---|
| `blinow_akty.csv`/`blinow_scalone.csv`: id | id aktu, `source_id` |
| rok, nr | `akt.rok`, `akt.nr` (`christening_year`, `christening_act_number`) |
| dziecko_nazwisko, dziecko_imiona (nazwisko, imie) | child_last_name, child_first_name |
| miejscowosc | child_birth_place (i `akt.miejsce`) |
| ojciec_imiona, ojciec_nazwisko, ojciec_wiek | father_first_name, father_last_name, father_age |
| matka_imiona, matka_nazwisko, matka_wiek | mother_first_name, mother_last_name (rodowe), mother_age |
| uwagi (miesiąc rzymski), uwagi_org („Str 1 Fot 1”) | index_month, notes_org (+ `index_card`) |
| `kol_14_26_surowe` | `raw` odpowiednich pól (zapis łaciński: „Adalbertus” → raw, „Wojciech” → value) |
| wiersze `wariant_*`, `karta_CLN_litera` w `blinow_scalone.csv` | `alt` pól tego samego aktu (ten sam `id`), nie osobne akty |
| flagi, `arch_id_do_sprawdzenia` | `unc=true` na polu, którego dotyczy; reszta do `notes` |
| `birth`: child_first_name, child_last_name, birth_date, birth_place, notes | te same lub child_birth_date, child_birth_place |
| `birth`: father_name, mother_name (łączne) | wystąpienie z `imie_nazwisko`; rozbicie na imię i nazwisko dopiero po zatwierdzeniu |
| `birth`: father_profession | father_occupation |
| `30.12.1899` | brak daty (zero-data z Excela), nie wartość |

Wystąpienia chrztu: `dziecko` {child_first_name, child_last_name, plec: child_sex, miejsce: child_birth_place}; `ojciec` {father_*; miejsce: father_residence}; `matka` {imie: mother_first_name, rodowe: mother_last_name, nazwisko: father_last_name}; `chrzestny`/`chrzestna` {imie_nazwisko: godfather_name/godmother_name}; `ksiadz` {officiant}.

### 10.3 Małżeństwa
Słownik docelowy = szablon `marriage` + pola z odczytów `MALZENSTWA_*_ai1_import.csv` (marriage_time, margin_place, *_birth_place, *_profession, *_alive, witness*_residence/profession, consent, margin_notes).

| `malzenstwa_mal.csv` | → pole |
|---|---|
| rok, nr; data_iso (data_tekst → raw) | akt.rok, akt.nr; marriage_date |
| pan_nazwisko, pan_imie, pan_stan, pan_wiek, pan_miejscowosc | groom_last_name, groom_first_name, groom_status, groom_age, groom_residence |
| pan_ojciec_imie/nazwisko, pan_matka_imie/nazwisko | groom_father_*, groom_mother_* |
| panna_* (jak wyżej) | bride_* |
| swiadek1/2_imie + nazwisko, wiek | witness1/2_name (+ wiek w `note`; docelowo osobne witness*_age) |
| pan_poprzednia_zona_*, wdowa_poprzedni_maz_* | previous_spouse (docelowo dwa pola: groom_previous_spouse, bride_previous_spouse) |
| pan_rok_ur_przyb, panna_rok_ur_przyb | nie importować: wyliczane z wieku |
| surowe_kol_*, flagi | `raw`, `unc`, `notes_org` |

Stan przeglądarki weryfikatora małżeństw (`wm1`, `S.acts[id].f`) mapuje się jak w 10.1. Wystąpienia: `pan_mlody`, `panna_mloda`, `ojciec_pana`, `matka_pana`, `ojciec_panny`, `matka_panny`, `swiadek1/2`, `poprzedni_malzonek`, `ksiadz`.

### 10.4 Spisy, inwentarze, tabele
Jeden wiersz źródła = jeden Akt typu `spis` lub `inwentarz` z jednym wystąpieniem `osadnik`.

| Źródło | → pole |
|---|---|
| `SPISY_BLINOW_weryfikacja_mini.html` `D.spisy`: [rok, osiadłość, osadnik, tryb, uwagi, klucz] | akt.rok; holding_name; settler_name; tenure (robi / czynsz / do arendy); notes; klucz nie jest importowany (liczy go `norm.js`) |
| `BLINOW_spis_poddanych_*.csv`: str, denominatio, osadnik, tryb, uwagi | source.strona, holding_name, settler_name, tenure, notes |
| `BLINOW_inwentarz_1799_*.csv`: rok, zrodlo, lp, osiadlosc_dawna, zagroda, imie, nazwisko, uwagi | akt.rok, źródło, akt.nr, holding_name, house, settler_first_name, settler_last_name, notes |
| tabele likwidacyjne 1865: skan, nr_porz, nr_tabeli_1846, osadnik_1865, uwagi, wartości | source.skan, akt.nr, prev_table_number, settler_name, notes, pola liczbowe bez zmian |

Wystąpienie `osadnik` {imie/nazwisko albo imie_nazwisko, miejsce: akt.miejsce, dom: house}. „Tenże”, „Wdowa Sobocina” zostają w `value`; rozwinięcie („tenże” = poprzedni wiersz) to propozycja ze statusem `ai`, nie zmiana danych. Spisy sprzed 1783 nie mają aktów metrykalnych do pary, więc dają głównie wskazówki (ciągłość nazwiska i osiadłości).

## 11. Plik `dane.json`
```json
{"format": {"nazwa": "multitool-dane", "wersja": 1}, "zrodla": [], "skany": [], "akty": [], "wystapienia": [], "relacje": [], "slowniki": {}}
```
Decyzje i historia zmian pól są osobno (`multitool-decyzje`, stan przeglądarki), bo należą do użytkownika, a `dane.json` jest przebudowywany z repo. Wersja formatu rośnie przy każdej zmianie znaczenia pól; import starszej wersji przechodzi przez funkcję migrującą, import nowszej jest odrzucany z komunikatem.
