# Projekty Formularzy Genealogicznych - UI/UX

**Data**: 4 stycznia 2026  
**Status**: Propozycje do implementacji

---

## 📐 Filozofia projektowania formularzy

### Zasady:
1. **Widoczność funkcjonalna** - pola używane 80% czasu zawsze widoczne
2. **Kontekst bez klikania** - dodatkowe pola pojawiają się gdy istotne
3. **Inteligentne grupowanie** - powiązane dane razem
4. **Szybki dostęp** - menu kontekstowe, tipsy, linki do innych aktów
5. **Brak "obowiązkowych"** - ale UI podpowiada co brakuje

### Typ pola: 4 warianty
```
[PRIMARY]      Zawsze widoczne, duże, kontrastowe
[SECONDARY]   Wciśnięte ctrl+E, łatwa dostępność
[TERTIARY]    W akcordeon/sekcji zwijającej
[CONTEXT]     Menu kontekstowe / popup
```

---

## 🏛️ AKT CHRZTU (Baptism Record)

### Layout "T-Shape"

```
┌──────────────────────────────────────────────────┐
│  CHRZEST: Jan Józef                       [⊗ ×] │
├──────────────────────────────────────────────────┤
│                                                   │
│  DZIECKO:                                         │
│  ┌─────────────────────────────────────────────┐ │
│  │ Imię(na)*    [Jan Józef        ]            │ │
│  │ Nazwisko     [Kowalski        ] [Male]      │ │
│  │ Data        [15-05-1890] [~] [?]           │ │
│  │ Miejscowość  [Warszawa        ] [📍]       │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│ ┌─── RODZICE ────────────────────────────────────┐ │
│ │                                                │ │
│ │ Ojciec:                                        │ │
│ │ ├─ Imię        [Stanisław      ]             │ │
│ │ ├─ Nazwisko    [Kowalski       ]             │ │
│ │ ├─ Zawód       [Robotnik  ▼] [+Historia]   │ │
│ │                                                │ │
│ │ Matka:                                         │ │
│ │ ├─ Imię        [Łucja         ]             │ │
│ │ ├─ Panieńskie  [Nowak         ]             │ │
│ │ ├─ Zawód       [      ▼]      [?]          │ │
│ │                                                │ │
│ │ [≡ Więcej info o rodzicach] ◀─ Rodzice żywi? │
│ │                           czy wdowa?          │ │
│ └────────────────────────────────────────────────┘ │
│                                                   │
│ ┌─── CHRZEST ─────────────────────────────────────┐ │
│ │                                                │ │
│ │ Data chrztu   [15-05-1890] (=urodzenia)      │ │
│ │ Miejsce       [Kościół Św. Anny]             │ │
│ │                                                │ │
│ │ [≡ Godparents] ◀─ Chrzestni (ojciec/matka) │
│ │                   czy znani ze stanimi       │ │
│ └────────────────────────────────────────────────┘ │
│                                                   │
│ Notatki organy: [                              ] │
│ UWAGI (ORG):    [                              ] │
│                                                   │
│              [Zapisz]  [Kopiuj]  [Usuń]         │
└──────────────────────────────────────────────────┘
```

### Pola ZAWSZE widoczne (Primary - 6 pól):
| Pole | Typ | Placeholder | Skrót |
|------|-----|------------|-------|
| **Imię dziecka** | Text | Jan, Józef, Maria | `Ctrl+1` |
| **Nazwisko** | Text | Kowalski | `Ctrl+2` |
| **Płeć** | Radio | M/K | `Ctrl+3` |
| **Data urodzenia** | Date | 15-05-1890 | `Ctrl+4` |
| **Imię ojca** | Text | Stanisław | `Ctrl+5` |
| **Imię matki** | Text | Łucja | `Ctrl+6` |

### Pola SZYBKO dostępne (Secondary - Ctrl+E):
```
┌─────────────────────────────────┐
│ ROZSZERZONE - Ctrl+E            │
├─────────────────────────────────┤
│ Nazwisko ojca      [Kowalski]   │
│ Wiek ojca          [35]  [□ rok]│
│ Zawód ojca         [Robotnik ▼] │
│ Miejsca ojca       [Warszawa]   │
│                                 │
│ Nazwisko panieńskie[Nowak]      │
│ Wiek matki         [32]  [□ rok]│
│ Status rodziców    [Żonaci ▼]   │
│ Miejsca matki      [Praga]      │
│                                 │
│ Data chrztu        [15-05-1890] │
│ Kościół            [Św. Anny]   │
└─────────────────────────────────┘
```

