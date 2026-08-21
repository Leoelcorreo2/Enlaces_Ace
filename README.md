# ACE GRID

Web app estática para GitHub Pages que carga un JSON o CSV externo y muestra:
- Nombre
- URL
- botón para intentar abrir `acestream://`
- búsqueda
- diseño responsive para móvil, tablet y portátil

## Uso con GitHub

Sube `index.html` y `enlaces.json` al repositorio.

Para usar otro fichero publicado en GitHub, pulsa **Fuente** y pega su URL `raw.githubusercontent.com/...`.

También admite CSV si la URL termina en `.csv`. Los campos esperados son `Nombre` y `URL`.

## Importante sobre AceStream

El navegador no puede garantizar que abra AceStream: depende de que el dispositivo tenga una aplicación instalada que registre el esquema `acestream://` y de las restricciones del navegador. El botón simplemente intenta lanzar ese enlace.

No se incluyen reproductores ni proxies de terceros.
