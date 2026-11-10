#!/usr/bin/env python3
"""Test escapowania (XSS) w wygenerowanych szablonach HTML konsolidacji (Playwright, Chromium).

Użycie: python3 PROJEKT_multitool/test/test_xss_szablony.py [katalog_roboczy]
  katalog_roboczy – tu powstają kopie plików (domyślnie katalog tymczasowy).

Dla każdego pliku: buduje go z repo (jeśli da się), wstrzykuje wrogie wartości do bloku danych
(nazwiska, imiona, uwagi, nazwy plików – każdy string poza pierwszą kolumną klucza),
ładuje przez file://, wywołuje główne widoki i sprawdza:
  - window.__xss pozostaje undefined,
  - w DOM nie ma <img src="x"> z payloadu,
  - brak błędów JS (pageerror / console.error).
Wynik: JSON na stdout.
"""
import json, os, re, subprocess, sys, tempfile
from playwright.sync_api import sync_playwright

H = os.path.dirname(os.path.abspath(__file__))
KON = os.path.abspath(os.path.join(H, '..', '..'))  # public/konsolidacja
WORK = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix='xss_szablony_')
os.makedirs(WORK, exist_ok=True)

P1 = '"><img src=x onerror="window.__xss=1">'
P2 = '<script>window.__xss=1</script>'
PAY = [P1, P2]
ID_KEYS = {'id', 'id_archiwalne', 'wiersz_zrodlo', 'key', 'rok', 'nr'}
_ctr = [0]


def _pay():
    _ctr[0] += 1
    return PAY[_ctr[0] % 2]


def mut_any(x, key=None):
    if key in ID_KEYS:
        return x
    if isinstance(x, str):
        return x + ' ' + _pay()
    if isinstance(x, list):
        return mut_row(x)
    if isinstance(x, dict):
        return {k: mut_any(v, k) for k, v in x.items()}
    return x


def mut_row(r):
    # pierwsza kolumna wiersza to klucz (id) – zostaje nietknięta
    return [x if (i == 0 and isinstance(x, str)) else mut_any(x) for i, x in enumerate(r)]


def mut_top(v):
    if isinstance(v, dict):
        return {k: mut_any(val, k) for k, val in v.items()}
    if isinstance(v, list):
        return [mut_any(r) for r in v]
    return v


def inject(html, names):
    """Podmienia wartości stałych danych (const NAME=...) na wersje z wrogimi danymi.
    JSON zapisywany z '</' -> '<\\/' (jak w build narzedzia/malzenstw); bez tego dane same łamałyby <script>."""
    dec = json.JSONDecoder()
    for name in names:
        m = re.search(r'const ' + name + r' ?= ?(?=[\[{])', html)
        if not m:
            raise RuntimeError(f'brak stałej {name} w pliku')
        obj, end = dec.raw_decode(html, m.end())
        new = json.dumps(mut_top(obj), ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
        html = html[:m.end()] + new + html[end:]
    return html


def build_narzedzia(out):  # narzedzia/build.py <dst>
    d = os.path.join(KON, 'narzedzia')
    subprocess.run([sys.executable, 'build.py', out], cwd=d, check=True, capture_output=True)
    return out


def build_malzenstwa(out):
    d = os.path.join(KON, 'haiku')
    subprocess.run([sys.executable, 'build_weryfikacja_malzenstw.py', os.path.join(WORK, 'brak_skanow'), out, '--bez-skanow'],
                   cwd=d, check=True, capture_output=True)
    return out


CASES = [
    dict(name='dopasowanie_osob.html', src=None,
         data=['B', 'D', 'M', 'G'],
         calls=['(go("B", B[0][0]), 0)', '([...document.querySelectorAll(".srow")].forEach(e => e.click()), 0)',
                '([...document.querySelectorAll(".cd button")].slice(0, 6).forEach(b => b.click()), 0)',
                '(go("M", M[0][0]), 0)', '([...document.querySelectorAll(".srow")].forEach(e => e.click()), 0)',
                '(go("D", D[0][0]), 0)', '([...document.querySelectorAll(".srow")].forEach(e => e.click()), 0)',
                'renderNetwork()', 'renderFamilies()', 'renderBridges()', 'renderPersonIndex()', 'renderRepD()', 'draw(true)']),
    dict(name='edytor_korekt (narzedzia)', src=build_narzedzia, data=['DATA'],
         calls=['renderAll()', 'renderList()', 'renderEditor()', 'renderSlownik()', 'renderKorekty()', 'renderScan()']),
    dict(name='weryfikacja_malzenstw', src=build_malzenstwa, data=['D'],
         calls=['renderList()', 'typeof ROWS!=="undefined"&&ROWS.length&&renderForm(ROWS[0])',
                'typeof ROWS!=="undefined"&&ROWS.length&&showScan(ROWS[0])']),
]

results = []
with sync_playwright() as pw:
    browser = pw.chromium.launch()
    for c in CASES:
        res = dict(plik=c['name'], status='ok', bledy=[], xss=None, img_xss=None, uwagi=[])
        try:
            stem = c['name'].split()[0].replace('.html', '')
            if c['src'] is None:  # plik wyjściowy z repo (przebudowany osobno przez dopasowanie/build.py)
                src_path = os.path.join(KON, 'dopasowanie', 'dopasowanie_osob.html')
            else:
                src_path = c['src'](os.path.join(WORK, stem + '_bz.html'))
            html = inject(open(src_path, encoding='utf-8').read(), c['data'])
            path = os.path.join(WORK, stem + '_xss.html')
            open(path, 'w', encoding='utf-8').write(html)
        except Exception as e:  # build/wstrzyknięcie nieudane – zapis w wyniku, bez zgadywania
            res['status'] = f'pominięty: {e}'
            results.append(res)
            continue
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        page.on('pageerror', lambda e: res['bledy'].append('pageerror: ' + str(e)[:200]))
        page.on('console', lambda m: res['bledy'].append('console.error: ' + m.text[:200]) if m.type == 'error' else None)
        try:
            page.goto('file://' + path, wait_until='load')
            page.wait_for_timeout(800)
            for js in c['calls']:
                try:
                    page.evaluate(f'() => {{ try {{ return {js}; }} catch (e) {{ return "ERR " + e.message; }} }}')
                except Exception as e:
                    res['uwagi'].append(f'wywołanie {js}: {str(e)[:120]}')
            # klikanie przycisków zakładek (bez nawigacji)
            n = page.evaluate('() => document.querySelectorAll("button").length')
            for i in range(min(n, 40)):
                try:
                    page.evaluate(f'() => {{ const b = document.querySelectorAll("button")[{i}]; if (b && b.offsetParent) b.click(); }}')
                    page.wait_for_timeout(60)
                except Exception as e:
                    res['uwagi'].append(f'klik {i}: {str(e)[:80]}')
            page.wait_for_timeout(300)
            res['xss'] = page.evaluate('() => typeof window.__xss')
            res['img_xss'] = page.evaluate('() => document.querySelectorAll("img[src=\\"x\\"]").length')
        except Exception as e:
            res['status'] = f'błąd ładowania: {str(e)[:200]}'
        finally:
            page.close()
        if res.get('xss') is None:
            results.append(res)
            continue
        if res['xss'] != 'undefined' or res['img_xss'] not in (0, None):
            res['status'] = 'FAIL (XSS)'
        elif res['bledy'] and res['status'] == 'ok':
            res['status'] = 'OK z błędami JS'
        results.append(res)
    browser.close()

print(json.dumps(results, ensure_ascii=False, indent=2))
