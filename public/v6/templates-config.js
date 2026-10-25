window.TEMPLATES_CONFIG = {
  "version": "3.1",
  "description": "Genealog Indexer Template Configuration - Define custom act types and fields",
  "templates": [
    {
      "id": "chrzest",
      "name": "Akt chrztu",
      "fields": [
        {
          "id": "source_id",
          "label": "ID źródła (np. CH.LUB.BLIN.1908.001)",
          "type": "text",
          "required": false,
          "placeholder": "CH.LUB.BLIN.1908.001"
        },
        {
          "id": "index_card",
          "label": "Karta indeksowa (nr)",
          "type": "text",
          "required": false,
          "placeholder": "np. 12"
        },
        {
          "id": "index_month",
          "label": "Miesiąc wpisu (z indeksu)",
          "type": "text",
          "required": false,
          "placeholder": "np. III"
        },
        {
          "id": "christening_year",
          "label": "Rok chrztu",
          "type": "number",
          "required": true,
          "placeholder": "np. 1783"
        },
        {
          "id": "christening_act_number",
          "label": "Numer aktu",
          "type": "text",
          "required": true,
          "placeholder": "np. 17"
        },
        {
          "id": "christening_date",
          "label": "Data chrztu (surowy tekst)",
          "type": "text",
          "required": false,
          "placeholder": "np. ij 2 Januarij"
        },
        {
          "id": "christening_place",
          "label": "Miejscowość",
          "type": "text",
          "required": false,
          "placeholder": "np. Blinów"
        },
        {
          "id": "child_first_name",
          "label": "Imię dziecka",
          "type": "text",
          "required": true,
          "placeholder": "np. Jan"
        },
        {
          "id": "child_last_name",
          "label": "Nazwisko dziecka",
          "type": "text",
          "required": true
        },
        {
          "id": "child_sex",
          "label": "Płeć",
          "type": "select",
          "required": false,
          "options": [
            "M",
            "K"
          ]
        },
        {
          "id": "child_birth_date",
          "label": "Data urodzenia",
          "type": "text",
          "required": false,
          "placeholder": "surowy tekst"
        },
        {
          "id": "child_birth_place",
          "label": "Miejsce urodzenia",
          "type": "text",
          "required": false
        },
        {
          "id": "child_legitimacy",
          "label": "Status (ślubne / nieślubne)",
          "type": "select",
          "required": false,
          "options": [
            "ślubne",
            "nieślubne"
          ]
        },
        {
          "id": "child_religion",
          "label": "Wyznanie",
          "type": "text",
          "required": false
        },
        {
          "id": "father_first_name",
          "label": "Imię ojca",
          "type": "text",
          "required": false
        },
        {
          "id": "father_last_name",
          "label": "Nazwisko ojca",
          "type": "text",
          "required": false
        },
        {
          "id": "father_age",
          "label": "Wiek ojca",
          "type": "text",
          "required": false,
          "placeholder": "np. ~1750 albo 40"
        },
        {
          "id": "father_occupation",
          "label": "Zawód ojca",
          "type": "text",
          "required": false
        },
        {
          "id": "father_residence",
          "label": "Miejsce zamieszkania ojca",
          "type": "text",
          "required": false
        },
        {
          "id": "mother_first_name",
          "label": "Imię matki",
          "type": "text",
          "required": false
        },
        {
          "id": "mother_last_name",
          "label": "Nazwisko matki",
          "type": "text",
          "required": false
        },
        {
          "id": "mother_age",
          "label": "Wiek matki",
          "type": "text",
          "required": false
        },
        {
          "id": "mother_occupation",
          "label": "Zawód matki",
          "type": "text",
          "required": false
        },
        {
          "id": "mother_residence",
          "label": "Miejsce zamieszkania matki",
          "type": "text",
          "required": false
        },
        {
          "id": "godfather_name",
          "label": "Ojciec chrzestny",
          "type": "text",
          "required": false
        },
        {
          "id": "godmother_name",
          "label": "Matka chrzestna",
          "type": "text",
          "required": false
        },
        {
          "id": "officiant",
          "label": "Duchowny",
          "type": "text",
          "required": false
        },
        {
          "id": "witnesses",
          "label": "Świadkowie",
          "type": "text",
          "required": false
        },
        {
          "id": "uncertain_fields",
          "label": "Pola z niepewnym odczytem",
          "type": "text",
          "required": false,
          "placeholder": "np. father_last_name, godfather_name"
        },
        {
          "id": "verification_status",
          "label": "Status weryfikacji",
          "type": "select",
          "required": false,
          "options": [
            "do sprawdzenia",
            "zweryfikowane"
          ]
        },
        {
          "id": "notes",
          "label": "Uwagi",
          "type": "textarea",
          "required": false
        },
        {
          "id": "notes_org",
          "label": "Uwagi organizacyjne",
          "type": "textarea",
          "required": false
        }
      ]
    },
    {
      "id": "birth",
      "name": "Akt Urodzenia",
      "icon": "fa-baby",
      "color": "#0078d4",
      "description": "Rejestr urodzin - dane dziecka i rodziców",
      "fields": [
        {
          "id": "child_first_name",
          "label": "Imię dziecka",
          "type": "text",
          "required": true,
          "placeholder": "np. Jan",
          "order": 1
        },
        {
          "id": "child_last_name",
          "label": "Nazwisko dziecka",
          "type": "text",
          "required": true,
          "placeholder": "np. Kowalski",
          "order": 2
        },
        {
          "id": "birth_date",
          "label": "Data urodzenia",
          "type": "text",
          "required": false,
          "order": 3
        },
        {
          "id": "birth_place",
          "label": "Miejsce urodzenia",
          "type": "text",
          "required": false,
          "placeholder": "np. Kraków",
          "order": 4
        },
        {
          "id": "father_name",
          "label": "Imię ojca",
          "type": "text",
          "required": false,
          "placeholder": "np. Stanisław",
          "order": 5
        },
        {
          "id": "father_profession",
          "label": "Zawód ojca",
          "type": "text",
          "required": false,
          "placeholder": "np. Rolnik",
          "order": 6
        },
        {
          "id": "mother_name",
          "label": "Imię matki",
          "type": "text",
          "required": false,
          "placeholder": "np. Maria",
          "order": 7
        },
        {
          "id": "notes",
          "label": "Uwagi",
          "type": "textarea",
          "required": false,
          "placeholder": "Dodatkowe informacje, uwagi transkrybenta",
          "order": 8
        }
      ]
    },
    {
      "id": "marriage",
      "name": "Akt Małżeństwa",
      "icon": "fa-ring",
      "color": "#107c10",
      "description": "Rejestr małżeństw - dane pary",
      "fields": [
        {
          "id": "marriage_year",
          "label": "Rok aktu",
          "type": "text",
          "required": false,
          "placeholder": "np. 1943",
          "order": 1
        },
        {
          "id": "marriage_act_number",
          "label": "Numer aktu",
          "type": "text",
          "required": false,
          "placeholder": "np. 8",
          "order": 2
        },
        {
          "id": "marriage_date",
          "label": "Data małżeństwa",
          "type": "text",
          "required": false,
          "order": 3,
          "placeholder": "np. 17.02.1943 albo 17.02 (rok z pola Rok)"
        },
        {
          "id": "marriage_time",
          "label": "Godzina",
          "type": "text",
          "required": false,
          "placeholder": "np. 9",
          "order": 4
        },
        {
          "id": "marriage_place",
          "label": "Miejsce małżeństwa",
          "type": "text",
          "required": false,
          "placeholder": "np. Kraków",
          "order": 5
        },
        {
          "id": "banns",
          "label": "Zapowiedzi",
          "type": "text",
          "required": false,
          "placeholder": "np. 31.01, 07.02, 14.02",
          "order": 6
        },
        {
          "id": "groom_first_name",
          "label": "Imię pana młodego",
          "type": "text",
          "required": true,
          "placeholder": "np. Jan",
          "order": 7
        },
        {
          "id": "groom_last_name",
          "label": "Nazwisko pana młodego",
          "type": "text",
          "required": true,
          "placeholder": "np. Kowalski",
          "order": 8
        },
        {
          "id": "groom_age",
          "label": "Wiek pana młodego",
          "type": "text",
          "required": false,
          "order": 9,
          "placeholder": "l.21 → podpowie ~1922"
        },
        {
          "id": "groom_status",
          "label": "Stan pana młodego",
          "type": "select",
          "required": false,
          "options": [
            "kawaler",
            "wdowiec",
            "panna",
            "wdowa"
          ],
          "order": 10
        },
        {
          "id": "groom_occupation",
          "label": "Zawód pana młodego",
          "type": "text",
          "required": false,
          "order": 11
        },
        {
          "id": "groom_residence",
          "label": "Miejsce zamieszkania pana młodego",
          "type": "text",
          "required": false,
          "order": 12
        },
        {
          "id": "groom_father_first_name",
          "label": "Imię ojca pana młodego",
          "type": "text",
          "required": false,
          "order": 13
        },
        {
          "id": "groom_father_last_name",
          "label": "Nazwisko ojca pana młodego",
          "type": "text",
          "required": false,
          "order": 14
        },
        {
          "id": "groom_mother_first_name",
          "label": "Imię matki pana młodego",
          "type": "text",
          "required": false,
          "order": 15
        },
        {
          "id": "groom_mother_last_name",
          "label": "Nazwisko panieńskie matki pana młodego",
          "type": "text",
          "required": false,
          "order": 16
        },
        {
          "id": "bride_first_name",
          "label": "Imię panny młodej",
          "type": "text",
          "required": true,
          "placeholder": "np. Anna",
          "order": 17
        },
        {
          "id": "bride_last_name",
          "label": "Nazwisko panny młodej",
          "type": "text",
          "required": true,
          "placeholder": "np. Lewandowska",
          "order": 18
        },
        {
          "id": "bride_age",
          "label": "Wiek panny młodej",
          "type": "text",
          "required": false,
          "order": 19,
          "placeholder": "l.17 → podpowie ~1926"
        },
        {
          "id": "bride_status",
          "label": "Stan panny młodej",
          "type": "select",
          "required": false,
          "options": [
            "kawaler",
            "wdowiec",
            "panna",
            "wdowa"
          ],
          "order": 20
        },
        {
          "id": "bride_occupation",
          "label": "Zawód panny młodej",
          "type": "text",
          "required": false,
          "order": 21
        },
        {
          "id": "bride_residence",
          "label": "Miejsce zamieszkania panny młodej",
          "type": "text",
          "required": false,
          "order": 22
        },
        {
          "id": "bride_father_first_name",
          "label": "Imię ojca panny młodej",
          "type": "text",
          "required": false,
          "order": 23
        },
        {
          "id": "bride_father_last_name",
          "label": "Nazwisko ojca panny młodej",
          "type": "text",
          "required": false,
          "order": 24
        },
        {
          "id": "bride_mother_first_name",
          "label": "Imię matki panny młodej",
          "type": "text",
          "required": false,
          "order": 25
        },
        {
          "id": "bride_mother_last_name",
          "label": "Nazwisko panieńskie matki panny młodej",
          "type": "text",
          "required": false,
          "order": 26
        },
        {
          "id": "witness1_name",
          "label": "Świadek 1",
          "type": "text",
          "required": false,
          "order": 27
        },
        {
          "id": "witness2_name",
          "label": "Świadek 2",
          "type": "text",
          "required": false,
          "order": 28
        },
        {
          "id": "previous_spouse",
          "label": "Poprzedni małżonek (jeśli wdowiec/wdowa)",
          "type": "text",
          "required": false,
          "placeholder": "imię nazwisko, data zgonu",
          "order": 29
        },
        {
          "id": "officiant",
          "label": "Ksiądz udzielający ślubu",
          "type": "text",
          "required": false,
          "order": 30
        },
        {
          "id": "notes",
          "label": "Uwagi",
          "type": "textarea",
          "required": false,
          "placeholder": "Dodatkowe informacje",
          "order": 31
        },
        {
          "id": "notes_org",
          "label": "Uwagi (oryginał)",
          "type": "textarea",
          "required": false,
          "order": 32
        },
        {
          "id": "verification_status",
          "label": "Status weryfikacji",
          "type": "select",
          "required": false,
          "options": [
            "do sprawdzenia",
            "zweryfikowane"
          ],
          "order": 33
        }
      ]
    },
    {
      "id": "death",
      "name": "Akt Zgonu",
      "icon": "fa-cross",
      "color": "#c42b1c",
      "description": "Rejestr zgonów - dane zmarłego",
      "fields": [
        {
          "id": "death_year",
          "label": "Rok aktu",
          "type": "text",
          "required": false,
          "placeholder": "np. 1873",
          "order": 1
        },
        {
          "id": "death_act_number",
          "label": "Numer aktu",
          "type": "text",
          "required": false,
          "order": 2
        },
        {
          "id": "deceased_first_name",
          "label": "Imię zmarłego",
          "type": "text",
          "required": true,
          "placeholder": "np. Jan",
          "order": 3
        },
        {
          "id": "deceased_last_name",
          "label": "Nazwisko zmarłego",
          "type": "text",
          "required": true,
          "placeholder": "np. Kowalski",
          "order": 4
        },
        {
          "id": "deceased_maiden_name",
          "label": "Nazwisko rodowe (kobiety)",
          "type": "text",
          "required": false,
          "order": 5
        },
        {
          "id": "deceased_sex",
          "label": "Płeć",
          "type": "select",
          "required": false,
          "options": [
            "M",
            "K"
          ],
          "order": 6
        },
        {
          "id": "death_date",
          "label": "Data zgonu",
          "type": "text",
          "required": false,
          "order": 7,
          "placeholder": "np. 12.03.1873"
        },
        {
          "id": "death_time",
          "label": "Godzina",
          "type": "text",
          "required": false,
          "order": 8
        },
        {
          "id": "death_place",
          "label": "Miejsce zgonu",
          "type": "text",
          "required": false,
          "placeholder": "np. Kraków",
          "order": 9
        },
        {
          "id": "age",
          "label": "Wiek (lata)",
          "type": "text",
          "required": false,
          "order": 10,
          "placeholder": "np. l.38, m.6, d.3 → podpowie ~rok"
        },
        {
          "id": "deceased_status",
          "label": "Stan",
          "type": "select",
          "required": false,
          "options": [
            "kawaler",
            "panna",
            "żonaty",
            "mężatka",
            "wdowiec",
            "wdowa",
            "dziecko"
          ],
          "order": 11
        },
        {
          "id": "deceased_spouse",
          "label": "Małżonek (imię, nazwisko, żyjący/zmarły)",
          "type": "text",
          "required": false,
          "order": 12
        },
        {
          "id": "deceased_birth_place",
          "label": "Miejsce urodzenia zmarłego",
          "type": "text",
          "required": false,
          "order": 13
        },
        {
          "id": "deceased_residence",
          "label": "Miejsce zamieszkania",
          "type": "text",
          "required": false,
          "order": 14
        },
        {
          "id": "profession",
          "label": "Zawód",
          "type": "text",
          "required": false,
          "placeholder": "np. Rolnik",
          "order": 15
        },
        {
          "id": "father_first_name",
          "label": "Imię ojca",
          "type": "text",
          "required": false,
          "order": 16
        },
        {
          "id": "father_last_name",
          "label": "Nazwisko ojca",
          "type": "text",
          "required": false,
          "order": 17
        },
        {
          "id": "mother_first_name",
          "label": "Imię matki",
          "type": "text",
          "required": false,
          "order": 18
        },
        {
          "id": "mother_last_name",
          "label": "Nazwisko panieńskie matki",
          "type": "text",
          "required": false,
          "order": 19
        },
        {
          "id": "informant1",
          "label": "Zgłaszający 1",
          "type": "text",
          "required": false,
          "order": 20
        },
        {
          "id": "informant2",
          "label": "Zgłaszający 2",
          "type": "text",
          "required": false,
          "order": 21
        },
        {
          "id": "cause_of_death",
          "label": "Przyczyna zgonu",
          "type": "textarea",
          "required": false,
          "placeholder": "np. Zapalenie płuc",
          "order": 22
        },
        {
          "id": "burial_place",
          "label": "Miejsce pochówku",
          "type": "text",
          "required": false,
          "order": 23
        },
        {
          "id": "officiant",
          "label": "Ksiądz",
          "type": "text",
          "required": false,
          "order": 24
        },
        {
          "id": "notes",
          "label": "Uwagi",
          "type": "textarea",
          "required": false,
          "placeholder": "Dodatkowe informacje",
          "order": 25
        },
        {
          "id": "notes_org",
          "label": "Uwagi (oryginał)",
          "type": "textarea",
          "required": false,
          "order": 26
        },
        {
          "id": "verification_status",
          "label": "Status weryfikacji",
          "type": "select",
          "required": false,
          "options": [
            "do sprawdzenia",
            "zweryfikowane"
          ],
          "order": 27
        }
      ]
    }
  ]
};
