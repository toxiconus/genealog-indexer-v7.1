# Specyfikacja formatów starych eksportów (krok 4 migracji)

Źródło ustaleń: kod w repo na commicie `9de011d` (gałąź master). Każda pozycja ma wskazanie pliku i funkcji. Czego nie widać w kodzie, oznaczono jako **nieustalone**. Przykłady są **wymyślone** i oznaczone jako `PRZYKŁAD`.

Pliki kopii rzeczywiste nie istnieją w repo (potwierdza `KROK0_inwentarz_eksportow.md`). Poniższe struktury wynikają z kodu, nie z przeanalizowanych plików kopii.

---

## 1. Przegląd

| # | Narzędzie (plik źródłowy) | Klucz localStorage / IndexedDB | Kopia JSON | Eksport CSV | Pole wersji w JSON |
|---|---|---|---|---|---|
| A | Baza zgonów 1797–1945 (`narzedzia/baza_zgonow_1797-1945.html`) | `D.key = 'bazazgonow3'` (fallback `'wz1'`); IndexedDB o tej samej nazwie (skany) | Tak: `weryfikacja_kopia.json` | Tak: zweryfikowane (38 kolumn) i kilka mniejszych | **Brak** (jest `S.v3 = 1` jako znacznik stanu, nie wersja formatu) |
| B | Weryfikacja małżeństw 1944–45 (`haiku/weryfikacja_malzenstw_szablon.html`) | `wm1` | Tak: `malzenstwa_stan.json` | Tak: `MALZENSTWA_zweryfikowane_auto.csv` | **Brak** |
| C | Dopasowanie osób (`dopasowanie/szablon.html`, zbudowane jako `dopasowanie_osob.html`) | `dop.v1` (decyzje), `dop.zm` (zoom), `dop.tree.v1` (drzewo) | Tak: `dopasowanie_decyzje.json` | Tak: `dopasowanie_decyzje.csv` (tylko eksport, bez importu) | **Brak** |
| D | Edytor korekt (`narzedzia/edytor_korekt_szablon.html`) | `blinow_edytor_v1` | **Nie ma** kopii JSON całego stanu | Tak: 5 plików CSV + 1 CSV z zakładki „Korekty” | **Brak** |

Wniosek dla migracji: w żadnym z czterech narzędzi nie ma pola `format` ani `wersja` w kopiach. Rozpoznanie formatu musi opierać się na kształcie danych (sekcja 6).

---

## 2. Narzędzie A: Baza zgonów 1797–1945

### 2.1 Kopia JSON „Wszystko w jednym pliku”

- Przycisk: `#mSave` — etykieta „⬇ Wszystko w jednym pliku (kopia JSON: pola, tekst, rejestr, ustawienia)”.
- Handler: `$('mSave').onclick` — `dl('weryfikacja_kopia.json', JSON.stringify(S), 'application/json')`.
- Ten sam zapis używa przycisk awaryjny `#swDl` („Zapisz kopię teraz”) w banerze braku zapisu.
- Nazwa pliku: `weryfikacja_kopia.json` (uwaga: nazwa nie zawiera „zgony”; nazwa zgadza się z kodem, nie z etykietą przycisku).
- Zawartość: cały obiekt `S` (`JSON.stringify(S)`, bez wcięć). Wspólna `dl` dodaje BOM, bo nazwa nie kończy się na `.ged` (patrz sekcja 8).
- Odczyt: `#mLoad` („⬆ Wczytaj kopię roboczą”) → `S = Object.assign(S, JSON.parse(...))`. **Bez walidacji** — błędny JSON kończy się toastem „Błędny plik”.

**Struktura najwyższego poziomu `S`** (klucze widoczne w kodzie; kolumna „stałe/dynamiczne” wg kodu inicjalizacji):