### Sekcje zwijające (Accordion - Ctrl+R):
```
[≡ Chrzestni] ◀─ Expand
  Ojciec chrzestny: [________]
  Matka chrzestna:  [________]
  Zawody (jeśli znane)

[≡ Szczegóły ORG] ◀─ Expand
  Numer aktu:  [________]
  Księga:      [________]
  Strona:      [____]
  Duchowny:    [________]
  Data wpisu:  [________]

[≡ Dodatkowe info] ◀─ Expand
  Bliźnięta/Wieloraczki: [□] Tak
  Zmiana imion:          [      ]
  Komplikacje porodu:    [      ]
  Notki szczególne:      [      ]

[≡ Możliwe zmartwychwstania danych] ◀─ Expand
  □ Zmarła matka - data: [________]
  □ Wyszła zamąż - data: [________]  
  □ Wyszła ze świata     - data: [________]
  □ Drugi ojciec (ojczym)- imię: [________]
```

### Menu kontekstowe (Prawy klik / [...] menu):
```
[...] Akcje szybkie
├─ 🔗 Powiąż z aktem ślubu rodziców
├─ 👨‍👩‍👧 Pokaż inne dzieci tej pary
├─ ⚰️  Czy jest akt zgonu dla tego dziecka?
├─ 📋 Porównaj z poprzednim aktem
├─ 🔄 Kopiuj poprzedniego
└─ ✨ Sugestie bazując na roku
```

---

## 👨‍👩‍👧 AKT URODZENIA

### Layout podobny, ale bardziej "ekspandowalny"

```
PRIMARY (zawsze widoczne):
├─ Imię dziecka
├─ Nazwisko
├─ Płeć
├─ Data urodzenia
├─ Miejscowość
├─ Imię ojca
├─ Imię matki

SECONDARY (Ctrl+E):
├─ Nazwisko ojca
├─ Wiek/zawód ojca
├─ Nazwisko panieńskie matki
├─ Wiek/zawód matki
├─ Czy urodzone w małżeństwie? [Tak/Nie/?]
└─ Jeśli NIE: ojciec potajemnie? rodzina?

ACCORDION:
├─ [≡ Chrzest] (data, miejsce, chrzestni)
├─ [≡ Status dzieci rodziny] (liczba starszych/młodszych)
├─ [≡ Historia rodziców] (poprzednie małżeństwa, rozwiedzeni itp)
└─ [≡ Notatki szczególne]
```

### Inteligentne pole warunkowe:
```javascript
JEŚLI: "Czy urodzone w małżeństwie?" = NIE
POKAŻ: 
  - Kto zgłaszał (samotna matka/dziadowie/opiekun)?
  - Przyczyna ukrycia?
  - Później uznane przez ojca?
```

---

## 💒 AKT MAŁŻEŃSTWA

### Layout "para - szerokie pola"

```
PRIMARY (zawsze widoczne):
├─ PAN MŁODY:
│  ├─ Imię
│  ├─ Nazwisko
│  └─ Wiek lub data urodzenia
│
├─ PANNA MŁODA:
│  ├─ Imię
│  ├─ Nazwisko
│  └─ Wiek lub data urodzenia
│
├─ ŚLUB:
│  ├─ Data ślubu
│  ├─ Miejscowość
│  └─ Typ (Kościelny/Cywilny)

SECONDARY (Ctrl+E):
├─ Zawód pana młodego
├─ Stan cywilny pana młodego (kawaler/wdowiec)
├─ Zawód panny młodej
├─ Stan cywilny panny młodej (panna/wdowa)
├─ Miejsca zamieszkania (przed ślubem)
└─ Wyznanie (jeśli inne)

ACCORDION:
├─ [≡ Rodzice] (4x imiona + nazwiska)
├─ [≡ Świadkowie] (max 2-4)
├─ [≡ Historia]
│  ├─ Gdzie się poznali?
│  ├─ Poprzednie małżeństwa?
│  ├─ Czy mieli dzieci przed ślubem?
│  └─ Dyspensa (z powodu pokrewieństwa)?
├─ [≡ Przebieg ślubu]
│  ├─ Zapowiedzi (daty/miejsca)
│  ├─ Duchowny
│  └─ Świadkowie
└─ [≡ Notki szczególne]
```

