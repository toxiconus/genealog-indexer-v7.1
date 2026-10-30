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
| `[niepodane]` | akt nie zawiera tej informacji (rubryka pominięta) | zawód, miejsce urodzenia |
| `[niepamiętne]` | akt mówi wprost, że nieznane/niepamiętne (nieznane nazwisko rodowe, „z niepamiętnych małżonków") | mother_last_name 1945/40 |
| `[nieślubne]` | brak ojca, bo dziecko z niezamężnej matki (zamiast pustego) | father_first/last |
| `[uszkodzone]` | ubytek karty/obcięty brzeg/plama | |
| puste | wyłącznie „nie dotyczy" (maiden u mężczyzn, spouse u kawalerów/dzieci, zawód dziecka) | |

Reguły: 1) zawsze nawiasy `[ ]`, bez wariantów (nie „brak", „nieznane", „-", „?" samo). 2) `[...]` zastępuje całą wartość; `?` dopisujemy tylko do wartości. 3) Pole puste = tylko „nie dotyczy" – cokolwiek innego dostaje znacznik. 4) Oznaczenie tej samej wartości w obu rodzicach itd. identyczne. 5) Wyszukiwanie/statystyki traktują `[...]` jako brak danych, nie jako nazwisko.

## Wdrożenie (po akceptacji)
1. Migracja CSV 43–45: `?` samo → `[nieczytelne]` (po sprawdzeniu na skanie), puste ojciec przy dziecku niezamężnej → `[nieślubne]`, reszta pustych wg reguły „dotyczy / nie dotyczy".
2. Narzędzia (zgony, małżeństwa): przyciski przy polu `?` · nieczyt. · niepodane · niepamięt. · nieślub., zamiast wpisywania ręcznie; baza podpowiedzi ignoruje `[...]`.
3. Audyt: osobna statystyka per znacznik.
