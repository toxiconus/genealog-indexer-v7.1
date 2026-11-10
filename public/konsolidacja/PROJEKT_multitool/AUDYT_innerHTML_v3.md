# Audyt innerHTML: weryfikacja_szablon_v3.html

Plik: `public/konsolidacja/narzedzia/weryfikacja_szablon_v3.html` (1107 linii, ok. 194 KB).
Metoda: grep po `innerHTML`, `insertAdjacentHTML`, `outerHTML`, `document.write`, `srcdoc`, `DOMParser`, `createContextualFragment`; przegląd wszystkich funkcji zwracających HTML jako template string (każda interpolacja `${...}` sprawdzona pod kątem `esc()`). Analiza statyczna, bez uruchomienia strony w przeglądarce. Żaden istniejący plik nie został zmieniony.

## Ustalenia wstępne

- `esc` (l. 287): `String(s ?? '').replace(/[&<>"']/g, ...)`. Escapuje `& < > " '`, więc nadaje się zarówno do treści, jak i do atrybutów w cudzysłowach podwójnych i pojedynczych. Definicja jest poprawna. Jest wywoływana po zdefiniowaniu (l. 287 < 371), więc kolejność ładowania nie jest problemem.
- Nie znaleziono `insertAdjacentHTML`, `outerHTML`, `document.write`, `srcdoc`, `DOMParser` ani `createContextualFragment`. Jedyne sinki to `innerHTML` (19 przypisań).
- Główne źródło problemu: `chipsFor` (l. 506-519). Wartości `val` pochodzą z `a.ai`, `a.lub`, `a.alts` i z podpowiedzi z bazy (`near`). Trafiają do treści przycisku bez `esc`. Do `data-v` idą tylko z zamianą `"` na `&quot;` (brak `& < > '`). `chipsFor` zasila `cellOf` (l. 558-563), `renderWiz` (l. 660), `edit()` w `renderText` (l. 957).
- Druga grupa: nazwa zmarłego (`nmOf`, l. 386; `titleOf`, l. 387) wstawiana bez `esc` do nagłówków (l. 544, 649). Ta sama nazwa jest prawidłowo escapowana w `renderText` (l. 956), więc widok tekstowy i widok pól zachowują się niespójnie.
- Trzecia grupa: surowy tekst Lubgens (`a.lubRaw`, `a.lubName`) oraz numery aktów w bloku `<pre>` (l. 549) bez `esc`.
- Dane wejściowe, które mogą zawierać znaki HTML: import CSV (`fVer` l. 774, `fAi` l. 798), import JSON stanu (`fLoad` l. 784), wybór plików skanów (`fScan` l. 802) oraz `D.scanFiles` z CSV (`scan_path`, l. 775). Stan jest zapisywany w `localStorage` (`save`/`lsPut`), więc niezescapowana wartość wraca przy każdym otwarciu pliku (efekt trwały, nie tylko jednorazowy).

## Tabela 1: bezpośrednie sinki `innerHTML` (19 przypisań)