### Walidacja warunkowa:
```
JEŚLI: Stan cywilny = "wdowiec"/"wdowa"
POKAŻ:
  - Imię poprzedniego małżonka
  - Data poprzedniego ślubu
  - Data śmierci poprzedniego małżonka
  - Czy są dzieci z poprzedniego związku?

JEŚLI: Wiek pana < 15 lub panny < 13
WARNING: "Niezwykły wiek - sprawdzić czy nie błąd w dacie"

JEŚLI: Typ = "Cywilny"
UKRYJ: Pola duchowny, Kościół
```

---

## ⚰️ AKT ZGONU

### Layout "wertykalne timeline'y"

```
PRIMARY (zawsze widoczne):
├─ ZMARŁY:
│  ├─ Imię
│  ├─ Nazwisko
│  ├─ Płeć
│  ├─ Data zgonu
│  ├─ Wiek przy śmierci (lub data urodzenia)
│  └─ Miejscowość
│
├─ PRZYCZYNA:
│  ├─ Główna przyczyna [Lista z słownika]
│  └─ Opis (np. "zapalenie płuc, 3 dni choroby")

SECONDARY (Ctrl+E):
├─ Ostatnie miejsce zamieszkania
├─ Zawód
├─ Status cywilny
├─ Imię małżonka (jeśli był)
├─ Liczba dzieci
└─ Gdzie zgon (dom/szpital/więzienie)

ACCORDION:
├─ [≡ Historia życia]
│  ├─ Data urodzenia
│  ├─ Miejsca pobytu (jeśli znane)
│  ├─ Zawody w różnych latach
│  └─ Migracje
├─ [≡ Rodzina]
│  ├─ Imiona rodziców (nawet jeśli zmarły miał 80 lat)
│  ├─ Rodzeństwo (nazwy, czy żywe)
│  └─ Dzieci (lista)
├─ [≡ Pogrzeb]
│  ├─ Data pogrzebu
│  ├─ Miejsce pogrzebu (cmentarz)
│  ├─ Typ pochówku
│  └─ Msze żałobne
└─ [≡ Szczegóły medyczne]
   ├─ Lekarz (jeśli wymieniony)
   ├─ Sekcja zwłok? (Tak/Nie)
   └─ Diagnoza w starożytności vs nowoczesna
```

### Inteligentne kontekstowe:
```
JEŚLI: Wiek < 5 lat
SUGERUJ:
  - Czy był chrzest?
  - Czy żywe po porodzie?
  - Czy pochowany jako żywe dziecko?

JEŚLI: Płeć = kobieta AND wiek: 15-50
PYTAJ:
  - Zmartwychwstanie związane z porodem?
  - Gorączka połogowa?

JEŚLI: Status cywilny = "żonaty"
POKAŻ:
  - Czy małżonka zeszła później?
  - Kiedy ponownie wyszła zamąż?
```

---

## 🎯 Strategia "Skróty + Widoczność"

### Grupa 1: Zawsze w polu widzenia (Primary - 6-8 pól)
- Zoptymalizowane dla typowego użytkownika
- Duże fonty, jasne etykiety
- Podpowiedzi w tooltipie (na hover)

### Grupa 2: Szybki dostęp (Ctrl+E = "Expand")
- Otwiera drugi panel side-by-side
- Zawiera Secondary fields (powiązane dane)
- Mogą być przyciskami "+" obok group headers

### Grupa 3: Kolapsowalne sekcje (Accordion)
- [≡ nazwa sekcji] - klik = expand/collapse
- Zgrupowane tematycznie
- Przeniesienie mało używanych danych poza główny widok

### Grupa 4: Kontekst (Prawy klik / [...])
- Menu z akcjami dotyczącymi tego rekordu
- Linki do powiązanych aktów
- Sugestie

---

## 💡 Propozycja pól dla CHRZTU (konkretnie)

### Layout 3-kolumnowy:

