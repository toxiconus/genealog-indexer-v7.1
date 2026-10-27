#!/usr/bin/env python3
"""Normalizacja imion rodziców w zgony.csv: zapis ze starych ksiąg „s./c. <dopełniacz>” (np. Jana, Marianny)
-> mianownik (Jan, Marianna). Oryginalny zapis zostaje w kolumnie surowe_kol_6. Formy niejednoznaczne
(ojciec: Franciszka, Stanisława – Franciszek/Stanisław czy pomyłka kolumny) NIE są zmieniane; trafiają do
zgony_do_sprawdzenia_imiona.csv z pełnym zapisem. Log: zgony_log_imiona_rodzicow.csv.
Użycie: python3 normalizuj_imiona_rodzicow.py [--zapisz]"""
import csv, os, sys
up = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = os.path.join(up, 'zgony.csv')
OJ = {'Wojciecha':'Wojciech','Jana':'Jan','Pawła':'Paweł','Marcina':'Marcin','Antoniego':'Antoni','Józefa':'Józef','Andrzeja':'Andrzej',
 'Tomasza':'Tomasz','Jakuba':'Jakub','Szymona':'Szymon','Macieja':'Maciej','Michała':'Michał','Walentego':'Walenty','Bartłomieja':'Bartłomiej',
 'Piotra':'Piotr','Mateusza':'Mateusz','Wawrzyńca':'Wawrzyniec','Filipa':'Filip','Adama':'Adam','Kacpra':'Kacper','Jędrzeja':'Jędrzej',
 'Grzegorza':'Grzegorz','Dominika':'Dominik','Kazimierza':'Kazimierz','Szczepana (?)':'Szczepan (?)','Wincentego':'Wincenty','Mikołaja':'Mikołaj',
 'Sebastiana':'Sebastian','Łukasza':'Łukasz','Leonarda':'Leonard','Krzysztofa':'Krzysztof','Nikodema':'Nikodem','Onufrego':'Onufry',
 'Aleksandra':'Aleksander','Feliksa':'Feliks'}
OJ_PISOWNIA = {'Woyciecha':'Wojciech','Wawrzenca':'Wawrzyniec','Kaspra':'Kasper'}   # starsza pisownia
OJ_WSTRZYMANE = {'Franciszka','Stanisława'}                                       # wymagają kontekstu
MA = {'Marianny':'Marianna','Katarzyny':'Katarzyna','Zofii':'Zofia','Agnieszki':'Agnieszka','Franciszki':'Franciszka','Anny':'Anna','Jadwigi':'Jadwiga',
 'Ewy':'Ewa','Antoniny':'Antonina','Rozalii':'Rozalia','Anastazji':'Anastazja','Agaty':'Agata','Magdaleny':'Magdalena','Tekli':'Tekla',
 'Petroneli':'Petronela','Teresy':'Teresa','Małgorzaty':'Małgorzata','Józefy':'Józefa','Barbary':'Barbara','Reginy':'Regina','Doroty':'Dorota',
 'Anieli':'Aniela','Łucji':'Łucja','Cecylii':'Cecylia','Elżbiety':'Elżbieta','Henryki':'Henryka','Salomei':'Salomea','Zuzanny':'Zuzanna'}
MA_PISOWNIA = {'Maryanny':'Marianna','Marjanny':'Marianna','Zofji':'Zofia'}
raw = open(F, encoding='utf-8-sig', newline='').read()
rows = list(csv.reader(raw.splitlines(), delimiter=';'))
h = rows[0]; ix = {c: i for i, c in enumerate(h)}
log, review, unk = [], [], []
for r in rows[1:]:
    for col, g, sp in (('ojciec_imie', OJ, OJ_PISOWNIA), ('matka_imie', MA, MA_PISOWNIA)):
        v = r[ix[col]]
        if not v: continue
        if col == 'ojciec_imie' and v in OJ_WSTRZYMANE:
            review.append(r); continue
        n, why = (g[v], 'dopełniacz -> mianownik') if v in g else ((sp[v], 'starsza pisownia + dopełniacz -> mianownik') if v in sp else (None, None))
        if n is None:
            if v not in set(g.values()) | set(sp.values()): unk.append((col, v))
            continue
        log.append((r[ix['wiersz_zrodlo']], col, v, n, why)); r[ix[col]] = n
print('zmian:', len(log), '| wstrzymane do sprawdzenia:', len(review), '| nieznane formy:', sorted(set(unk)))
if '--zapisz' in sys.argv:
    with open(F, 'w', encoding='utf-8-sig', newline='') as f: csv.writer(f, delimiter=';', lineterminator='\r\n').writerows(rows)
    with open(os.path.join(up, 'zgony_log_imiona_rodzicow.csv'), 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f, delimiter=';', lineterminator='\r\n'); w.writerow(['wiersz', 'pole', 'przed', 'po', 'powod']); w.writerows(log)
    with open(os.path.join(up, 'zgony_do_sprawdzenia_imiona.csv'), 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f, delimiter=';', lineterminator='\r\n')
        w.writerow(['id_archiwalne', 'rok', 'nr_wpisu', 'nazwisko', 'imie', 'ojciec_imie', 'matka_imie', 'matka_nazwisko', 'uwagi', 'surowe_kol_6', 'surowe_pozostale'])
        for r in review: w.writerow([r[ix[c]] for c in ('id_archiwalne', 'rok', 'nr_wpisu', 'nazwisko', 'imie', 'ojciec_imie', 'matka_imie', 'matka_nazwisko', 'uwagi', 'surowe_kol_6', 'surowe_pozostale')])
    print('zapisano')