| Linia | Opis | Zmienne wstawiane | Escapowane | Ryzyko | Uzasadnienie |
|---|---|---|---|---|---|
| 278 | baner braku zapisu (`saveBanner`) | tylko stałe teksty | n/d | brak | brak danych |
| 371 | `datalist` nazwisk (`#dlS`) | `k` (klucze `D.counts.s`) w `value="${k}"` | nie | niskie | cudzysłów w nazwisku rozbija atrybut; bez zdarzeń, bez interakcji |
| 372 | `datalist` imion (`#dlN`) | `k` (klucze `D.counts.n`) w `value="${k}"` | nie | niskie | j.w. |
| 394 | raport spójności (nagłówek, wiersze) | `msg`, `rel`, `actName`, `id` przez `esc`; `repRows().length`, `cnt(k)` liczby; `SEVN` stałe | tak | brak | wszystkie dane przez `esc` |
| 449 | pisownia: grupy wariantów | `m.w` przez `esc`; `id` aktu w `data-go="${id}"` i w tekście `id.replace(...)` bez `esc` | częściowo | niskie | id aktu składany z roku i numeru (z importu CSV) |
| 457 | historia zmian | `actName`, `histLabel`, `histShow`, `e.why` przez `esc`; `e.n` liczba; `e.t` przez `Date` | tak | brak | wszystko przez `esc` |
| 492 | zakładki lat i filtrów | `y` (rok) w `data-y="${y}"` i w tekście bez `esc` | nie | niskie | rok z `a.year` (import), zwykle liczba |
| 498 | lista aktów | `a.id` w `data-id="${a.id}"`, `a.act` i `a.year` w tekście, `title="${a.year}"` bez `esc`; `titleOf`, `nmOf` przez `esc` | częściowo | niskie | numer aktu i rok z CSV |
| 535 | pusty widok | stała | n/d | brak | brak danych |
| 584 | `tmp.innerHTML = sigH` (liczenie sygnałów) | `warnHtml`, `repHtml`, `missingHtml`, `lubPanel`, `relHtml` (wszystkie przez `esc`) | tak | brak | element odłączony od DOM, ale `onerror` w `<img>` i tak się wykona, więc ważne jest, że treść jest escapowana |
| 585 | widok aktu (główny) | `nm` (l. 544) bez `esc`; `a.lubName`, `a.act`, `a.year`, `a.lubRaw` (l. 549) bez `esc`; `chipsFor` przez `cellOf` bez `esc`; nazwy skanów (l. 546) bez `esc` | nie (częściowo) | wysokie | nazwa z danych i surowy tekst Lubgens trafiają do DOM jako HTML; sink trwale zapisuje się w `localStorage` |
| 601 | podpowiedzi kategorii (`.ddcat`) | `catHtml` przez `esc` | tak | brak | `catHtml` escapuje wszystko |
| 646 | pasek kreatora (`wizBar`) | stałe etykiety i id | n/d | brak | brak danych |
| 651 | kreator: ekran końcowy | `head` (`nmOf`/`titleOf` bez `esc`); `esc(a.cmp)` | częściowo | wysokie | nazwa zmarłego w nagłówku bez `esc` |
| 657 | kreator: pole | `head` bez `esc`; `chipsFor` bez `esc`; `warnHtml`, `repHtml`, `missingHtml`, `tagsFor`, `agePick` (poprawne); `esc(v)` w `input`/`textarea` | nie (częściowo) | wysokie | nazwa w nagłówku i chipy z wartościami z importu |
| 703 | toast po zatwierdzeniu (`undoToast`) | stałe | n/d | brak | brak danych |
| 982 | widok tekstowy (główny) | `esc(nm)`; `hlHtml` (tekst przez `esc`); `missingHtml`, `lubPanel`, `relHtml`, `repHtml`, `warnHtml` przez `esc`; `h` przez `esc` | tak | brak | wszystko przez `esc` |
| 987 | widok tekstowy: pasek pól | `edit()` z `chipsFor(a,TF)` bez `esc`; `qedit`, `wedit`, `sugHtml`, `txtChips` przez `esc` | nie (częściowo) | wysokie | chipy z wartościami AI/Lubgens bez `esc` |
| 1087 | podpowiedzi autouzupełniania | `x.v`, `x.s` przez `esc` | tak | brak | wszystko przez `esc` |

Podsumowanie sinków: bezpieczne 10, do poprawy 9 (wysokie 4: l. 585, 651, 657, 987; niskie 5: l. 371, 372, 449, 492, 498).

## Tabela 2: funkcje zwracające HTML (20 builderów)

