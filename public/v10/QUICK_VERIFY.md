# ⚡ QUICK VERIFICATION (2 min)

## Krok 1: Start serwer
```bash
cd v10
python -m http.server 8000
```

## Krok 2: Otwórz przeglądarkę
```
http://localhost:8000/
```

## Krok 3: Otwórz konsolę (F12) i poczekaj
Powinieneś zobaczyć:
```
🚀 Inicjalizacja v10 – modularna wersja
📊 renderToolbar() – rozpoczęto
✅ Toolbar renderowany
🎬 updateThumbs() – początek, aktów: 0
✅ Thumbs renderowane: 0
✅ Aplikacja zainicjalizowana
```

## Krok 4: Załaduj testowe dane
W konsoli wpisz:
```javascript
testData.load()
```
**Strona się przeładuje!**

## Krok 5: Sprawdź rezultaty

### Na stronie:
- ✅ Toolbar u góry z przyciskami
- ✅ 3 miniatury po lewej stronie
  - "CHRZ.1890.No.1"
  - "MALZ.1880.No.5"
  - "ZGON.1895.No.12"
- ✅ Pierwsza miniatura zaznaczona (niebieski border)

### W konsoli:
```
✅ Załadowano dane z localStorage
🎬 updateThumbs() – początek, aktów: 3
✅ Thumbs renderowane: 3
```

## Krok 6: Test interakcji

**Kliknij drugą miniaturę (Małżeństwo):**
- Powinna się zaznaczyć na niebiesko
- Konsola pokaże: `✅ Wybrano akt: act-002`

**Zmień select z "Chrzest" na "Małżeństwo":**
- Konsola pokaże: `✅ Zmieniono szablon na: malzenstwo`

## ✅ WYNIK

Jeśli wszystkie kroki działały:

```
✅ v10 – TOOLBAR + THUMBS DZIAŁAJĄ POPRAWNIE
✅ Gotowe do następnej fazy (Faza 2: Forms)
```

---

## ❌ JEŚLI COŚ NIE DZIAŁA

| Problem | Rozwiązanie |
|---------|-------------|
| Nic się nie renderuje | Poczekaj ~3s, refreshuj (F5), czytaj QUICK_START_V10.md |
| Miniatury nie pokazują się | Wpisz `testData.load()` w konsoli |
| Błąd w konsoli | Skopiuj błąd, czytaj QUICK_START_V10.md → "Najczęstsze problemy" |
| CSS źle wygląda | Sprawdź Network (DevTools) czy CSS się załadowały |
| testData undefined | Czekaj aż się załaduje, refreshuj stronę |

---

**Jeśli dalej nie działa → czytaj [QUICK_START_V10.md](QUICK_START_V10.md)**

---

🎉 **Gotowe!**
