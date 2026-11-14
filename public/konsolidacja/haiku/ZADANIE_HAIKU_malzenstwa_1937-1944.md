# Zadanie dla Haiku: odczyt aktów małżeństw Blinów 1937–1944 (księga USC Szastarka)

Wszystkie zasady, układ 48 kolumn CSV (separator `;`, UTF-8 z BOM, nagłówek jak we wzorze), sposób wypełniania pól i znaczniki – **identyczne jak w** `ZADANIE_HAIKU_malzenstwa_1945_akty13-22.md` i wzorze `MALZENSTWA_1945_wzor_akt13_claude.csv` (przeczytaj oba na początku). Różnice:

- Obrazy: `/tmp/claude-0/-home-claude/98dd8170-cf13-5431-a6d5-7a8da626defc/scratchpad/crops/NNN_L.jpg` (lewa strona rozkładówki) i `NNN_P.jpg` (prawa) – NNN to numer pliku skanu (001–101) z folderu `1937-1944 USC Szastarka`. Czytaj kolejno swoje numery, obie strony każdego. Plik 001 itp. mogą być okładką/stroną tytułową/pustą – pomiń.
- Rok i numer aktu odczytaj z treści aktu (nagłówek „Nr …” na marginesie i data w tekście). `id` = `ai1-m{rok}-{NNN}` (nr aktu trzycyfrowo, np. ai1-m1938-007), `marriage_year`=rok aktu. W księdze są akty z lat 1937–1944; na końcu każdego roku jest protokół zamknięcia i alfabetyczny rejestr – NIE są aktami: nie twórz wierszy, ale zapisz je w pliku rejestru (niżej).
- Ta sama strona bywa sfotografowana kilka razy (inne ułożenie kartki, wklejka) lub ktoś sfotografował dokument bez właściwych stron – jeśli akt (ten sam rok i numer) jest na kilku zdjęciach, zapisz go tylko raz z najczytelniejszego zdjęcia, a pozostałe pliki wypisz w `verification_notes` („duplikat: NNN_L”). Jeśli strona nie zawiera aktu, zapisz to w pliku rejestru.
- Akty 1944/21–23 i 1945 są już w bazie – jeśli trafisz na nie, zapisz je normalnie (scalimy automatycznie).
- Ocenę wiarygodności zostaw polu `uncertain_fields`. Nie wymyślaj nazwisk – lepiej puste + wątpliwe.

## Wynik (katalog `public/konsolidacja/haiku/MALZ_1937-44/`)
- `<KOD>_akty.csv` – wiersze aktów (nagłówek jak wzór, 48 kolumn).
- `<KOD>_skany.csv` – `rok;akt;plik;strona(lewa/prawa)` (plik = NNN.jpg, rok z aktu).
- `<KOD>_rejestr.txt` – po jednej linii na każdy przeczytany plik: `NNN;L: <co to> | P: <co to>` (np. „akt 1938/5”, „protokół zamknięcia 1937 (27 aktów)”, „rejestr alfabetyczny 1938”, „pusta”, „okładka”, „duplikat 012_L”).
W odpowiedzi podaj tylko: ile aktów odczytano i które pliki były nieczytelne.