| Klucz | Typ | Znaczenie | Źródło w kodzie |
|---|---|---|---|
| `acts` | obiekt `{[id]: stanAktu}` | stan każdego aktu (pola, tekst, rejestr, skany) | inicjalizacja `S` (stałe) |
| `cur` | string \| null | id aktualnie otwartego aktu | dynamiczne |
| `year`, `cen`, `dec`, `flt` | string \| null | filtry i nawigacja | stałe (`S` init) |
| `onlyScan`, `hideOk`, `hideDoneActs`, `noroi`, `wiz` | bool | ustawienia widoku | stałe (`S` init) |
| `v3` | number (1) | znacznik, ustawiany przy wczytaniu, gdy go nie ma | `if (!S.v3) { S.v3 = 1; ... }` |
| `hist` | tablica (maks. 4000 wpisów) | historia zmian (cofanie) | `histCommit` |
| `histN` | number | licznik numeracji historii | `histCommit` |
| `rel` | obiekt `{[klucz]: rodzaj}` | decyzje powiązań rodzinnych (hipotezy) | dynamiczne |
| `relOpen` | bool | stan rozwinięcia sekcji powiązań | dynamiczne |
| `repIgn` | obiekt `{[id|kod]: 1}` | ignorowane sygnały raportu spójności | dynamiczne |
| `fixes` | obiekt `{[błąd]: {[poprawka]: liczba}}` | słownik poprawek (uczony z edycji) | `learnFix` |
| `onlyFix`, `tmode`, `insMode`, `scanBase`, `sbx`, `tfs`, `hideMk`, `spellOk`, `seeded`, `v` | różne | ustawienia UI; znaczenie `S.v` i `S.seeded` **nieustalone** (tylko użycia w kodzie) | dynamiczne |

**Struktura pola `S.acts[id]`** (funkcja `st(id)`: `{f: {}, done: false}`):

| Pole | Typ | Znaczenie |
|---|---|---|
| `f` | obiekt `{[pole]: wartośćPola}` | wybrane wartości pól |
| `done` | bool | akt zatwierdzony |
| `text` | string (opcj.) | tekst aktu (nadpisanie tekstu z danych) |
| `qs` | obiekt `{[klucz]: 1}` | pominięte pytania w tekście |
| `par` | obiekt `{father?: 1, mother?: 1}` | czy rodzic zmarłego też zmarł (z CSV) |
| `hid` | obiekt `{death_time?: string}` | ukryta wartość godziny zgonu z CSV |
| `scan` | string (opcj.) | klucz skanu w `D.scanFiles` |
| `roi` | obiekt (opcj.) | ręcznie poprawiony obszar skanu |
| `notesOrg` | string (opcj.) | oryginalne uwagi (do porównania) |
| `lubAck` | number (opcj.) | potwierdzenie ostrzeżenia Lubgens |
| `vrOk` | obiekt (opcj.) | potwierdzone warianty w tekście |

**Struktura wartości pola `S.acts[id].f[pole]`:**

| Podpole | Typ | Znaczenie |
|---|---|---|
| `v` | string | wybrana wartość |
| `src` | `'ai'` \| `'lub'` \| `'csv'` \| `'edit'` | źródło wyboru |
| `ok` | bool | zatwierdzone |
| `unc` | bool | niepewne |
| `note` | string (opcj.) | uwaga do pola |
| `skip` | bool (opcj.) | pole pominięte |

Rejestr i protokoły (`a.kind` = `'rej'` / `'prot'`) są w tym samym `S.acts` (funkcja `fieldsOf`).

**PRZYKŁAD (wymyślony):**

```json
{
  "acts": {
    "idx-1797-1": {
      "f": {
        "deceased_last_name": {"v": "Kowalski", "src": "ai", "ok": true, "unc": false},
        "age": {"v": "34", "src": "edit", "ok": true, "unc": true, "note": "PRZYKŁAD"}
      },
      "done": true,
      "par": {"father": 1}
    }
  },
  "cur": "idx-1797-1",
  "year": "all",
  "hist": [
    {"id": "idx-1797-1", "k": "f", "f": "age", "before": null, "after": "{\"v\":\"34\"}", "n": 1, "t": "2026-11-01T10:00:00.000Z"}
  ],
  "histN": 1,
  "repIgn": {},
  "fixes": {"kacyńska": {"Kaczyńska": 2}},
  "v3": 1
}
```

Uwagi do historii: `k` przyjmuje wartości `f` (pole), `text`, `done`, `q` (pytanie w tekście). Dla `k = f` wartości `before`/`after` są **stringami JSON** (`JSON.stringify`) albo `null`. Pole `why` pojawia się tylko przy cofnięciu (`cofnięcie #n`).

