/* wspolne/tekst.js – wspólne funkcje tekstowe (wklejane do HTML przy budowaniu przez zbuduj.py) */
const fold = s => (s||'').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ł/g,'l');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// odległość Levenshteina; max (opcjonalnie) = szybkie odcięcie: gdy różnica długości > max zwraca max+1
function lev(a, b, max){ a = String(a); b = String(b); const m = a.length, n = b.length; if (max !== undefined && Math.abs(m-n) > max) return max + 1; if (!m) return n; if (!n) return m;
  let p = [...Array(n+1).keys()]; for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j]+1, c[j-1]+1, p[j-1] + (a[i-1] === b[j-1] ? 0 : 1)); p = c; } return p[n]; }
function csvCell(v){ v = String(v ?? ''); return /[;"\n\r]/.test(v) ? '"' + v.replace(/"/g,'""') + '"' : v; }
