import requests
import os
import time

# Baza URL dla księgi U_1908-1916
BASE_URL = "https://fotolubgens.lubgens.eu/galleries/Blinow/U_1908-1916/IMG_{:04d}.jpg"

# Nagłówki, by udawać przeglądarkę
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def pobierz_obraz(numer, folder_docelowy):
    url = BASE_URL.format(numer)
    plik_nazwa = f"IMG_{numer:04d}.jpg"
    sciezka = os.path.join(folder_docelowy, plik_nazwa)
    
    if os.path.exists(sciezka):
        print(f"Plik {plik_nazwa} już istnieje, pomijam.")
        return
    
    try:
        response = requests.get(url, headers=HEADERS, stream=True)
        response.raise_for_status()
        with open(sciezka, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Pobrano: {plik_nazwa}")
    except requests.exceptions.HTTPError as err:
        if response.status_code == 404:
            print(f"Plik {plik_nazwa} nie istnieje (404), pomijam.")
        elif response.status_code == 403:
            print(f"Plik {plik_nazwa} zabroniony (403), pomijam.")
        else:
            print(f"Błąd dla {plik_nazwa}: {err}")
    except Exception as err:
        print(f"Inny błąd dla {plik_nazwa}: {err}")

# Główna funkcja
start_numer = int(input("Podaj najniższy numer (np. 1): "))
koniec_numer = int(input("Podaj najwyższy numer (np. 253): "))
folder_docelowy = input("Podaj ścieżkę do folderu docelowego (np. C:/Pobrane/U_1908-1916): ")

os.makedirs(folder_docelowy, exist_ok=True)

for numer in range(start_numer, koniec_numer + 1):
    pobierz_obraz(numer, folder_docelowy)
    time.sleep(1)  # Opóźnienie 1 sekunda

print("Pobieranie zakończone!")