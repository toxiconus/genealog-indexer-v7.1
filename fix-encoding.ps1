$content = Get-Content 'public\viewer-osd-v8.html' -Encoding UTF8
$content = $content -replace 'â€"', '–'
$content = $content -replace 'maĹ‚e', 'małe'
$content = $content -replace 'bieĹĽÄ…cego', 'bieżącego'
$content = $content -replace 'UsuĹ„', 'Usunąć'
$content = $content -replace 'PeĹ‚ny', 'Pełny'
$content = $content -replace 'PokaĹĽ peĹ‚ny', 'Pokaż pełny'
$content = $content -replace 'niepeĹ‚ny', 'niepełny'
$content = $content -replace 'panel aktĂłw', 'panel aktów'
$content = $content -replace 'PomiĹ„', 'Pominąć'
$content | Set-Content 'public\viewer-osd-v8.html' -Encoding UTF8
Write-Host 'Naprawione!'
