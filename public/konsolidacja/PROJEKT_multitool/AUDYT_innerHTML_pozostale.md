# Audyt innerHTML: pozostałe szablony

Data: 2026-11-10. Analiza statyczna, bez uruchamiania stron w przeglądarce. Żaden istniejący plik nie został zmieniony.

Zakres (cztery szablony, nie pliki wygenerowane):

1. `haiku/weryfikacja_szablon.html` (1031 linii, ok. 181 KB)
2. `dopasowanie/szablon.html` (954 linii, ok. 124 KB)
3. `narzedzia/edytor_korekt_szablon.html` (1059 linii, ok. 62 KB)
4. `haiku/weryfikacja_malzenstw_szablon.html` (288 linii, ok. 51 KB)

## Metoda

- Sinki: grep po `innerHTML`, `insertAdjacentHTML`, `outerHTML`, `document.write`, `srcdoc`, `DOMParser`, `createContextualFragment`. W czterech szablonach nie ma poza `innerHTML` żadnego z pozostałych sinków.
- Buildery: funkcje zwracające HTML jako template string lub konkatenację. Pomijam funkcje, które tylko przypisują wynik do `innerHTML` (liczone jako sinki).
- Skrypt analizujący wszystkie `${...}` w blokach z HTML (także w wielolinijkowych template literals) i wypisujący te wyrażenia, które nie są opakowane w `esc(...)`. Wynik sprawdzony ręcznie dla każdego sinku z danymi.
- Kategorie wg zasady z zadania: wysoki = dane z importu (CSV/JSON/GED) trafiają do DOM jako HTML bez `esc`; niski = atrybuty, liczby, identyfikatory; zależny = bezpieczny sam w sobie, ale korzysta z helpera, który wymaga poprawki; bezpieczny = wszystkie dynamiczne wartości przez `esc` lub stałe.

## Ustalenia wstępne

- Funkcja `esc` nie jest zdefiniowana w plikach szablonów 1-3. Szablony mają znacznik `/*MODULE:tekst*/` (weryfikacja l. 284, dopasowanie l. 91, edytor l. 252), który `wspolne/zbuduj.py` zastępuje modułem `wspolne/tekst.js`. Definicja: `const esc = s => String(s ?? '').replace(/[&<>"']/g, ...)`, czyli escapuje `' "` i nadaje się do atrybutów w obu typach cudzysłowów.
- Szablon 4 (`weryfikacja_malzenstw_szablon.html`) nie ma znacznika MODULE i ma własną definicję `esc` (l. 173): `replace(/[&<>"]/g, ...)`, bez apostrofu. Wszystkie atrybuty w tym pliku są w cudzysłowach podwójnych, więc nie ma to skutku dziś. Dla spójności warto ujednolicić z `tekst.js`.
- Poprawki F1-F9 z `AUDYT_innerHTML_v3.md` zostały wdrożone w `narzedzia/weryfikacja_szablon_v3.html` (potwierdzono: `data-v="${esc(val)}"`). Szablon źródłowy `haiku/weryfikacja_szablon.html` ich nie ma: `chipsFor` (l. 431) nadal wstawia `${val}` i `${lbl}` bez `esc`. Trzeba przenieść poprawki do szablonu, inaczej przy następnym buildzie wracają stare błędy.
- Dane wejściowe, które mogą zawierać znaki HTML: import CSV (nazwiska, imiona, miejsca, uwagi, nazwy skanów), import JSON stanu, dla dopasowania także import drzewa GED/JSON. Stan weryfikacji jest zapisywany w `localStorage`, więc niezescapowana wartość wraca przy każdym otwarciu pliku.

## Tabela 1: sinki innerHTML (linie z innerHTML)

| Plik | Linie z innerHTML | Bezpieczne | Niskie | Wysokie |
|---|---|---|---|---|
| haiku/weryfikacja_szablon.html | 19 | 10 | 5 | 4 |
| dopasowanie/szablon.html | 26 | 21 | 5 | 0 |
| narzedzia/edytor_korekt_szablon.html | 16 (17 wystąpień) | 15 | 1 | 0 |
| haiku/weryfikacja_malzenstw_szablon.html | 12 (23 wystąpienia) | 6 | 2 (+3 zależne) | 1 |