| Linia | Funkcja | Zmienne wstawiane | Escapowane | Ryzyko | Uzasadnienie |
|---|---|---|---|---|---|
| 260 | `warnHtml` / `warnsOf` | stałe teksty | n/d | brak | `warnsOf` nie wstawia danych |
| 389 | `repHtml` | `i.msg`, `i.rel`, `actName`, `i.id`, `i.code` | tak | brak | `esc` wszędzie |
| 419 | `dwHtml` | `b.y`, `b.d` w `value=` bez `esc`; `dwLabel` przez `esc` | częściowo | niskie | wartości z `dwParse` to liczby; fallback `a.year` bez `esc` |
| 481-486 | `relHtml` | `i.txt`, `i.id`, `i.k`, `actName` przez `esc`; `pct`, `okL`, `dfL`, `msL` liczby lub stałe | tak | brak | `esc` wszędzie |
| 506-519 | `chipsFor` | `val` w treści bez `esc`; `data-v` tylko `"`→`&quot;`; `cls` i `l` z `a.alts` bez `esc` | nie | wysokie | główne źródło problemu, zasila 4 miejsca renderowania |
| 521-522 | `tagsFor` | `ds` stałe, `c` liczba | n/d | brak | brak danych tekstowych |
| 530 | `catHtml` | `n` przez `esc`, `data-v="${esc(n)}"` | tak | brak | wzór do naśladowania |
| 552-564 | `cellOf` (wewnątrz `renderAct`) | `esc(disp)` w `value`/`textarea`, `esc(m)` w chipach `mk`; `inl`, `ddc` pochodzą z `chipsFor` | zależne | wysokie przez `chipsFor` | sama funkcja jest poprawna, naprawa `chipsFor` wystarcza |
| 575-582 | grupy (`GL`, `sum`) | `sum` przez `esc`; `body` z `cellOf` | zależne | brak własnego | zależne od `cellOf` |
| 649 | `head` (w `renderWiz`) | `nmOf(a)`, `titleOf(a)` bez `esc`; `a.year`, `a.act` liczby | nie | wysokie | nazwa zmarłego bez `esc` |
| 942-947 | `missingHtml` (`row`) | `esc(x.label)`, `esc(x.why)`, `esc(x.id)`; liczby | tak | brak | wszystko przez `esc` |
| 948-949 | `lubPanel` | `esc(f.label)`, `esc(cur)`, `esc(lv)`, `L.length` | tak | brak | wszystko przez `esc` |
| 949-950 | `vrWarn` | `esc(v.map(...))`, `esc(clean(...))`, `data-vrt="${x.i}|${x.e}|${esc(...)}"` | tak | brak | `x.i`, `x.e` liczby |
| 835-840 | `hlHtml` | tekst przez `marks(esc(...))`; `esc(q.txt)`, `esc(q.key)`; `title` przez `esc`; `data-f="${it.f}"` (id pola ze schematu) | tak | brak | `marks` działa już na tekście escapowanym |
| 881-882 | `txtChips` | `esc(n)`, `esc(x.w)`, `esc(lbl)` w chipach `akt` | tak | brak | wszystko przez `esc` |
| 895-896 | `sugHtml` | `esc(x.from)`, `esc(x.to)`, `esc(label)`, `data-vrt` przez `esc` | tak | brak | wszystko przez `esc` |
| 950-958 | `renderText`: nagłówek | `esc(nm)` | tak | brak | poprawne, wzór dla `renderAct` |
| 956-958 | `edit()` (w `renderText`) | `chipsFor(a,TF)` bez `esc`; reszta przez `esc` | zależne | wysokie przez `chipsFor` | naprawa `chipsFor` wystarcza |
| 959-990 | `qedit`, `wedit`, widok `lista` | `esc` wszędzie; `hlCls` stałe | tak | brak | wszystko przez `esc` |
| 1050 | `agePick` | stałe | n/d | brak | brak danych |

Podsumowanie builderów: bezpieczne 15, zależne od innej poprawki 2 (`cellOf`, `edit()`), do poprawy 3 (`chipsFor` wysokie, `head` wysokie, `dwHtml` niskie). Razem 20.

## Łącznie

- Miejsca razem: 39 (19 sinków `innerHTML` + 20 builderów).
- Bezpieczne: 25 (10 sinków + 15 builderów).
- Zależne od poprawki w innym miejscu: 2 (`cellOf`, `edit()`).
- Do poprawy: 12 (9 sinków + 3 buildery), które sprowadzają się do 9 zmian w kodzie (F1-F9 poniżej).

## Lista poprawek

Priorytet wysoki (dane z importu trafiają do DOM jako HTML):

- **F1, `chipsFor`, l. 506-519.** Zmienić:
  - `<button class="chip ${cls} ..." data-f="${f}" data-v="${val.replace(/"/g,'&quot;')}" data-s="${cls}"><small>${lbl}</small>${val}${extra}</button>`
  - na `<button class="chip ${esc(cls)} ..." data-f="${f}" data-v="${esc(val)}" data-s="${esc(cls)}"><small>${esc(lbl)}</small>${esc(val)}${extra}</button>`.
  - Dodatkowo `(a.alts?.[f]||[]).forEach(([c,l,v]) => add(c,l,v,cnt(v)))`: `c` i `l` przechodzą przez `esc` już w `add` (to samo wejście, bez zmiany wywołania). `extra` (`cnt`) zawiera tylko liczbę, zostaje.
  - Po zmianie `data-v` przez `esc()` poprawnie dekoduje się także `&` (obecnie wartość `A&B` jest niezgodna z `dataset.v` przy `&amp;` w danych).
