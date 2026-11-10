# Różnice: eksport weryfikacji vs dane w aplikacji

Źródło eksportu: `ZGONY_zweryfikowane_10.csv` (881 wierszy, unikalne id).
Źródło danych: `D.acts[].ai` z `narzedzia/baza_zgonow_1797-1945.html` (stan fabryczny, świeży Chromium bez localStorage; 2953 akty, wszystkie 881 id z eksportu występują w danych).

Metoda: porównanie po `id`, wspólne kolumny, wartości po `trim`. Pomijane: pola puste po obu stronach. Kolumny `act_text`, `scan_path`, `verification_notes`, `notes_org` porównywane bez białych znaków (różnice tylko spacjami pominięte). Kolumny `id`, `verification_status` i kolumny nieobecne w `ai` nie są porównywane.

**Ważne zastrzeżenie dotyczące `death_act_number`:** w `ai` aplikacji pole to jest puste (None) dla wszystkich aktów, a w eksporcie ma wartość. Każdy akt daje więc jedną różnicę, która nie jest poprawką użytkownika, tylko brakiem pola w danych. Poniżej liczby podaję osobno: z tym polem i bez niego.

## (a) Status ok (8 aktów)

Różnice w 8 z 8 aktów (w tym `death_act_number` w 8/8). Bez `death_act_number`: 7 aktów.

| id | pole | eksport | dane |
|---|---|---|---|
| idx-1797-1 | death_act_number | 1 | (puste) |
| idx-1797-1 | profession | agricola | Agricola |
| idx-1797-1 | notes | (puste) | wiek: Tria - jednostka niepewna (mens. czy dies), data urodzenia w bazie (CH.LUB.BLIN.1796.a5) nieznana (artefakt arkusza 30.12.1899) |
| idx-1797-2 | death_act_number | 2 | (puste) |
| idx-1797-2 | profession | agricola | Agricola |
| idx-1797-3 | death_act_number | 3 | (puste) |
| idx-1797-3 | profession | agricola | Agricola |
| idx-1797-4 | death_act_number | 4 | (puste) |
| idx-1797-4 | age | 2 | 2? |
| idx-1797-4 | profession | agricola | Agricola |
| idx-1797-4 | notes | (puste) | jednostka wieku niewidoczna |
| idx-1797-5 | death_act_number | 5 | (puste) |
| idx-1797-5 | profession | agricola | Agricola |
| idx-1797-6 | death_act_number | 6 | (puste) |
| idx-1797-7 | death_act_number | 7 | (puste) |
| idx-1797-7 | profession | agricola | Agricola |
| idx-1797-7 | notes | podpis: Ego Michael Pawlikowski() supra scriptos sepelivi | podpis: Ego Michael Pawlikowski(?) supra ... (tekst skrócony) |
| idx-1797-8 | death_act_number | 8 | (puste) |
| idx-1797-8 | deceased_sex | K | (puste) |
| idx-1797-8 | profession | agricola | Agricola |

Pełna lista różnic: 8 wierszy `death_act_number` (wszystkie 8 aktów), 7 wierszy `profession` (tylko wielkość liter), 3 wiersze `notes`, 1 `age`, 1 `deceased_sex`. Akt idx-1797-6 ma wyłącznie różnicę `death_act_number`.

## (b) Status ai_v1_w_trakcie (433 akty)

- Akty z jakąkolwiek różnicą (w tym `death_act_number`): **433 z 433**.
- Akty z różnicą poza `death_act_number`: **229 z 433**.
- Różnice pól poza `death_act_number` (liczba aktów, po jednym na akt):

| # | pole | akty |
|---|---|---|
| 1 | deceased_first_name | 115 |
| 2 | death_time | 58 |
| 3 | deceased_status | 47 |
| 4 | deceased_last_name | 21 |
| 5 | profession | 20 |
| 6 | mother_first_name | 18 |
| 7 | informant2 | 17 |
| 8 | informant1 | 13 |
| 9 | deceased_residence | 7 |
| 10 | mother_last_name | 4 |
| 11 | father_last_name | 2 |
| 12 | father_first_name | 2 |
| 13 | death_place | 1 |

Tylko 13 pól ma jakiekolwiek różnice poza `death_act_number`. Rozkład typów (wszystkie pola, bez `death_act_number`): wartość inna 217, pusty w eksporcie 58, pusty w danych 30, tylko wielkość liter 20, różnice w znakach `?()[]` 61.

Przykłady (id, pole, eksport, dane):

1. idx-1797-10, deceased_first_name, Jacobus, Jakub
2. idx-1798-27, deceased_last_name, Wołoszynowna?, Wołoszynowna
3. idx-1806-209, mother_first_name, Dorothae?, Dorota?
4. idx-1809-277, father_last_name, Woytalasow Agricolarum, Wojtalasow Agricolarum
5. idx-1813-371, deceased_status, dziecko, [_]
6. asc-1874-002, informant2, Bonifacy Dąbrowski?, Bonifacy Dąbrowski
7. asc-1874-010, death_time, (puste), 01:00
8. asc-1874-010, mother_last_name, Szabat?, Szabat
9. asc-1874-010, informant1, Franciszek Paczyński, 38?, Franciszek Pa?czyński, 38
10. asc-1874-011, death_time, (puste), 17:00

## (c) Status ai_v1 (440 aktów)

- Akty z jakąkolwiek różnicą: **440 z 440** (każdy przez `death_act_number`).
- Akty z różnicą poza `death_act_number`: **295 z 440**.
- Najczęstsze pola: deceased_first_name 124, death_time 115, profession 87 (tylko wielkość liter), informant1 30, deceased_spouse 27, informant2 25, deceased_last_name 20, notes 20.

## (d) Wnioski

1. Eksport zawiera poprawki użytkownika w statusie ok, które dane jeszcze nie mają: płeć K w idx-1797-8 (dane puste), uzupełnienie notes w idx-1797-1 i idx-1797-4, zmiana tekstu podpisu w idx-1797-7. Do danych warto je przenieść po decyzji.
2. Różnice `?` (np. age 2 vs 2?, deceased_last_name Wołoszynowna? vs Wołoszynowna) są spójne z tym, że użytkownik usuwał lub dodawał znaki niepewności; te zmiany wymagają decyzji, bo po stronie danych część znaków `?` jest wstawiona w środku słowa (np. Pa?czyński), co wygląda na błąd.
3. Pola `death_time` (115 aktów w ai_v1, 58 w ai_v1_w_trakcie) i `deceased_status` (47) mają w eksporcie puste wartości lub inne wartości niż dane, co nie wygląda na świadomą poprawkę (zwłaszcza death_time: eksport pusty, dane mają godzinę), więc przed powrotem do danych trzeba sprawdzić, czy kolumna nie została utracona podczas eksportu z aplikacji lub czy zmiany użytkownika zapisane w localStorage nie są uwzględnione (porównanie było z danymi fabrycznymi).