Szczegóły sinków wysokiego ryzyka i niskiego są w sekcjach poniżej.

## Tabela 2: buildery HTML (funkcje zwracające string)

| Plik | Buildery | Bezpieczne | Niskie | Zależne | Wysokie |
|---|---|---|---|---|---|
| haiku/weryfikacja_szablon.html | 20 | 15 | 1 | 2 | 2 |
| dopasowanie/szablon.html | 13 | 9 | 4 | 0 | 0 |
| narzedzia/edytor_korekt_szablon.html | 2 | 2 | 0 | 0 | 0 |
| haiku/weryfikacja_malzenstw_szablon.html | 6 | 5 | 1 | 0 | 0 |

Razem: 41 builderów. Łącznie miejsc (sinki + buildery): 114. Bezpieczne 83, niskie 19, zależne 5, wysokie 7.

---

## 1. haiku/weryfikacja_szablon.html

Stan: 19 sinków i 20 builderów. Ten sam wzorzec, co w v3, a w szablonie źródłowym jeszcze niezałatany.

Sinki (numery linii w szablonie):

| Linia | Opis | Ocena | Powód |
|---|---|---|---|
| 277 | baner zapisu | bezpieczny | stały tekst |
| 296, 297 | datalist nazwisk/imion (`value="${k}"`) | niski | klucze z importu w atrybucie, bez `esc` |
| 319 | raport spójności | bezpieczny | wszystko przez `esc` |
| 374 | raport pisowni (`data-go="${id}"`, tekst `id.replace(...)`) | niski | id aktu z importu bez `esc` |
| 382 | historia zmian | bezpieczny | `esc` |
| 417 | zakładki lat i filtrów (`data-y="${y}"`) | niski | rok/etykieta bez `esc` |
| 423 | lista aktów (`data-id`, `title`, `a.act`, `a.year`) | niski | `titleOf`/`nmOf` już przez `esc`, reszta liczby i id bez `esc` |
| 460 | szkielet widoku aktu | bezpieczny | stały tekst |
| 509 | element pomocniczy do zliczania sygnałów | bezpieczny | wszystkie buildery escapują |
| 510 | widok aktu (`m.innerHTML = h...`) | WYSOKI | `nm` (l. 469), `a.lubName`, `a.act`, `a.year`, `a.lubRaw` (l. 474) i `chipsFor` przez `cellOf` bez `esc` |
| 525 | podpowiedzi kategorii (`catHtml`) | bezpieczny | `esc` |
| 570 | pasek kreatora | bezpieczny | stałe etykiety |
| 575 | kreator, koniec pól | WYSOKI | `head` (l. 573) z `nmOf`/`titleOf` bez `esc` |
| 581 | kreator, pole | WYSOKI | `head` (l. 573) i `chipsFor` (l. 431) bez `esc` |
| 627 | toast | bezpieczny | stały tekst |
| 906 | widok tekstowy (nagłówek, sygnały) | bezpieczny | `renderText` escapuje |
| 911 | pasek nawigacji tekstu (`edit()` z `chipsFor`) | WYSOKI | `chipsFor` (l. 431) bez `esc` |
| 1011 | autouzupełnianie | bezpieczny | `esc` |

Buildery (wybrane, pozostałe bezpieczne):

| Linia | Funkcja | Ocena | Powód |
|---|---|---|---|
| 345 | `dwHtml` | niski | `value="${b.d}"`, `value="${b.y}"` bez `esc` (liczby z `dwParse`, fallback `a.year`) |
| 431 | `chipsFor` | WYSOKI | patrz poprawka H1 |
| 573 | `head` (w `renderWiz`) | WYSOKI | patrz poprawka H3 |
| 477-488 | `cellOf` (w `renderAct`) | zależny | korzysta z `chipsFor`, naprawa w l. 431 wystarcza |
| 880 | `edit()` (w `renderText`) | zależny | korzysta z `chipsFor`, naprawa w l. 431 wystarcza |
| 765 | `hlHtml`, `data-f="${it.f}"` | niski | id pola ze schematu, dla spójności `esc` |