### 2.2 Eksport CSV „zweryfikowane”

- Przycisk: `#mCsv` — „⬇ Eksport CSV (zweryfikowane)”.
- Funkcje: `csvText()` (wiersze z `rows()`), handler `$('mCsv').onclick` → `dl('ZGONY_zweryfikowane.csv', t)`.
- Autozapis (Chrome/Edge, File System Access): `#mAuto` → plik `ZGONY_zweryfikowane_auto.csv`; zapisuje BOM + `csvText()`.
- Separator: `;`. Koniec wiersza: `\r\n`. Cudzysłowy: pole w `"` przy `;`, `"`, `\n`, `\r` (podwojenie `""`).
- Wiersze: tylko akty z `a.ai` i bez `a.kind` (czyli akty zgonu z odczytem AI).
- Wartości `verification_status` w plikach repo: `ok`, `ai_v1`, `ai_v1_w_trakcie` (wg `KROK0_inwentarz_eksportow.md`; w kodzie funkcja `rows()` nie została przeczytana w całości — **nieustalone**, czy zakres wartości jest wyłącznie taki).

**Kolumny (38, w tej kolejności; zgodne z `haiku/ZATWIERDZENIA/ZGONY_zweryfikowane_10.csv`, sprawdzone):**

```
id; death_year; death_act_number; deceased_first_name; deceased_last_name; deceased_maiden_name; deceased_sex; death_date; death_time; death_place; age; deceased_status; deceased_spouse; deceased_birth_place; deceased_residence; profession; father_first_name; father_last_name; mother_first_name; mother_last_name; informant1; informant2; cause_of_death; burial_place; officiant; notes; notes_org; verification_status; uncertain_fields; source_office; house; parents_raw; act_date; verification_notes; scan_path; act_text; father_deceased; mother_deceased
```

Kolumny `act_date`, `verification_notes`, `scan_path`, `act_text`, `father_deceased`, `mother_deceased` są dopisywane do `D.cols`, jeśli ich tam nie ma (kod: `COLS = D.cols.concat([...].filter(...))`).

**Mapowanie id:** kolumna `id` = klucz w `S.acts` i w `D.acts`. Przykłady z repo: `idx-1797-1`, `idx-1797-2` (plik `ZGONY_zweryfikowane_10.csv`, 881 wierszy). `id_dawne`: **nie występuje** w tym pliku ani w kodzie eksportu.

### 2.3 Pozostałe eksporty zgonów (do migracji nie są potrzebne jako źródło stanu, ale są w menu)

| Przycisk | Plik | Nagłówek / format |
|---|---|---|
| `#mLog` | `ZGONY_log_wyborow.csv` | `akt;pole;ai;lubgens;wybrane;zrodlo` |
| `#mRej` | `ZGONY_rejestr_protokoly_zweryfikowane.csv` | `id;pole;wartosc;zrodlo;niepewne;opis;pominiete;zatwierdzone` (nagłówek to jedna komórka z `;` w tekście) |
| `#mHist` → `hCsv` | `ZGONY_historia_zmian.csv` | `nr;czas;akt;rodzaj;pole;przed;po;powod` |
| `#mRel` | `ZGONY_powiazania_hipotezy.csv` | `akt;powiazany;regula;opis;status` |
| `#mFix` | `slownik_poprawek.json` | `{[błąd]: {[poprawka]: 1}}` (łączy `D.fix` i `S.fixes`) |
| `#mModel` | `ZGONY_model.json` | `{wersja: 1, osoby, zdarzenia, zrodla, relacje}` — to model danych, **nie** kopia stanu |
| `#mRoi` | `ZGONY_ai1_roi_poprawione.json` | tablica `{id, plik, strona, roi}` |

### 2.4 Import CSV (zatwierdzenia)

