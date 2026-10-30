# Audyt zgonów Blinów 1943–1945 (145 aktów zweryfikowanych)

Źródło: `ZGONY_zweryfikowane_AKTUALNE.csv` (1943: akty 26–64 = 39, 1944: 1–59, 1945: 1–47). Wszystkie wiersze mają teraz kolumnę `source_office` = „USC Szastarka" (dodana też w `ZGONY_ai1_import.csv`, `ZGONY_1944_…`, `ZGONY_1945_…` i w eksporcie narzędzia).

## Braki wynikające z treści aktów (nie błąd)
- Przyczyna zgonu i miejsce pochówku: puste we wszystkich 145 aktach (akty ich nie podają).
- Godzina zgonu: brak w 132 aktach (13 ma godzinę).
- Wdowa/wdowiec bez małżonka: 29 aktów – akt podaje tylko stan „wdowa/wdowiec", nie podaje zmarłego małżonka.
- 1943: księga zaczyna się od aktu 26 (3.03.1943); akty 1–25 są w innym tomie / nieuwzględnione.

## Do sprawdzenia na skanie (prawdopodobne braki lub błędy)
| Akt | Problem |
|---|---|
| 1943/46 Flis Józefa | brak imienia matki, nazwisko matki „?" |
| 1944/32 Wielgus Władysława | zamężna/wdowa bez nazwiska rodowego (ojciec: Łach) |
| 1944/27 Sulowska Anastazja | rodowe „Pochwatka" ≠ ojciec „Skrzypek" (możliwe, sprawdź) |
| 1944/31 Kosidło Barbara | rodowe „Tylus" ≠ ojciec „Kosidło" (możliwe, sprawdź) |
| 1944/10 | nazwisko „Samal" vs ojciec „Samol" – literówka? |
| 1944/15 Sulowski Józef | ojciec „Suloski" – literówka? |
| 1944/42 Wnuk, 1944/44 Widomska | zgłaszający z „?" (Stanisław Pcionek?, Jan Mazur?) |
| 1945/29 Kraczyk Jadwiga | brak imienia matki (w notatce: nieznane; rodzina Bogunów) |
| 1945/40 Kudrelek Łucja | brak nazwiska rodowego matki |
| 1945/37 Kozdra Michał | brak daty aktu (`act_date`); w tekście ojciec „Kordra" vs „Kozdra" |
| 1944/11 Harsz Klemens | dorosły mężczyzna bez zawodu (może: organista/kościelny jest świadkiem) |
| 1944/14, 1944/15 | brak zgłaszającego – akty przeniesione na podstawie pism (Sąd Lublin / Kreishauptmann) |
| 1943/63, 1944/44, 1945/4, 1945/13 | brak imienia ojca – 3 z 4 to dzieci niezamężnych matek (OK), 1944/44 do sprawdzenia |

## Akty spisane długo po zgonie (>30 dni)
1943/60 (78 dni), 1943/64 (31), 1944/14 (97), 1944/15 (67), 1945/44 (665 – zgon 9.02.1944), 1945/47 (583 – zgon 27.05.1944).

## Sprawdzone i spójne
- Numeracja: 1944 i 1945 bez luk i dubli.
- Płeć zgodna z imieniem i stanem; brak mężczyzn z nazwiskiem rodowym.
- Wszystkie dziewczynki i panny (27) mają nazwisko rodowe = nazwisko (przyjęta konwencja); 4 panny z rodowym równym nazwisku: 1943/30, 1945/11, 1945/31, 1945/36.
- Żonaci/zamężne mają małżonka; żadnych dzieci z małżonkiem; wiek, daty (zgon nie po akcie) w normie.
