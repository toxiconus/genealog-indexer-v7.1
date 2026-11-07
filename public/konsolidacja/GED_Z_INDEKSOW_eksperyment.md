# Eksperyment: GED parafii Blinów zbudowany tylko z indeksów

Skrypt: `skrypty/buduj_ged_blinow.py` (wejście: `blinow_scalone.csv`, `malzenstwa_mal.csv`, `zgony.csv`; bez żadnego GED).
Porównanie z drzewem (prywatnym, poza repo): `skrypty/porownaj_ged_z_indeksami.py <GED_z_indeksow> <nasz_GED>`.

## Wynik budowy
- Wejście: 5 943 chrzty (1783–1796, 1826–1908), 721 małżeństw (1841–1894), 2 624 zgony (1797–1880).
- Wyjście: 13 242 osoby, 2 640 rodzin (2 303 z dziećmi, 652 ze ślubem), 4 718 osób z rodzicami.
- Śluby: 315 dopasowano do grup chrztów, 337 dało nową rodzinę; 486 małżonków powiązano z własnym chrztem.
- Zgony: tylko 109 dopasowano jednoznacznie do osoby (w zgonach prawie nie ma wieku, rodziców i małżonka).
  1 249 zgonów jest niejednoznacznych, 1 256 bez żadnego kandydata (zostają jako osobne osoby).
- Spójność pliku: 0 zerwanych odwołań INDI/FAM.
- Kontrola: Wawrzyniec Pudło ur. 1828 (rodzice Maciej i Katarzyna) ma śluby 1846 nr 2 i 1883 nr 16, zgodnie z tabelą 1865 (nr 11).

## Porównanie z naszym GED (tylko liczby)
- Małżeństwa 1841–1894 z datą w naszym GED: 755; zgodne z indeksem (mąż imię+nazwisko, imię żony, rok ±1): 560 (74%).
  Niezgodne: np. Pudło/Kopiwoda 1872, 1877, 1881, których w indeksie małżeństw w ogóle nie ma — albo spoza Blinowa, albo luki w indeksie.
- Osoby z indeksów (ur. ≥1783) o nazwiskach obecnych w naszym GED: 4 124, znalezione u nas 1 168 (28%).
  Czyli drzewo obejmuje mniej niż jedną trzecią osób z indeksu dla tych samych nazwisk (np. Kosidło 113 z 425, Bucoń 17 z 115).
- Brakuje u nas m.in. wszystkich Buconiów z Majdanu 1783–1796 i Franciszki Kopiwody (1783/6, rodzice Łukasz i Elżbieta).

## Ograniczenia
- Zgody rodziców oparte na imieniu ojca+matki+nazwisku panieńskim+miejscowości i rozstępie ≤24 lat; popularne pary mogą się zlewać.
- Chrzty 1797–1825 nie istnieją w indeksie; zgony nie mają wieku, więc nie łączą się z chrztami.
- Brak rozróżnienia drugich małżeństw poza datą i imionami.