- Przyciski: `#mVer` („Wczytaj zweryfikowany CSV (jako zatwierdzone)”) i `#mVerOvw` („Wczytaj CSV i NADPISZ moje”). Plik: `#fVer`, handler `$('fVer').onchange`.
- Nagłówek czytany po nazwie kolumny (`ix[h] = i`). Wymagane: `id`. Akt pominięty, gdy `id` nieznane.
- `ok = (verification_status === 'ok')`. Pola niepewne: `uncertain_fields` dzielone po `[;,]`.
- Pola `FIELDS` zapisywane jako `{v, src:'csv', ok, unc}`. Pola już zatwierdzone (`ok`) są pomijane, chyba że `OVW`.
- `scan_path` → `s.scan`. `act_text` → `s.text` (gdy brak tekstu). `father_deceased` / `mother_deceased` → `s.par`. `death_time` → `s.hid.death_time` (gdy bez `?`).
- W kodzie `fVer` **nie** odczytano kolumny `verification_notes` (nie znaleziono). Migracja, jeśli ma przenieść uwagi, musi ją czytać osobno.

### 2.5 Import kopii JSON i rozpoznanie formatu

- `#mLoad` → `fLoad` (akceptuje `.json`). Brak walidacji kształtu. Do rozpoznania w migracji: obecność kluczy `acts` i (`cur` lub `hist` lub `v3`).

---

## 3. Narzędzie B: Weryfikacja małżeństw 1944–45

### 3.1 Kopia JSON „Zapisz stan (JSON)”

- Przycisk: w menu „Więcej…” (`#bMenu` → `#mJson`), nazwa pliku `malzenstwa_stan.json`.
- Kod: `download('malzenstwa_stan.json', JSON.stringify(S), 'application/json')`.
- Import: `#fl` z rozszerzeniem `.json` → `S = JSON.parse(...)`, bez walidacji. Błąd → alert „Błędny JSON”.
- Klucz zapisu: `KEY = 'wm1'` (`localStorage`).

**Struktura `S`:** `{acts: {[id]: stan}, cur: id | null, hideDone?: bool}` (`hideDone` ustawiane przez `S.hideDone = S.hideDone === false`).

**Stan aktu `S.acts[id]`:** `{f: {[pole]: {v, ok, unc, note?}}, done: bool}`. Wartość `v` jest znormalizowana przez `normV(f, v)`; daty w formacie `RRRR-MM-DD`.

**PRZYKŁAD (wymyślony):**

```json
{
  "acts": {
    "ai1-m1944-021": {
      "f": {
        "marriage_date": {"v": "1944-03-02", "ok": true, "unc": false},
        "groom_last_name": {"v": "Nowak", "ok": false, "unc": true, "note": "PRZYKŁAD"}
      },
      "done": false
    }
  },
  "cur": "ai1-m1944-021"
}
```

### 3.2 Eksport CSV

- Przycisk: `#bExp` („Zapisz CSV”), nazwa: `MALZENSTWA_zweryfikowane_auto.csv`.
- Kod: `csvText()` = `COLS.join(';')` + wiersze z `rows()`; `download()` dodaje BOM (`'﻿' + text`).
- Kolumny: `COLS = D.cols (bez margin_names)` + dopisane `margin_groom`, `margin_bride`, `margin_groom_first_name`, `margin_groom_last_name`, `margin_bride_first_name`, `margin_bride_last_name`, `witness1_first_name`, `witness1_last_name`, `witness2_first_name`, `witness2_last_name`, `groom_prev_spouse_first_name`, `groom_prev_spouse_last_name`, `bride_prev_spouse_first_name`, `bride_prev_spouse_last_name` (tylko te, których nie ma w `D.cols`).
- Dodatkowe kolumny wiersza: `id`, `marriage_year`, `marriage_act_number`, `uncertain_fields`, `verification_notes`, `verification_status`, `witness1_name`, `witness2_name`, `margin_groom`, `margin_bride`.
- **Nieustalone:** dokładna lista `D.cols`. W szablonie `const D = /*DATA*/null` — lista powstaje przy budowaniu (`haiku/build_weryfikacja_malzenstw.py`). Najbliższy odnośnik: `haiku/MALZENSTWA_1944_ai1_import.csv` (48 kolumn; pierwsze: `id`, `marriage_year`, `marriage_act_number`, `marriage_date`, `marriage_time`, `marriage_place`, `margin_place`, `groom_last_name`, ...). Plik z 1945 ma ten sam układ kolumn.
- `verification_status` z kodu: `ok` (akt zatwierdzony), `ai_v1_w_trakcie` (są wybrane pola), `ai_v1` (bez wyborów).
- Format daty w pliku: `marriage_date` w `RRRR-MM-DD` (funkcja `dateShort` przy edycji).
- Mapowanie id: kolumna `id` (np. `ai1-m1944-021`, `ai1-m1945-001` — przykłady z plików `MALZENSTWA_1944/1945_ai1_import.csv`). `id_dawne`: **nie występuje**.