Pozostałe buildery (`warnHtml`, `warnsOf`, `repHtml`, `relHtml`, `tagsFor`, `catHtml`, `missingHtml`, `lubPanel`, `vrWarn`, `txtChips`, `sugHtml`, `qedit`, `wedit`, `agePick`) są bezpieczne.

### Poprawki (szablon haiku/weryfikacja_szablon.html)

Wysoki priorytet:

- **H1, `chipsFor`, l. 431.** Zmienić fragment zwracający przycisk na:
  `<button class="chip ${esc(cls)} ${clean(cur)===clean(val)?'sel':''}" data-f="${esc(f)}" data-v="${esc(val)}" data-s="${esc(cls)}"><small>${esc(lbl)}</small>${esc(val)}${extra}</button>`
  Zamiast obecnego `val.replace(/"/g,'&quot;')`. `extra` zostaje, bo to `<small>×n</small>` z liczby.
- **H2, nagłówek `renderAct`, l. 469 i 474.** `${nm}` na `${esc(nm)}`. `${a.year}` i `${a.act}` też przez `esc`. W bloku `<pre>` (l. 474):
  `<pre>${esc(a.lubName)} · akt ${esc(a.act)}/${esc(a.year)}\n${esc(a.lubRaw)}</pre>`
- **H3, `head`, l. 573.** Zamiast `${a.kind?titleOf(a):a.year+' · akt '+a.act+' · '+nmOf(a)}` owinąć cały wynik: `${esc(a.kind?titleOf(a):a.year+' · akt '+a.act+' · '+nmOf(a))}`.

Niski priorytet:

- **N1, l. 296, 297.** `value="${esc(k)}"`.
- **N2, `dwHtml`, l. 345.** `value="${esc(b.d)}"`, `value="${esc(b.y)}"`.
- **N3, l. 374.** `data-go="${esc(id)}"` i tekst `esc(id.replace(...))`.
- **N4, l. 417.** `data-y="${esc(y)}"` i tekst `${esc(y==='all'?'Lata: wszystkie':y)}`.
- **N5, l. 423.** `data-id="${esc(a.id)}"`, `title="${esc(a.year)}"`, `'<b>'+esc(a.act)+'</b>'`, `'Lp'+esc(a.act)`, `'Prot '+esc(a.year)`.
- **N6, `hlHtml`, l. 765.** `data-f="${esc(it.f)}"`.

Weryfikacja po poprawkach: H1-H3 wraz z testem z importu CSV zawierającym `<img src=x onerror=...>`, `&` i `"` (nazwisko, chip, `<pre>`, nagłówek widoku aktu i kreatora).

---

## 2. dopasowanie/szablon.html

Stan: 26 sinków i 13 builderów. Najwięcej miejsc, ale większość danych tekstowych (nazwiska, miejsca, uwagi, nazwy z drzewa) przechodzi przez `esc`. Brak sinków wysokiego ryzyka.

Sinki niskie:

| Linia | Opis | Powód |
|---|---|---|
| 318 | `cardHtml` przez `el.innerHTML=h` (lista propozycji) | `r[1]` (rok) i `r[2]` (nr) w l. 286-288 bez `esc` |
| 345 | lista aktów w widoku dopasowania | `a[1]` (rok) w l. 346 bez `esc` |
| 544 | tabela osób z aktu ślubu | `p.by` (rok urodzenia) bez `esc` |
| 677 | widok drzewa (`tbRender`) | litery w `tbCtl` (l. 879) bez `esc` |
| 711 | `fmRender` (`fmKidsHtml`/`fmDupHtml`) | `r[1]` (l. 702), id rodziny w `data-f` (l. 700) |

Buildery niskie:

| Linia | Funkcja | Powód |
|---|---|---|
| 285-292 | `cardHtml` | `r[1]`, `r[2]` (rok, nr) bez `esc` w l. 286-288 |
| 948-952 | `tbGosp` | `e[0]` (nazwa skanu z wbudowanego zestawu) w l. 952 bez `esc` |
| 876-880 | `tbCtl` | litera z nazwiska (`l`, `t||l`) w `data-let` i w tekście (l. 879) |
| 691-704 | `fmKidsHtml` | `r[1]` (l. 702), `f` w `data-f` (l. 700) |

