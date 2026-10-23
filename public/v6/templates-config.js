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
          "type": "date",
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
          "id": "groom_first_name",
          "label": "Imię pana młodego",
          "type": "text",
          "required": true,
          "placeholder": "np. Jan",
          "order": 1
        },
        {
          "id": "groom_last_name",
          "label": "Nazwisko pana młodego",
          "type": "text",
          "required": true,
          "placeholder": "np. Kowalski",
          "order": 2
        },
        {
          "id": "groom_age",
          "label": "Wiek pana młodego",
          "type": "number",
          "required": false,
          "order": 3
        },
        {
          "id": "bride_first_name",
          "label": "Imię panny młodej",
          "type": "text",
          "required": true,
          "placeholder": "np. Anna",
          "order": 4
        },
        {
          "id": "bride_last_name",
          "label": "Nazwisko panny młodej",
          "type": "text",
          "required": true,
          "placeholder": "np. Lewandowska",
          "order": 5
        },
        {
          "id": "bride_age",
          "label": "Wiek panny młodej",
          "type": "number",
          "required": false,
          "order": 6
        },
        {
          "id": "marriage_date",
          "label": "Data małżeństwa",
          "type": "date",
          "required": false,
          "order": 7
        },
        {
          "id": "marriage_place",
          "label": "Miejsce małżeństwa",
          "type": "text",
          "required": false,
          "placeholder": "np. Kraków",
          "order": 8
        },
        {
          "id": "notes",
          "label": "Uwagi",
          "type": "textarea",
          "required": false,
          "placeholder": "Dodatkowe informacje",
          "order": 9
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
          "id": "deceased_first_name",
          "label": "Imię zmarłego",
          "type": "text",
          "required": true,
          "placeholder": "np. Jan",
          "order": 1
        },
        {
          "id": "deceased_last_name",
          "label": "Nazwisko zmarłego",
          "type": "text",
          "required": true,
          "placeholder": "np. Kowalski",
          "order": 2
        },
        {
          "id": "death_date",
          "label": "Data zgonu",
          "type": "date",
          "required": false,
          "order": 3
        },
        {
          "id": "death_place",
          "label": "Miejsce zgonu",
          "type": "text",
          "required": false,
          "placeholder": "np. Kraków",
          "order": 4
        },
        {
          "id": "age",
          "label": "Wiek (lata)",
          "type": "number",
          "required": false,
          "order": 5
        },
        {
          "id": "profession",
          "label": "Zawód",
          "type": "text",
          "required": false,
          "placeholder": "np. Rolnik",
          "order": 6
        },
        {
          "id": "cause_of_death",
          "label": "Przyczyna zgonu",
          "type": "textarea",
          "required": false,
          "placeholder": "np. Zapalenie płuc",
          "order": 7
        },
        {
          "id": "notes",
          "label": "Uwagi",
          "type": "textarea",
          "required": false,
          "placeholder": "Dodatkowe informacje",
          "order": 8
        }
      ]
    }
  ]
};