### 3.3 Import CSV

- Przycisk: „Wczytaj CSV…” (`#bImp`) lub w menu `mImp`; „Wczytaj CSV z nadpisaniem…” (`mOvw`, ustawia `OVW = true`).
- Funkcja `importCsv(text)`: separator `;`, nagłówek po nazwie. Wymagane `id` (nieznane id → licznik „nieznanych aktów”).
- `ok = (verification_status === 'ok')`; `uncertain_fields` dzielone po `[;,]\s*`.
- `verification_notes` w formacie `pole: tekst | pole: tekst` (rozdzielane `' | '`, potem `^(\w+): (.*)$`).
- Pola bez `ok` przy `OVW` są nadpisywane; zatwierdzone pola są pomijane, gdy nie `OVW`.

---

## 4. Narzędzie C: Dopasowanie osób (decyzje `dop.v1`)

### 4.1 Struktura w localStorage (`dop.v1`)

Funkcje: `save()`, `validateDecisions()`, `cleanDecision()` (`dopasowanie/szablon.html`, linie ~184–200).

```
DEC = { [klucz]: { [slot]: { acc: [ {t, id} ], rej: [ {t, id} ], none: bool } } }
```

- `klucz` (funkcja `dkey()`): dla małżeństwa (`cur.mode === 'M'`) — **sam id**; dla urodzenia/zgonu — `'B:' + id` lub `'D:' + id`.
- `slot`: zbiór zależny od trybu: `SL13` (małżeństwo: `gF.b`, `gF.d`, `gM.b`, `gM.d`, `bF.b`, `bF.d`, …), `SLB` (urodzenie: `par`, `sib`, `own`, `mrg`), `SLD` (zgon: `birth`, `mrg`, `par`, `kids`). Pełne listy — `const SL13`, `SLB`, `SLD` w pliku.
- `t`: typ rekordu `'B'` (urodzenie), `'D'` (zgon), `'M'` (małżeństwo).
- `id`: id rekordu w `ARR[t]` (funkcja `rec(t, id)`, `ARR[t].find(x => x[0] === id)`). **Format id rekordów: nieustalone** — dane są wstrzykiwane w miejsce `/*DATA*/` i nie ma ich w szablonie.

**Znaczenie pól (z interfejsu):**

| Pole | Przycisk | Znaczenie |
|---|---|---|
| `acc` | „✓ to ta osoba” | przyjęte powiązanie. Dla `kids` i `sib` może być wiele; dla innych slotów tylko jedno (`d.acc = [r]`) |
| `rej` | „✗ nie” | odrzucony kandydat (ukrywany, dostępny w „odrzucone”) |
| `none` | „0 · sprawdzone – brak w księgach” | sprawdzone, brak odpowiednika w księgach; po dodaniu `acc` zostaje wyzerowane |

Mapowanie do planu (krok 6, `dop.v1`): `acc` → `scal`, `rej` → `odrzuc`, `none` → `brak` (zgodne z `PLAN_WDROZENIA.md` i `MODULY.md`).

**PRZYKŁAD (wymyślony; id rekordów są zastępcze):**

```json
{
  "ID-MALZENSTWA-PRZYKLAD": {
    "par": {"acc": [{"t": "B", "id": "ID-REKORDU-PRZYKLAD-1"}], "rej": [], "none": false}
  },
  "D:ID-ZGONU-PRZYKLAD": {
    "kids": {"acc": [{"t": "B", "id": "ID-REKORDU-PRZYKLAD-2"}, {"t": "B", "id": "ID-REKORDU-PRZYKLAD-3"}], "rej": [{"t": "B", "id": "ID-REKORDU-PRZYKLAD-4"}], "none": false}
  }
}
```

### 4.2 Eksport i import

