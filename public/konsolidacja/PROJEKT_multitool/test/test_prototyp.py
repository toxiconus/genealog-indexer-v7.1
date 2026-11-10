#!/usr/bin/env python3
"""Test dymny prototypu (Playwright, Chromium): python3 test/test_prototyp.py [katalog_na_zrzuty]
Sprawdza: start bez błędów JS, lista, propozycje z uzasadnieniem, scalenie, trwałość po przeładowaniu, cofnięcie, blokadę scalenia odrzuconej pary, brak poziomego przewijania na telefonie."""
import os, sys, json
from playwright.sync_api import sync_playwright
H = os.path.dirname(os.path.abspath(__file__)); URL = 'file://' + os.path.join(H, '..', 'prototyp', 'multitool_prototyp.html'); OUT = sys.argv[1] if len(sys.argv) > 1 else None
with sync_playwright() as pw:
    b = pw.chromium.launch(); bledy = []
    for nazwa, vp in (('desktop', {'width': 1280, 'height': 900}), ('telefon', {'width': 420, 'height': 800})):
        ctx = b.new_context(viewport=vp); p = ctx.new_page(); p.on('pageerror', lambda e: bledy.append(str(e))); p.on('console', lambda m: m.type == 'error' and bledy.append(m.text))
        p.goto(URL); p.wait_for_function('GOTOWE >= PL.length', timeout=60000)
        assert p.locator('#lista .it').count() > 50
        p.click('#flt button[data-f=spr]'); n = p.locator('#lista .it').count(); assert n > 0, 'brak mocnych propozycji'
        p.locator('#lista .it').first.click(); assert p.locator('.prop.sprawdz').count() >= 1
        assert p.locator('.prop.sprawdz .zg li').count() >= 3 and 'Wniosek' in p.locator('.prop.sprawdz').first.inner_text()
        if OUT: p.screenshot(path=os.path.join(OUT, nazwa + '_propozycja.png'), full_page=False)
        para = p.evaluate('[PROP[0].a, PROP[0].b]')
        p.locator('.prop.sprawdz button[data-a=scal]').first.click(); p.wait_for_function('Object.keys(KL.osoby).length === 1')
        assert 'Osoba o:1' in p.locator('#main h2').first.inner_text()
        p.reload(); p.wait_for_function('GOTOWE >= PL.length'); assert p.evaluate('Object.keys(KL.osoby).length') == 1, 'decyzja nie przetrwała przeładowania'
        p.evaluate('CUR = %s; lista(); karta()' % json.dumps(para[0])); assert p.locator('#main .card h3').count() >= 2
        if OUT: p.screenshot(path=os.path.join(OUT, nazwa + '_osoba.png'), full_page=True)
        p.locator('button[data-cof]').first.click(); p.wait_for_function('Object.keys(KL.osoby).length === 0')
        assert p.evaluate('DEC.length') == 2 and p.evaluate('DANE.wystapienia.length') == 926, 'cofnięcie nie może niczego kasować'
        # odrzucenie pary blokuje jej późniejsze scalenie pośrednie
        r = p.evaluate('''(() => { const u = PROP.find(x => x.wniosek !== "konflikt"); decNowa(DEC, {typ:"odrzuc", a:u.a, b:u.b}); return decKolizje(DEC, u.a, u.b).length; })()'''); assert r == 1
        assert p.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), 'poziome przewijanie'
        ctx.close()
    b.close(); assert not bledy, bledy; print('OK: desktop i telefon, bez błędów JS')