Wszystkie pozostałe sinki i buildery (`factsHtml`, `node`, `pill`, `treePerson`, `tbBox`, `tbTree`, `tbChrono`, `sec`, `fmDupHtml` i tabele inline: lista osób, rodziny, ślubów, raport zgonów, raport pisowni) escapują dane tekstowe przez `esc`. Liczby, procenty i wiek nie są escapowane, co jest akceptowalne. `treePerson` (l. 599) escapuje imię, nazwisko, miejsca i notatki po `replace(/<[^>]+>/g,'')`.

### Poprawki (szablon dopasowanie/szablon.html)

Priorytet niski (nie ma wysokich):

- **N1, `cardHtml`, l. 286-288.** `${esc(String(r[1]))}` i `${esc(String(r[2]))}` w liniach `ur.`, `ślub` i `zgon`.
- **N2, tabela osób, l. 346.** `${esc(String(a[1]))}`.
- **N3, tabela osób ze ślubem, l. 544.** `${esc(String(p.by))}` (uwaga: `p.by||'brak roku'`).
- **N4, `fmKidsHtml`, l. 702 i 700.** `${esc(String(r[1]))}`; `data-f="${esc(f)}"`.
- **N5, `tbCtl`, l. 879.** `data-let="${esc(l)}"` i `${esc(t||l)}`.
- **N6, `tbGosp`, l. 952.** `${esc(String(e[0]))}`.

---

## 3. narzedzia/edytor_korekt_szablon.html

Stan: 16 linii z innerHTML (17 wystąpień), 2 buildery. Najbezpieczniejszy z czterech. Wszystkie dynamiczne wartości z CSV/JSON (nazwiska, rok, numer, wiersz, etykiety, pola PL/LA/RU, opisy skanów) przechodzą przez `esc`. `textContent` (podgląd, status) nie jest sinkiem.

Jedyny niski: l. 855 `data-rid="${r.id}"` i `#${r.id}` (id z kreatora, liczba).

Pozostałe (stałe `${f}` w `data-f`, `genderOf`, `r.ord`, `e.n`, `fam.length`) są liczbami lub kluczami schematu.

### Poprawki (szablon narzedzia/edytor_korekt_szablon.html)

- **N1, l. 855.** `data-rid="${esc(r.id)}"` i `#${esc(r.id)}`.

Brak poprawek wysokiego priorytetu.

---

## 4. haiku/weryfikacja_malzenstw_szablon.html

Stan: 12 linii z innerHTML (23 wystąpienia), 6 builderów. Jedyny sink wysokiego ryzyka w tym zestawie: sidebar.

Sinki:

| Linia | Opis | Ocena | Powód |
|---|---|---|---|
| 127 | `renderList`, `$('sb').innerHTML = h` (lista aktów) | WYSOKI | `nm(a)` (imiona i nazwiska pana i panny z importu) w `<span>` bez `esc`; też `a.act` i `y` bez `esc` |
| 160 | datalist | bezpieczny | `esc` |
| 191 | ostrzeżenia | bezpieczny | `map(esc)` |
| 197 | `renderForm`, nagłówek | niski | `a.year`, `a.act` (liczby) bez `esc`; `nm` już przez `esc` |
| 200-202 | `hardRefresh`/`softRefresh` (kopiowanie wyników `genRow`) | zależne | dziedziczą bezpieczeństwo `genRow` |
| 214 | okno uwag | bezpieczny | stały tekst |
| 226 | `drawOv`, `title` | bezpieczny | `esc` |
| 232 | błąd wczytania skanu | bezpieczny | `esc(src)` |
| 262 | `bReg`, rejestr | niski | `r.lp`, `r.akt`, `y` (rok, numer) bez `esc`; `mlodzi`, `panna` już przez `esc` |
| 264 | menu | bezpieczny | stały tekst |

Buildery:

| Funkcja | Ocena | Powód |
|---|---|---|
| `chipsFor` (l. 146) | bezpieczny | wartość przez `esc`, etykiety stałe |
| `tagFor` (l. 159) | bezpieczny | liczby i stałe |
| `dwHtml` (l. 166) | niski | `b.d`, `b.y` w `value` bez `esc` |
| `ynHtml` (l. 175) | bezpieczny | stałe |
| `genRow` (l. 180) | bezpieczny | wartości przez `esc`, klucze schematu stałe |
| `blockHtml` (l. 190) | bezpieczny | składa `genRow` |

