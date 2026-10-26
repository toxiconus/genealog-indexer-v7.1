"""Wklejanie wspólnych modułów do szablonów HTML: znacznik /*MODULE:nazwa*/ → zawartość wspolne/nazwa.js"""
import os, re
_here = os.path.dirname(os.path.abspath(__file__))
def inline(html):
    def sub(m):
        return open(os.path.join(_here, m.group(1) + ".js"), encoding="utf-8").read()
    return re.sub(r"/\*MODULE:(\w+)\*/", sub, html)