- JSON: `#bJson` → `dopasowanie_decyzje.json` = `JSON.stringify(DEC, null, 1)` (wcięcie 1, bez BOM w kodzie, `dl` ze wspólnego pliku; BOM **nieustalone** dla tej strony).
- Import: `#bLoad` → `#fLoad` → `validateDecisions()` (odrzuca: nieznane `t`, nieistniejące `id`, nieznane sloty; `acc` ma pierwszeństwo przed `rej`; `none` ignorowane, gdy są `acc`). Przed importem zapis `dopasowanie_decyzje_backup.json`. Po imporcie komunikat o pominiętych identyfikatorach.
- CSV: `#bCsv` → `dopasowanie_decyzje.csv`. Separator `;`, **wszystkie pola w cudzysłowie**. Nagłówek: `centrum;id_centrum;pole;typ_powiązanego;id_rekordu;rok;osoba/akt;decyzja`. Wartości `decyzja`: `przyjęty` lub `brak w księgach`. **Brak importu** tego CSV — jest tylko do przeglądu.
- Kopia przed usunięciem: `kopia_przed_usunieciem.json` (przycisk „Usuń dane”, wymaga wpisania `1111`).
- Osobne pliki (nie są źródłem migracji decyzji):
  - `dop.zm` — liczba (zoom), `localStorage`.
  - `dop.tree.v1` — `TD` z polami `kids` i `dups`; eksport `decyzje_drzewa.json` (`#fmSave`) = `JSON.stringify(TD, null, 1)`. Plan wymaga, by drzewo zostało lokalnie (dane prywatne).

### 4.3 Uwagi

- Brak pola `format` / `wersja` w `dop.v1`. Kształt jest jedynym wskaźnikiem.
- `KROK0_inwentarz_eksportow.md` podaje plik `dopasowanie_osob.html`. W repo jest ten plik i szablon `dopasowanie/szablon.html` (źródło); kod eksportu jest w obu, sprawdzono w szablonie.

---

## 5. Narzędzie D: Edytor korekt (`blinow_edytor_v1`)

### 5.1 Stan w localStorage

- Klucz: `KEY = 'blinow_edytor_v1'`.
- Zapis: `save()` → `localStorage.setItem(KEY, JSON.stringify(ST))`.
- Struktura `ST`: `{log: [], dict: [], forms: {}, scan: {}, skan: {rot: {}, regs: [], data: {}, nid: 1}}`.
- Odczyt: `init()` → `ST.log`, `ST.dict`, `ST.forms`, `ST.scan`, `ST.skan` (gdy `s.skan.regs`).
- **Rozbieżność:** etykieta sekcji w UI mówi „Po wczytaniu strony stan odtwarza się z dziennika”, ale kod wczytuje `ST` z localStorage. Co ma pierwszeństwo, **nieustalone** — do sprawdzenia przed migracją.

**Wpis dziennika `ST.log[i]`** (funkcja `logChange`):

```json
{"ksiega": "ch", "wiersz": "123", "pole": "imie", "przed": "Jan", "po": "Johannes", "la": "Johannes", "ru": "", "zrodlo": "edit", "czas": "2026-11-01T10:00"}
```

Pole `ksiega` (kod księgi): `ch` (chrzty), `mal` (małżeństwa), `zg` (zgony), `ak` (w kodzie `init()` iteruje też po `ak` — znaczenie **nieustalone**). Wartości `ksiega` i `wiersz` tworzą klucz rekordu `ksiega + ':' + wiersz_zrodlo` (`BYKEY`).

**PRZYKŁAD (wymyślony):** `ST.forms` ma klucz `typ|wariant`, wartość `{type, v, pl, la, ru, status}`. `ST.dict` to tablica `{pl, plec, la, ru, status}`.

**Mapowanie id aktów:** klucz to **numer wiersza źródłowego** (`wiersz_zrodlo`) w danej księdze, nie id aktu. Relacja z `id` z baz zgonów/małżeństw: **nieustalone** (w kodzie edytora nie znaleziono mapowania; w eksporcie `krExport` pole `akt_id` pochodzi z `r.id` z `krList()` — źródła nie sprawdzono).

### 5.2 Eksporty CSV (separator `;`, `csvCell` w cudzysłowie)

