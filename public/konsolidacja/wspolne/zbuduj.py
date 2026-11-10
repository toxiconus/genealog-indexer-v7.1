"""Wklejanie wspólnych modułów do szablonów HTML: znacznik /*MODULE:nazwa*/ → zawartość wspolne/nazwa.js;
znacznik /*JSON:nazwa*/ → zawartość wspolne/nazwa.json (w jednej linii; podstawiany po modułach, więc może być użyty wewnątrz modułu)"""
import os, re, json
_here = os.path.dirname(os.path.abspath(__file__))
def inline(html):
    def sub(m):
        return open(os.path.join(_here, m.group(1) + ".js"), encoding="utf-8").read()
    html = re.sub(r"/\*MODULE:(\w+)\*/", sub, html)
    def js(m):
        d = json.load(open(os.path.join(_here, m.group(1) + ".json"), encoding="utf-8"))
        return json.dumps(d, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    return re.sub(r"/\*JSON:(\w+)\*/", js, html)
