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


## Una cuestión importante de esta V2

Los enlaces creados mediante + NUEVO ENLACE no se escriben en GitHub. Se almacenan en el localStorage del navegador.

Por tanto:

📱 Creas un enlace en el móvil → queda en ese móvil.
💻 Abres la app en el portátil → no lo verá.
📱 Cierras la app y vuelves mañana → seguirá ahí.
🧹 Borras los datos del navegador → esos enlaces locales se perderán.
📄 Los 7 enlaces del enlaces.json sí aparecen en cualquier dispositivo.

Esto nos deja una base muy buena para la siguiente evolución: editar y borrar los enlaces locales y, sobre todo, podemos añadir un botón de "Exportar enlaces" que genere un nuevo enlaces.json con los enlaces locales incorporados. Así podrías llevar ese JSON a GitHub y sincronizar todos los dispositivos sin necesidad de montar todavía una base de datos.