| Przycisk | Funkcja | Plik | Nagłówek |
|---|---|---|---|
| `#kr_export` („eksport CSV”, zakładka Korekty) → `krExport()` | `krExport` | `ksiega_1783_akty.csv` | `lp;liber;typ_ksiegi;plik;akt_id;etykieta;u;v;w;h` + dla każdego pola `k`: `k_pl;k_la;k_ru;k_rect` |
| `#k_exp` → `exportKorekty()` | `exportKorekty` | `korekty.csv` | `ksiega;wiersz_zrodlo;pole;przed;po;la;ru;zrodlo;czas` |
| `#k_wers` → `exportWersje()` | `exportWersje` | `wersje_PL_LA_RU.csv` | `ksiega;wiersz_zrodlo;` + dla każdego pola `f_PL;f_LA;f_RU` |
| `#k_formy` → `exportFormy()` | `exportFormy` | `formy_imion_nazwisk.csv` | `typ;wariant;liczba;pierwsze_wystapienie;wystapienia;status;pl;la;ru` |
| `#d_exp` → `exportSlownik()` | `exportSlownik` | `slownik_imion.csv` | `pl;plec;la;ru;status` |
| `#k_scan` | (inline) | `skany_obszary.csv` | `ksiega;wiersz_zrodlo;plik;x;y;w;h` |

Uwagi:
- `krExport` (`ksiega_1783_akty.csv`) dotyczy **księgi z 1783** (`KR_TYP = 'Liber primus Baptisatorum'`), a nie bazy 1797–1945. Trzeba go traktować jako osobne źródło.
- `exportKorekty` dla wpisu dziennika czyta pole `e.wiersz`, a nagłówek CSV podaje `wiersz_zrodlo`. W pliku CSV klucz nazywa się więc inaczej niż w localStorage.
- Kodowanie BOM: funkcja `download` w tym pliku wywołuje `dl(name, text, 'text/csv')`, ale **nie definiuje** `dl` (wstrzykiwane przy budowaniu). BOM: **nieustalone**.

**PRZYKŁAD (wymyślony) — wiersz `korekty.csv`:**

```
ch;123;imie;Jan;Johannes;Johannes;;edit;2026-11-01T10:00
```

### 5.3 Importery CSV

| Przycisk | Plik wejściowy | Klucz dopasowania |
|---|---|---|
| `#k_imp` → `importKorekty()` | `korekty.csv` | `ksiega:wiersz_zrodlo`; pole musi być w `NAMEF[book]`; pomija, gdy `po`, `la`, `ru` takie same jak obecne |
| `#k_scan_imp` | `skany_obszary.csv` | `ksiega:wiersz_zrodlo`; zapis `ST.scan[klucz] = {f: plik, x, y, w, h}` |
| `#d_imp` | `slownik_imion.csv` | `pl` (bez rozróżnienia wielkości liter); domyślnie `plec: 'ob'`, `status: 'propozycja'` |

Import `wersje_PL_LA_RU.csv`, `formy_imion_nazwisk.csv` i `ksiega_1783_akty.csv` — **nieustalone** (nie przeczytano handlerów; brak w widzianych fragmentach).

---

## 6. Rozpoznawanie formatu (propozycja, nie wynika z kodu)

Pliki nie mają pola wersji. Propozycja rozpoznania w `migrujStaryStan(plik)`:

| Format | Kryterium (propozycja) |
|---|---|
| Kopia zgonów (`weryfikacja_kopia.json`) | obiekt z kluczem `acts`, a w nim wartości mają `f` i `done`; obecne `cur`, `hist`, `v3` lub `repIgn` |
| Kopia małżeństw (`malzenstwa_stan.json`) | obiekt z `acts`, klucze `id` zaczynają się od `ai1-m` (wg plików ai1); bez `hist` i `repIgn` |
| Decyzje dopasowania (`dopasowanie_decyzje.json`) | obiekt, którego wartości są obiektami z tablicami `acc` i `rej` |
| Edytor (localStorage `blinow_edytor_v1`) | obiekt z `log`, `dict`, `forms`, `scan`, `skan`; **brak kopii JSON** w menu, więc źródłem jest localStorage albo CSV |
| CSV zgonów | nagłówek zawiera `id`, `verification_status`, `uncertain_fields`, `death_year` |
| CSV małżeństw | nagłówek zawiera `id`, `marriage_year`, `marriage_act_number`, `verification_status` |
| `korekty.csv` | nagłówek `ksiega;wiersz_zrodlo;pole;przed;po;la;ru;zrodlo;czas` |

