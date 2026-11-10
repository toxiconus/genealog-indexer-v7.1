# Błąd „Cannot read properties of undefined (reading 'fn')” w dopasowanie_osob.html

Diagnoza tylko odczytowa. Pliki aplikacji nie zostały zmienione.

## Gdzie

- Źródło: `public/konsolidacja/dopasowanie/szablon.html`, zbudowany plik: `dopasowanie/dopasowanie_osob.html` (linie w zbudowanym pliku podane poniżej).
- Stack trace (Chromium, Playwright, po kliknięciu wszystkich `.srow` w widoku osoby z ślubu):
  - `wantText` (`dopasowanie_osob.html:343`, `const p=P[s.split('.')[0]]`)
  - `panel` (`:351`)
  - `render` (`:379`)
  - handler `.srow` (`:329`, `e.onclick=()=>{sel=e.dataset.s;render()}`)

## Przyczyna

1. `sel` jest zmienną globalną i nie jest czyszczone przy zmianie trybu.
   - `compute('D')` ustawia `sel='birth'` (szablon.html ok. linia 237 dla B, 232 dla D: `sel='par'`/`sel='birth'`).
   - Po przejściu do M `compute('M')` ustawia `sel='g.d'`, więc zwykły przebieg jest poprawny.
2. Stare węzły `.srow` z renderu trybu B/D zostają w `#cen`. `renderM()` ukrywa `#cen` (`display='none'`), ale nie czyści jego zawartości.
3. Te stare węzły mają `data-s` = `birth`, `mrg`, `par` (sloty z SLD/SLB). Ich handler ustawia `sel` na taki slot i wywołuje `render()` w trybie M.
4. `wantText` w trybie M robi `P[s.split('.')[0]].fn`. Klucze `P` w trybie M to `g, b, gF, gM, bF, bM, G, Bd`. Dla `birth`, `mrg`, `par` wynik to `undefined`, więc `.fn` rzuca błąd. Slot `kids` jest obsłużony osobnym `if`, dlatego nie daje błędu.

Dowód: po `go("B")` + klik wszystkich `.srow`, `go("M")`, a potem klik wszystkich `.srow` w DOM daje dokładnie 3 błędy (birth, mrg, par), a `kids` przechodzi. To zgadza się z 3 błędami z `WYNIK_xss_szablony.md`.

## Czy to widzi użytkownik

Nie udało się odtworzyć błędu przez klikanie widocznych elementów (viewport 390 px):
- B: klik każdego widocznego `.srow`: brak błędów.
- D: klik każdego widocznego `.srow`: brak błędów.
- M: klik każdego `.pill`: brak błędów.
- Stare `.srow` w trybie M: 6 elementów w DOM, 0 widocznych (`offsetParent===null`).

Błąd wywołuje test, bo `document.querySelectorAll(".srow").forEach(e => e.click())` klika też ukryte węzły. Trzeba ustalić dokładne kroki z sesji użytkownika (tryb, wiersz, szerokość ekranu), jeśli błąd pojawia się przy normalnej obsłudze.

## Proponowana poprawka (minimalna, NIE zastosowana)

Plik źródłowy: `public/konsolidacja/dopasowanie/szablon.html`. Potem przebudowa: `python3 dopasowanie/build.py`.

```diff
--- a/public/konsolidacja/dopasowanie/szablon.html
+++ b/public/konsolidacja/dopasowanie/szablon.html
@@ function renderM(){
-function renderM(){const P=cur.P,m=cur.r,G=P.G,Bd=P.Bd;
+function renderM(){document.getElementById('cen').innerHTML='';const P=cur.P,m=cur.r,G=P.G,Bd=P.Bd;
@@ function wantText(s){
-  const p=P[s.split('.')[0]];return`Szukam: ...
+  const p=P[s.split('.')[0]];if(!p)return'';return`Szukam: ...
```

- Pierwsza zmiana usuwa stare węzły `.srow` przy wejściu w tryb M (przyczyna).
- Druga zmiana to zabezpieczenie w `wantText`, żeby nieznany slot nie przerywał renderu (obrona w głąb).

Zmiana w teście (osobno, nie w aplikacji): klikać tylko widoczne `.srow` (`offsetParent!==null`), bo ukryte węzły nie są dostępne dla użytkownika.

## Weryfikacja poprawki (kopia w scratchpad, repo nietknięte)

- Po poprawce: 0 starych `.srow` w M, 0 błędów przy kliku wszystkich `.srow` w M, 0 błędów w trybach B/D.

## Zauważone przy okazji (nie naprawiane)

- `dopasowanie/build.py` nadal nie zamienia `</` na `<\/` w danych JSON (jak w WYNIK_xss_szablony.md, sekcja Uwagi).
