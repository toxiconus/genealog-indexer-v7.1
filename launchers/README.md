# 🚀 Genealog Indexer - Server Launchers

W tym folderze znajdują się różne sposoby uruchomienia serwera aplikacji.

## Opcja 1: Szybkie uruchomienie - `start-server.bat` (NAJŁATWIEJSZE)

**Kto:** Wszyscy użytkownicy Windows  
**Jak:** Dwuklik na `start-server.bat` w eksploratorze plików

```
start-server.bat
```

✅ **Zalety:**
- Najprostsze - wystarczy dwuklik
- Widać terminal z logami
- Automatycznie zainstaluje zależności jeśli ich brakuje
- Otwiera przeglądarkę po starcie

❌ **Wady:**
- Czarne okno terminala vidoczne podczas pracy

---

## Opcja 2: Bez widocznego okna - `start-server.vbs`

**Kto:** Użytkownicy preferujący minimalizm  
**Jak:** Dwuklik na `start-server.vbs`

```
start-server.vbs
```

✅ **Zalety:**
- Nie pokazuje okna terminala
- Serwer działa w tle
- Czysto na pulpicie

❌ **Wady:**
- Trudniej zobaczyć czy serwer się uruchomił
- Logów nie widać

**Jak monitorować:** Otwórz DevTools (F12) w przeglądarce → Console tab

---

## Opcja 3: Python launcher - `start-server.py`

**Kto:** Deweloperzy z Pythonem  
**Jak:** Uruchom z terminala

```powershell
python start-server.py
```

✅ **Zalety:**
- Pełna kontrola
- Można modyfikować skrypt
- Przydatne do integracji z IDE

---

## Aby użyć:

### Krok 1: Upewnij się że Node.js jest zainstalowany

```powershell
node --version
npm --version
```

Jeśli brakuje: https://nodejs.org/

### Krok 2: Uruchom jeden z launcherów

- **Początkujący:** `start-server.bat` (dwuklik)
- **Advanced:** `start-server.vbs` (dwuklik bez okna)
- **Developer:** `start-server.py` (terminal)

### Krok 3: Czekaj aż serwer się uruchomi

```
VITE v5.4.21  ready in 500 ms
➜  Local:   http://localhost:5173/
```

### Krok 4: Przeglądarka powinna się otworzyć automatycznie

Jeśli nie: otwórz ręcznie: http://localhost:5173/viewer-osd.html

---

## Rozwiązywanie problemów

### Problem: "Node is not recognized"
**Rozwiązanie:** Zainstaluj Node.js z https://nodejs.org/ i uruchom ponownie terminal

### Problem: "Port 5173 already in use"
**Rozwiązanie:** 
```powershell
# Zabij proces Node
taskkill /F /IM node.exe

# Lub zmień port w vite.config.js:
# port: 5173 → port: 5174
```

### Problem: "npm install fails"
**Rozwiązanie:**
```powershell
# Wyczyść cache
npm cache clean --force

# Spróbuj ponownie
npm install
```

---

## Aby zatrzymać serwer:

### W BAT/VBS oknie:
- Naciśnij `Ctrl+C` (jeśli widać okno)
- Lub z TaskManagera: `taskkill /F /IM node.exe`

### W terminalu:
- Naciśnij `Ctrl+C`

---

## Pliki w tym folderze:

| Plik | Opis |
|------|------|
| `start-server.bat` | Windows batch - dwuklik do uruchomienia |
| `start-server.vbs` | VBScript - uruchomienie bez okna |
| `start-server.py` | Python script - dla developerów |
| `README.md` | Ten plik |

---

**Genealog Indexer v3.2.1** 📚  
For help: Check the main README.md in the parent folder
