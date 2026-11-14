# Przenosi i zmienia nazwy skanów małżeństw (Blinów). Uruchom: powershell -ExecutionPolicy Bypass -File przenies_skany.ps1   (próba bez zmian: dopisz -WhatIf)
param([switch]$WhatIf)
$ErrorActionPreference = "Stop"
$B = "D:\genealog\01_SKANY\Blinów\Małżeństwa"
New-Item -ItemType Directory -Force -Path "$B\1937 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\000.jpg" -Destination "$B\1937 USC\lub.blin.M.1937.okladka.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1937 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\001.jpg" -Destination "$B\1937 USC\lub.blin.M.1937.026.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1937 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\002.jpg" -Destination "$B\1937 USC\lub.blin.M.1937.027+protokol-rejestr.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1937 USC" | Out-Null
Copy-Item -LiteralPath "$B\1937-1944 USC Szastarka\003.jpg" -Destination "$B\1937 USC\lub.blin.M.1937.protokol-rejestr.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1938 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\003.jpg" -Destination "$B\1938 USC\lub.blin.M.1938.001.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1938 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\004.jpg" -Destination "$B\1938 USC\lub.blin.M.1938.002-003.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1938 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\005.jpg" -Destination "$B\1938 USC\lub.blin.M.1938.004-005.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1938 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\006.jpg" -Destination "$B\1938 USC\lub.blin.M.1938.006-007.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1938 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\007.jpg" -Destination "$B\1938 USC\lub.blin.M.1938.008-009.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1938 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\008.jpg" -Destination "$B\1938 USC\lub.blin.M.1938.010-011.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1938 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\009.jpg" -Destination "$B\1938 USC\lub.blin.M.1938.012-013.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1938 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\010.jpg" -Destination "$B\1938 USC\lub.blin.M.1938.014-015.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1938 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\011.jpg" -Destination "$B\1938 USC\lub.blin.M.1938.016-017.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1938 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\012.jpg" -Destination "$B\1938 USC\lub.blin.M.1938.018-019.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1938 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\013.jpg" -Destination "$B\1938 USC\lub.blin.M.1938.020-021.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1938 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\014.jpg" -Destination "$B\1938 USC\lub.blin.M.1938.022-023.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1938 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\015.jpg" -Destination "$B\1938 USC\lub.blin.M.1938.024-025.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1938 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\016.jpg" -Destination "$B\1938 USC\lub.blin.M.1938.026+protokol-rejestr.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1938 USC" | Out-Null
Copy-Item -LiteralPath "$B\1937-1944 USC Szastarka\017.jpg" -Destination "$B\1938 USC\lub.blin.M.1938.protokol-rejestr.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1939 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\017.jpg" -Destination "$B\1939 USC\lub.blin.M.1939.001.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1939 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\018.jpg" -Destination "$B\1939 USC\lub.blin.M.1939.002-003.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1939 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\019.jpg" -Destination "$B\1939 USC\lub.blin.M.1939.004-005.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1939 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\020.jpg" -Destination "$B\1939 USC\lub.blin.M.1939.006-007.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1939 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\021.jpg" -Destination "$B\1939 USC\lub.blin.M.1939.008-009.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1939 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\022.jpg" -Destination "$B\1939 USC\lub.blin.M.1939.010-011.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1939 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\023.jpg" -Destination "$B\1939 USC\lub.blin.M.1939.012-013.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1939 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\024.jpg" -Destination "$B\1939 USC\lub.blin.M.1939.014-015.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1939 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\025.jpg" -Destination "$B\1939 USC\lub.blin.M.1939.016+protokol-rejestr.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1939 USC" | Out-Null
Copy-Item -LiteralPath "$B\1937-1944 USC Szastarka\026.jpg" -Destination "$B\1939 USC\lub.blin.M.1939.protokol-rejestr.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\026.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.001.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\027.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.002-003.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\028.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.004-005.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\029.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.006-007.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\030.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.008-009.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\031.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.010-011.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\032.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.012-013.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\033.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.014-015.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\034.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.016-017.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\035.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.018-019.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\036.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.020-021.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\037.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.022-023.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\038.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.024-025.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\039.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.026-027.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\040.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.028-029.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\041.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.030-031.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\042.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.032-033.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\043.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.034-035.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\044.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.036-037.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\045.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.038-039.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\046.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.040-041.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\047.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.042-043.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\048.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.044-045.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\049.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.046-047.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\050.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.048-049.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\051.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.050-051.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\052.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.protokol-rejestr.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1940 USC" | Out-Null
Copy-Item -LiteralPath "$B\1937-1944 USC Szastarka\053.jpg" -Destination "$B\1940 USC\lub.blin.M.1940.protokol-rejestr.usc-szast_2.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1941 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\053.jpg" -Destination "$B\1941 USC\lub.blin.M.1941.001.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1941 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\054.jpg" -Destination "$B\1941 USC\lub.blin.M.1941.002-003.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1941 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\055.jpg" -Destination "$B\1941 USC\lub.blin.M.1941.004-005.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1941 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\056.jpg" -Destination "$B\1941 USC\lub.blin.M.1941.006-007.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1941 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\057.jpg" -Destination "$B\1941 USC\lub.blin.M.1941.008-009.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1941 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\058.jpg" -Destination "$B\1941 USC\lub.blin.M.1941.010-011.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1941 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\059.jpg" -Destination "$B\1941 USC\lub.blin.M.1941.012-013.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1941 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\060.jpg" -Destination "$B\1941 USC\lub.blin.M.1941.014-015.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1941 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\061.jpg" -Destination "$B\1941 USC\lub.blin.M.1941.016-017.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1941 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\062.jpg" -Destination "$B\1941 USC\lub.blin.M.1941.018-019.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1941 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\063.jpg" -Destination "$B\1941 USC\lub.blin.M.1941.020-021.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1941 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\064.jpg" -Destination "$B\1941 USC\lub.blin.M.1941.022-023.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1941 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\065.jpg" -Destination "$B\1941 USC\lub.blin.M.1941.024-025.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1941 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\066.jpg" -Destination "$B\1941 USC\lub.blin.M.1941.protokol-rejestr.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1942 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\067.jpg" -Destination "$B\1942 USC\lub.blin.M.1942.001-002.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1942 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\068.jpg" -Destination "$B\1942 USC\lub.blin.M.1942.003-004.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1942 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\069.jpg" -Destination "$B\1942 USC\lub.blin.M.1942.005-006.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1942 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\070.jpg" -Destination "$B\1942 USC\lub.blin.M.1942.007-008.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1942 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\071.jpg" -Destination "$B\1942 USC\lub.blin.M.1942.009-010.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1942 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\072.jpg" -Destination "$B\1942 USC\lub.blin.M.1942.011-012.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1942 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\073.jpg" -Destination "$B\1942 USC\lub.blin.M.1942.protokol-rejestr.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1943 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\074.jpg" -Destination "$B\1943 USC\lub.blin.M.1943.001-002.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1943 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\075.jpg" -Destination "$B\1943 USC\lub.blin.M.1943.003-004.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1943 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\076.jpg" -Destination "$B\1943 USC\lub.blin.M.1943.005-006.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1943 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\077.jpg" -Destination "$B\1943 USC\lub.blin.M.1943.007-008.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1943 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\078.jpg" -Destination "$B\1943 USC\lub.blin.M.1943.009-010.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1943 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\079.jpg" -Destination "$B\1943 USC\lub.blin.M.1943.011-012.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1943 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\080.jpg" -Destination "$B\1943 USC\lub.blin.M.1943.013-014.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1943 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\081.jpg" -Destination "$B\1943 USC\lub.blin.M.1943.015-016.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1943 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\082.jpg" -Destination "$B\1943 USC\lub.blin.M.1943.017-018.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1943 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\083.jpg" -Destination "$B\1943 USC\lub.blin.M.1943.019-020.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1943 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\084.jpg" -Destination "$B\1943 USC\lub.blin.M.1943.021-022.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1943 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\085.jpg" -Destination "$B\1943 USC\lub.blin.M.1943.023-024.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1943 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\086.jpg" -Destination "$B\1943 USC\lub.blin.M.1943.025-026.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1943 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\087.jpg" -Destination "$B\1943 USC\lub.blin.M.1943.028.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1943 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\088.jpg" -Destination "$B\1943 USC\lub.blin.M.1943.029-030.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1943 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\089.jpg" -Destination "$B\1943 USC\lub.blin.M.1943.031-032.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1943 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\090.jpg" -Destination "$B\1943 USC\lub.blin.M.1943.protokol-rejestr.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1944 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\091.jpg" -Destination "$B\1944 USC\lub.blin.M.1944.001-002.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1944 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\092.jpg" -Destination "$B\1944 USC\lub.blin.M.1944.003-004.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1944 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\093.jpg" -Destination "$B\1944 USC\lub.blin.M.1944.005-006.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1944 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\094.jpg" -Destination "$B\1944 USC\lub.blin.M.1944.007-008.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1944 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\095.jpg" -Destination "$B\1944 USC\lub.blin.M.1944.009-010.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1944 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\096.jpg" -Destination "$B\1944 USC\lub.blin.M.1944.011-012.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1944 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\097.jpg" -Destination "$B\1944 USC\lub.blin.M.1944.013-014.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1944 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\098.jpg" -Destination "$B\1944 USC\lub.blin.M.1944.015-016.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1944 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\099.jpg" -Destination "$B\1944 USC\lub.blin.M.1944.017-018.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1944 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\100.jpg" -Destination "$B\1944 USC\lub.blin.M.1944.019-020.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1944 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\101.jpg" -Destination "$B\1944 USC\lub.blin.M.1944.zamkniecie-ksiegi.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1944 USC" | Out-Null
Move-Item -LiteralPath "$B\1937-1944 USC Szastarka\102.jpg" -Destination "$B\1944 USC\lub.blin.M.1944.okladka.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1944 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\000.jpg" -Destination "$B\1944 USC\lub.blin.M.1944.okladka-ksiegi-1944-45.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1944 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\001.jpg" -Destination "$B\1944 USC\lub.blin.M.1944.021.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1944 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\002.jpg" -Destination "$B\1944 USC\lub.blin.M.1944.022-023.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1944 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\003.jpg" -Destination "$B\1944 USC\lub.blin.M.1944.protokol-rejestr.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1945 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\004.jpg" -Destination "$B\1945 USC\lub.blin.M.1945.001-002.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1945 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\005.jpg" -Destination "$B\1945 USC\lub.blin.M.1945.003-004.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1945 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\006.jpg" -Destination "$B\1945 USC\lub.blin.M.1945.005-006.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1945 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\007.jpg" -Destination "$B\1945 USC\lub.blin.M.1945.007-008.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1945 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\008.jpg" -Destination "$B\1945 USC\lub.blin.M.1945.009-010.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1945 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\009.jpg" -Destination "$B\1945 USC\lub.blin.M.1945.011-012.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1945 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\010.jpg" -Destination "$B\1945 USC\lub.blin.M.1945.013-014.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1945 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\011.jpg" -Destination "$B\1945 USC\lub.blin.M.1945.dubel-011.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1945 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\012.jpg" -Destination "$B\1945 USC\lub.blin.M.1945.015-016.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1945 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\013.jpg" -Destination "$B\1945 USC\lub.blin.M.1945.dubel-013.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1945 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\014.jpg" -Destination "$B\1945 USC\lub.blin.M.1945.dubel-014.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1945 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\015.jpg" -Destination "$B\1945 USC\lub.blin.M.1945.dubel-015.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1945 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\016.jpg" -Destination "$B\1945 USC\lub.blin.M.1945.017-018.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1945 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\017.jpg" -Destination "$B\1945 USC\lub.blin.M.1945.019-020.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1945 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\018.jpg" -Destination "$B\1945 USC\lub.blin.M.1945.021-022.usc-szast.jpg" -WhatIf:$WhatIf
New-Item -ItemType Directory -Force -Path "$B\1945 USC" | Out-Null
Move-Item -LiteralPath "$B\1944-1945 USC Szastarka\019.jpg" -Destination "$B\1945 USC\lub.blin.M.1945.protokol-rejestr.usc-szast.jpg" -WhatIf:$WhatIf
