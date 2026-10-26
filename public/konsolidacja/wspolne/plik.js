/* wspolne/plik.js – pobieranie pliku z przeglądarki (BOM UTF-8 domyślnie, oprócz .ged) */
function dl(name, text, type, bom){ type = type || 'text/csv'; if (bom === undefined) bom = !name.endsWith('.ged');
  const b = new Blob([bom ? '﻿' : '', text], {type: type + ';charset=utf-8'}), u = URL.createObjectURL(b), l = document.createElement('a'); l.href = u; l.download = name; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }
