/* app/moduly/ui_html.js – jedyny sposób wstawiania HTML w aplikacji (RYZYKA §4). Szablon znakowany h`…` escapuje każdą wstawkę (tekst, liczby, atrybuty w cudzysłowach);
   surowy HTML wymaga jawnego raw(). innerHTML wolno tylko w plikach ui_*.js (sprawdza zbuduj_app.py). */
class SurowyHtml { constructor(s){ this.s = s; } toString(){ return this.s; } }
const raw = s => new SurowyHtml(String(s));
function h(strs, ...vals){ let o = strs[0]; vals.forEach((v, i) => { o += (Array.isArray(v) ? v.map(x => x instanceof SurowyHtml ? x.s : esc(x)).join('') : v instanceof SurowyHtml ? v.s : esc(v)) + strs[i + 1]; }); return new SurowyHtml(o); }
function wstaw(el, r){ el.innerHTML = r instanceof SurowyHtml ? r.s : esc(r); }