Uwaga: „kopia JSON” edytora nie istnieje. Plan (krok 0) zakładał kopię JSON także dla edytora — w kodzie jest tylko CSV i localStorage. To trzeba uwzględnić w kroku 0.

---

## 7. Mapowanie identyfikatorów (podsumowanie)

| Źródło | Klucz w starym stanie | Pole w CSV | `id_dawne` |
|---|---|---|---|
| Zgony | `S.acts[id]`, `id` jak `idx-RRRR-N` | `id` | **nie występuje** |
| Małżeństwa | `S.acts[id]`, `id` jak `ai1-mRRRR-NNN` | `id` | **nie występuje** |
| Dopasowanie | klucz `DEC` = id małżeństwa lub `B:`/`D:` + id; rekordy `{t, id}` | (brak importu CSV) | **nie występuje** |
| Edytor | `ksiega:wiersz_zrodlo` | `ksiega`, `wiersz_zrodlo` | **nie występuje**; `akt_id` w `ksiega_1783_akty.csv` — źródło **nieustalone** |

Zalecenie: w migracji kluczem zapasowym dla zgonów i małżeństw jest `id`. Dla edytora mapowanie na akty wymaga osobnego ustalenia (`ksiega:wiersz_zrodlo` → id aktu).

Uwaga dla migracji: id małżeństw są generowane w pliku `MALZENSTWA_RRRR_ai1_import.csv` (kolumna `id`). Jeśli ten plik zostanie przebudowany, id mogą się zmienić. Wtedy kopie JSON z `S.acts` przestaną pasować.

---

## 8. Kodowanie i BOM

| Eksport | BOM | Źródło (kod) |
|---|---|---|
| Zgony CSV (`mCsv`) | tak (`dl` zdefiniowana w pliku, linia ~294; domyślnie BOM dla nie-`.ged`) | `wspolne/plik.js` (wklejona kopia) |
| Zgony autozapis | tak (`'﻿' + csvText()`) | `autoQueue` |
| Zgony JSON (`mSave`) | tak, wg `dl` (nazwa nie kończy się na `.ged`) | `dl` |
| Małżeństwa CSV (`bExp`) | tak (`'﻿' + text`) | `download` w szablonie |
| Małżeństwa JSON (`mJson`) | tak (`download` dodaje BOM do każdego pliku, także JSON) | `download` |
| Dopasowanie (JSON/CSV) | **nieustalone** (`dl` nie znaleziono w szablonie) | `dopasowanie/szablon.html` |
| Edytor (CSV) | **nieustalone** (`dl` nie zdefiniowane w szablonie) | `narzedzia/edytor_korekt_szablon.html` |

Parsery: zgony i małżeństwa usuwają BOM na początku (`replace(/^﻿/, '')`) i obsługują `""` w cudzysłowie. Separator `;` w każdym pliku.

---

## 9. Nieustalone (do sprawdzenia przed krokiem 4)

1. Dokładna lista `D.cols` dla małżeństw (build).
2. Format id rekordów w `dop.v1` (`ARR` w buildzie).
3. Czy istnieją starsze klucze `bazazgonow1`, `bazazgonow2` i `wz1` poza fallbackiem w kodzie (w pliku bazy są tylko odwołania do `wz1` jako wartości domyślnej, nie zapisane dane).
4. Znaczenie `S.v`, `S.seeded`, kod `ak` w edytorze.
5. Źródło `akt_id` i `r.id` w `krList()` (edytor).
6. Handlery importu `wersje_PL_LA_RU.csv`, `formy_imion_nazwisk.csv`, `ksiega_1783_akty.csv`.
7. Pierwszeństwo: localStorage czy dziennik (edytor, rozbieżność z UI).
8. BOM dla JSON i CSV w dopasowaniu i edytorze.
9. Handler `#mAi` (dołączanie CSV z odczytem AI) i pełny kod `rows()` zgonów (zakres `verification_status`).
10. Czy w repo jest jakiekolwiek plik kopii zgonów, małżeństw, `dop.v1` lub edytora (wg `KROK0_inwentarz_eksportow.md`: brak; zgodnie z tym dokumentem nie ma).