```
┌──────────┬──────────┬──────────┐
│ DZIECKO  │ OJCIEC   │ MATKA    │
├──────────┼──────────┼──────────┤
│ Imię*    │ Imię*    │ Imię*    │
│ Nazwisko │ Nazwisko │ Panieńsk │
│ Data     │ Zawód    │ Zawód    │
│ Miejsca  │ Wiek     │ Wiek     │
│ Płeć     │ [≡Więcej]│ [≡Więcej]│
│          │          │          │
└──────────┴──────────┴──────────┘

┌────────────────────────────────┐
│ CHRZEST (Toggle to show)       │
│ Data | Kościół | [≡ Chrzestni]│
└────────────────────────────────┘

┌────────────────────────────────┐
│ NOTATKI ORG:                   │
│ [                              │
│  ]                             │
└────────────────────────────────┘
```

### Szczegółowo:

**Pola zawsze widoczne (6):**
1. `Imię dziecka` - TextInput - [Jan Józef]
2. `Nazwisko` - TextInput - [Kowalski]
3. `Płeć` - Toggle M/K/? 
4. `Data urodzenia` - DateInput - [15-05-1890] z opcją [~] [?]
5. `Imię ojca` - TextInput - [Stanisław]
6. `Imię matki` - TextInput - [Łucja]

**Pola Secondary (Ctrl+E):**
7. Nazwisko ojca
8. Zawód ojca (dropdown + custom)
9. Wiek ojca
10. Mieszka (ojciec)
11. Nazwisko panieńskie matki
12. Zawód matki
13. Wiek matki
14. Mieszka (matka)
15. Czy rodzice żonaci?

**Accordion - Chrzest:**
- Data chrztu (jeśli inna)
- Kościół
- Ojciec chrzestny (imię + nazwisko + zawód)
- Matka chrzestna (imię + nazwisko + zawód)

**Accordion - Historia:**
- Czy matka później zmarła? [Nie] [Tak - data ___]
- Czy matka później wyszła zamąż? [Nie] [Tak - rok ___]
- Czy ojciec był wdowcem? [Nie] [Tak - kiedy ___]
- Czy w małżeństwie? [Nie] [Tak] [?]

**Notatki ORG (zawsze):**
- Wieloliniowy TextArea
- "UWAGI z aktu, możliwe bliźnięta, zmiana imion..."

---

## 🔧 Implementacyjne wskazówki

### Walidacja warunkowa - pseudokod:
```javascript
JEŚLI: field("Czy rodzice żonaci?") === "Nie"
POKAŻ: [
  "Ojciec potajemny?",
  "Kto zgłaszał dziecko?",
  "Później uznane?"
]

JEŚLI: field("Matka") && field("Data urodzenia")
PYTAJ: "Czy wiadomo kiedy zmarła matka?"

JEŚLI: field("Rok") > 1900 && rok < 1920
SUGERUJ: ["Druga nazwa rodziska?", "WWI - gdzie ojciec?"]
```

### Dostępność klawiszowa:
```
Tab          = następne pole
Shift+Tab    = poprzednie pole
Ctrl+E       = Expand Secondary
Ctrl+S       = Save
Ctrl+N       = New record
Ctrl+C       = Copy previous
Ctrl+R       = Toggle Accordion "Historia"
```

### Kolory statusu pola:
```
🟢 GREEN (filled) - pole ma wartość
🟡 YELLOW (roi marked) - zaznaczony w obrazie, brak wartości
⚫ GRAY (empty) - puste
🔴 RED (required) - brakuje istotnego pola
```

---

## 📋 Checklist dla każdego formularza:

- [ ] Określić 6-8 pól PRIMARY (zawsze widoczne)
- [ ] Określić Secondary fields (Ctrl+E)
- [ ] Zgrupować w Accordion'y (historia, szczegóły, notatki)
- [ ] Walidacja warunkowa (if-then rules)
- [ ] Menu kontekstowe (co pokazać po prawym kliku?)
- [ ] Domyślne wartości (suggestione z roku/miejsca)
- [ ] Klawiszowe skróty
- [ ] Tooltips dla każdego pola

---

**Status**: Gotowe do oprogramowania  
**Następny krok**: Implementacja w HTML/CSS/JS bazując na viewer-osd-v8.html