- **F2, `renderAct` l. 544, i `head` l. 649.** Zmienić `${nm}` na `${esc(nm)}` (l. 544). Zmienić `${nmOf(a)}` i `${titleOf(a)}` na `${esc(nmOf(a))}`, `${esc(titleOf(a))}` (l. 649). `a.year` i `a.act` owinąć w `esc` dla spójności.
- **F3, l. 549.** Zmienić `<pre>${a.lubName} · akt ${a.act}/${a.year}\n${a.lubRaw}</pre>` na wersję z `esc()` przy każdym polu: `${esc(a.lubName)} · akt ${esc(a.act)}/${esc(a.year)}\n${esc(a.lubRaw)}`.

Priorytet średni:

- **F4, l. 546.** Zmienić `${k}` w `<option ...>${k}</option>` na `${esc(k)}`. Nazwy plików skanów (z folderu, z CSV `scan_path`, z JSON) mogą zawierać `<` w systemie Linux.

Priorytet niski (atrybuty i wartości liczbowe, dla spójności i ochrony przed zepsutym atrybutem):

- **F5, l. 371-372.** `value="${k}"` na `value="${esc(k)}"`.
- **F6, l. 449.** `data-go="${id}"` i tekst `id.replace(...)` na `esc(id)` (uwaga: wynik `replace` także przez `esc`).
- **F7, l. 492.** `data-y="${y}"` i tekst `y` na `esc(y)`.
- **F8, l. 498.** `data-id="${a.id}"` na `data-id="${esc(a.id)}"`; `title="${a.year}"` na `title="${esc(a.year)}"`; `'<b>'+a.act+'</b>'`, `'Lp'+a.act`, `'Prot '+a.year` na `esc(...)` w każdym miejscu.
- **F9, `dwHtml` l. 419.** `value="${b.d}"`, `value="${b.y}"` na `value="${esc(b.d)}"`, `value="${esc(b.y)}"`.

Uwagi do atrybutów:

- `esc()` obsługuje atrybuty w obu typach cudzysłowów (escapuje `"` i `'`). Atrybuty zbudowane przez `esc` są bezpieczne: `repHtml`, `relHtml`, `catHtml` (`data-v`), `cellOf` (`value`), `hlHtml` (`title`, `data-q`), `txtChips`, `sugHtml`, `vrWarn`, `missingHtml` (`data-missfocus`).
- Atrybuty bez `esc` (poza wymienionymi w F4-F9): `class="chip ${cls}"` i `data-s="${cls}"` w `chipsFor` (`cls` z `a.alts`, wymaga `esc` albo listy dozwolonych wartości), `data-f="${f}"` i `data-f="${it.f}"` (id pól, ze schematu, niski ryzyko).
- `chipsFor` ma niekompletne escapowanie atrybutu (`"` → `&quot;` bez `&`, `<`, `>`, `'`). W cudzysłowie podwójnym działa, ale jest niespójne z `catHtml`. Zastąpienie przez `esc(val)` (F1) to usuwa.
- Regex w `cellOf` (l. 558): `all.match(/<button class="chip [\s\S]*?<\/button>/g)` zakłada strukturę przycisków. Po F1 nadal działa, bo `esc` nie wstawia `<` ani `</button>` do wartości.

## Weryfikacja po poprawkach (propozycja)

1. Import CSV z nazwiskiem `<img src=x onerror=alert(1)>` i `A&B"'`: brak alertu, nazwa wyświetla się jako tekst w nagłówku, chipie i w `<pre>` Lubgens.
2. Po kliknięciu chipa wartość w polu jest identyczna z wartością w danych (test `dataset.v` vs `val`).
3. Wszystkie 19 sinków `innerHTML` i 20 builderów przejść przez przegląd z tabeli powyżej (po poprawkach wszystkie wartości dynamiczne mają `esc`, liczby mogą zostać bez).

## Poza zakresem

- Te same wzorce `const esc = ...` i `innerHTML` występują w innych szablonach w `public/konsolidacja/` (np. `weryfikacja_zgonow_ASC_1870-79.html`, `baza_zgonow_1797-1945.html`, `dopasowanie/dopasowanie_osob.html`, `narzedzia/dane/*.html`, `PROJEKT_multitool/prototyp/multitool_prototyp.html`). Nie audytowano ich; zalecany ten sam grep i ta sama lista kontrolna.
- Analiza statyczna. Nie uruchomiono strony ani nie testowano payloadów w przeglądarce.