### Poprawki (szablon haiku/weryfikacja_malzenstw_szablon.html)

Wysoki priorytet:

- **H4, `renderList`, l. 127.** `'<span>' + esc(nm(a).replace(/^ z /,'')) + '</span>'`. Obok: `'<div class="yh">' + esc(y) + ...` i `esc(a.act)`.

Niski priorytet:

- **N1, `renderForm`, l. 197.** `esc(String(a.year))`, `esc(String(a.act))`.
- **N2, `bReg`, l. 262.** `'<h4>' + esc(y) + '</h4>'`, `'<td>' + esc(r.lp) + '</td>'`, `'<td>' + esc(r.akt) + '</td>'`.
- **N3, `dwHtml`, l. 166.** `value="' + esc(b.d) + '"`, `value="' + esc(b.y) + '"`.
- **N4, `esc`, l. 173.** Dodać `'` jako `&#39;` (zgodnie z `tekst.js`). Nie ma skutku dziś, bo wszystkie atrybuty są w `"`.

---

## Tabela zbiorcza

| # | Plik | Zakres | Wysokie | Niskie | Zależne | Działanie |
|---|---|---|---|---|---|---|
| 1 | haiku/weryfikacja_szablon.html | 39 (19 sinków, 20 builderów) | 6 (4 sinki, 2 buildery: H1-H3) | 6 (N1-N6) | 2 (`cellOf`, `edit`) | Przenieść F1-F9 z v3 do szablonu, potem H1-H3 i N1-N6 |
| 2 | dopasowanie/szablon.html | 39 (26 sinków, 13 builderów) | 0 | 9 (N1-N6) | 0 | Niskie, opcjonalne |
| 3 | narzedzia/edytor_korekt_szablon.html | 18 (16 sinków, 2 buildery) | 0 | 1 (N1) | 0 | Jedna linia, opcjonalna |
| 4 | haiku/weryfikacja_malzenstw_szablon.html | 18 (12 sinków, 6 builderów) | 1 (H4) | 3 (N1-N3) | 3 (`hardRefresh`, `softRefresh`) | H4 pilnie, N1-N4 przy okazji |
| | Razem | 114 | 7 | 19 | 5 | |

Bezpieczne: 83 miejsca (w tym wszystkie sinki statyczne).

## Kolejność prac

1. Przenieść F1-F9 z `AUDYT_innerHTML_v3.md` do `haiku/weryfikacja_szablon.html` (dziś tylko `chipsFor` i `head` są wysokie, reszta to już poprawki z v3). Obejmuje H1-H3.
2. H4 w `haiku/weryfikacja_malzenstw_szablon.html` (sidebar przyjmuje nazwiska z importu).
3. Niskie N1-N6 w dopasowanie, N1 w edytorze, N1-N4 w malzenstw: jedna zmiana na plik, bez zmiany zachowania.
4. Test po zmianach (jak w v3): import CSV z `<img src=x onerror=alert(1)>`, `A&B"'`, nazwisko z apostrofem; brak alertu, poprawny `dataset.v` w chipach, brak błędów JS na telefonie (420 px) i desktopie.

## Ograniczenia

- Analiza statyczna: skrypt wypisuje wyrażenia `${...}` poza `esc(...)`, a ocenę (bezpieczne / niskie / wysokie) wykonano ręcznie dla każdej linii z danymi. Nie uruchomiono stron w przeglądarce, nie testowano payloadów.
- Szablony 1-3 nie zawierają `esc`; oceniono użycie `esc` z modułu `tekst.js` wstawianego przez `zbuduj.py`. Jeśli moduł się zmieni, ocena dotyczy tej wersji `tekst.js` (escapuje `& < > " '`).
- Numery linii dotyczą plików źródłowych w `public/konsolidacja/` (szablony), nie wygenerowanych odpowiedników w `narzedzia/` ani `haiku/`.
- Nie audytowano innych szablonów z listy v3 (`weryfikacja_zgonow_ASC_1870-79.html`, `baza_zgonow_1797-1945.html`, `dopasowanie_osob.html`, `narzedzia/dane/*.html`, `multitool_prototyp.html`).
