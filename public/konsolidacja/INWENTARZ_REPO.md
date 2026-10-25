# Inwentarz repo i porządki (2026-10-25)

## Źródła prawdy (nie ruszać, nie duplikować)
| Co | Plik | Uwagi |
|---|---|---|
| Chrzty Blinów | `konsolidacja/blinow_akty.csv` (5488 aktów), `blinow_scalone.csv` (7682 wierszy z kartami) | `.json` to pochodne tych CSV |
| Zgony | `konsolidacja/zgony.csv` (2624) | rzadkie dane: wiek 13%, rodzice 11% |
| Małżeństwa | `konsolidacja/malzenstwa_mal.csv` (721) | data w 47% |
| Indeksator | `public/v6/index.html` + `templates-config.js` | wersja rozwijana w tej pracy; `public/v10/` istnieje obok – status do potwierdzenia |
| Dopasowanie osób | `konsolidacja/dopasowanie/` (`szablon.html` + `build.py` → `dopasowanie_osob.html`) | dane wklejane z CSV przez build |
| Nazwiska | `konsolidacja/slownik_nazwisk.csv` (skrypt `skrypty/slownik_nazwisk.py`) | propozycje, wymagają decyzji |

## Usunięte dzisiaj (identyczne kopie, SHA-256; w git, więc odwracalne)
- `public/viewer-osd-v4.html.backup-20251218-221701`
- `public/viewer-osd-v8 — kopia (2) — kopia.html`
- `public/viewer-osd-v7.html.backup-heavy-duty-20251220-125812.html`
- `public/viewer-osd-v6.backup-step1.html`
- `public/viewer-osd-v5 — kopia (2).html`
- `public/viewer-osd-v8.html.backup-20260105-with-test-data`
- `public/viewer-osd-v8.html.backup-20260105-marriage-death-birth`
- `public/viewer-osd-v8.html.backup-20260105-phase3-advanced-features`
- `public/viewer-osd-v7.html.backup-opencv-20251219-233455`
- `public/viewer-osd-v7.html.backup-phase6-start-20251220-000120`
- `public/viewer-osd-v8.html.backup-20260105-critical-fixes`
- `public/viewer-osd-v8.html.backup-20260105-phase2-complete`
- `public/viewer-osd-v8.4 — kopia.html`
- `public/viewer-osd-v5.backup-v5-complete.html`
- `public/viewer-osd-v8.html.backup-20260105-critical-ui-fixes`
- `public/viewer-osd-v8.html.backup-20260105-renderActsList-fixed`
- `public/viewer-osd-v7.html.backup-fixed-20251219-215458`
- `public/viewer-osd-v8.html.backup-20260105-syntax-error-fixed`
- `public/viewer-osd-v8.6 — kopia.html`
- `public/viewer-osd-v8.html.backup-20260105-floating-form-fixed`
- `public/viewer-osd-v8.html.backup-20260105-acta-v1-migration-complete`

Zostawiono po jednej kopii każdej treści (preferencja: `backups_v8_ordered/`, potem plik bez „kopia”/„(2)”). Nie ruszano `viewer-osd-v9.ost.html` ani `viewer-osd-dev.html` (nazwy wskazują na używane wejścia), mimo że mają identyczne odpowiedniki.

## Do decyzji (różne pliki, prawdopodobnie przestarzałe) – nic nie przenoszono
- **56 plików `viewer-osd-*.html`** (v4–v8.21 + backupy): rozwijana jest v6 (`public/v6/`; sprawdzić też `public/v10/`). Proponuję przenieść całość do `archiwum/viewer-osd/` po Twoim OK.
- **3 bazy `genealogia_2026-02-03*.db` (po 3,5 MB)** – sumy kontrolne różne (zawartość się różni); sprawdzić, która jest aktualna.
- **Teksty chrztów** (`CH BLIN.txt`, `chrzty orginał Blinów.txt`, `chrzty_cleaned.txt`, ~0,8 MB każdy) – źródła do `blinow_akty.csv`; zostawić oryginał, resztę zarchiwizować.
- **`.specstory/` (~16 MB historii rozmów w dwóch katalogach: `.specstory/` 5,5 MB i `public/.specstory/` 11 MB)** – zajmuje najwięcej miejsca; do rozważenia wyłączenie z repo (`.gitignore`).
- **Skrypty jednorazowe** (`check_duplicates.py`, `clean_duplicates.py`, `extract_duplicates.py`, `cleanup-*.html`, `test-supabase.html`) – sprawdzić, czy jeszcze potrzebne.
