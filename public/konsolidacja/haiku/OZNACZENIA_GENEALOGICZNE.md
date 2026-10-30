# Oznaczenia braków i niepewności (propozycja – do zatwierdzenia)

## Stan obecny (zgony 43–45, 145 aktów)
- `X?` – odczyt niepewny, wartość jest (ok. 200 pól: nazwiska rodziców, zgłaszający, miejsca, godziny, wiek)
- `?` samo – nie wiadomo co: nieczytelne czy niepodane (age 13×, mother_last 4×, father_last 2×, mother_first 2×, death_time 2×, urodzenie 1×)
- puste – znaczy trzy różne rzeczy: nie dotyczy (maiden u mężczyzn, spouse u kawalerów), akt nie podaje, nie sprawdzone (profession 63×, spouse 100×, ojciec 4–5×)
- `[nieczytelne]`, `(nazwisko rodowe nieznane)`, „niepamiętnych małż." – tylko w tekście/uwagach, niespójnie

## Proponowany słownik (w nawiasach kwadratowych, zawsze to samo)
| Znacznik | Znaczenie | Przykład |
|---|---|---|
| `X?` | wartość jest, odczyt niepewny | `Łach?` |
| `[nieczytelne]` | w akcie coś jest, nie da się odczytać (skan/pismo/uszkodzenie) | godzina, nazwisko matki |
| `___` | nie podano w akcie (rubryka pominięta) | zawód, miejsce urodzenia |
| `[niepamiętne]` | akt mówi wprost, że nieznane/niepamiętne (nieznane nazwisko rodowe, „z niepamiętnych małżonków") | mother_last_name 1945/40 |
| `---` | brak: ojca nie ma (dziecko niezamężnej) lub osoba nie istnieje | father_first/last |
| `[uszkodzone]` | ubytek karty/obcięty brzeg/plama | |
| puste | wyłącznie „nie dotyczy" (maiden u mężczyzn, spouse u kawalerów/dzieci, zawód dziecka) | |

Reguły: 1) zawsze nawiasy `[ ]`, bez wariantów (nie „brak", „nieznane", „-", „?" samo). 2) `[...]` zastępuje całą wartość; `?` dopisujemy tylko do wartości. 3) Pole puste = tylko „nie dotyczy" – cokolwiek innego dostaje znacznik. 4) Oznaczenie tej samej wartości w obu rodzicach itd. identyczne. 5) Wyszukiwanie/statystyki traktują `[...]` jako brak danych, nie jako nazwisko.

## Wdrożenie (po akceptacji)
1. Migracja CSV 43–45: `?` samo → `[nieczytelne]` (po sprawdzeniu na skanie), puste ojciec przy dziecku niezamężnej → `---`, reszta pustych wg reguły „dotyczy / nie dotyczy".
2. Narzędzia (zgony, małżeństwa): przyciski przy polu: ? · ___ · --- · nieczyt. · niepamięt., zamiast wpisywania ręcznie; baza podpowiedzi ignoruje znaczniki.
3. Audyt: osobna statystyka per znacznik.

## Do analizy
Ojciec podany, ale akt dodaje okoliczność (Ameryka, wojsko, zm.) oraz wdowa bez wymienionego ojca. Propozycja: imię i nazwisko wpisane normalnie + osobna rubryka okoliczności (np. `parent_status`); wdowa bez ojca = `___`. Najpierw zliczyć takie przypadki w danych (zgony i małżeństwa).

## Uzgodnione 30.10
- W polu: tylko znaczniki (`___`, `---`, `[niepamiętne]`, `[nieczytelne]`, `X?`). Słowa z aktu (np. „nieślubne", „w Ameryce", „w wojsku") piszemy w uwagach, jeśli akt to wprost podaje.
- `[niepamiętne]` i `[nieczytelne]` zostają bez zmian.
- `b.d.` (brak danych) = osobny znacznik: pole nieznane, bo mamy tylko indeks, a aktu/skanu nie czytaliśmy; w uwagach dopisek „tylko z indeksu". To różni się od `___` (akt czytany, niczego nie podaje).
