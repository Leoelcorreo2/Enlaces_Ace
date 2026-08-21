/* =========================================================
   GESTOR ACE STREAM - V2.1
   ========================================================= */

"use strict";


/* =========================================================
   CONFIGURACION
   ========================================================= */

const VERSION_APP = "2.1";

const CLAVE_LOCAL_STORAGE =
    "gestor_ace_stream_enlaces_locales_v21";



/* =========================================================
   DATOS
   ========================================================= */

let enlacesJSON = [];

let enlacesLocales = [];

let enlacesTodos = [];

let enlacesFiltrados = [];



/* =========================================================
   ELEMENTOS
   ========================================================= */

const listaEnlaces =
    document.getElementById(
        "listaEnlaces"
    );

const buscador =
    document.getElementById(
        "buscador"
    );

const limpiarBusqueda =
    document.getElementById(
        "limpiarBusqueda"
    );

const recargar =
    document.getElementById(
        "recargar"
    );

const nuevoEnlace =
    document.getElementById(
        "nuevoEnlace"
    );

const contadorEnlaces =
    document.getElementById(
        "contadorEnlaces"
    );

const mensaje =
    document.getElementById(
        "mensaje"
    );

const sinResultados =
    document.getElementById(
        "sinResultados"
    );

const estadoConexion =
    document.getElementById(
        "estadoConexion"
    );


/* MODAL */

const modalNuevo =
    document.getElementById(
        "modalNuevo"
    );

const cerrarModal =
    document.getElementById(
        "cerrarModal"
    );

const cancelarNuevo =
    document.getElementById(
        "cancelarNuevo"
    );

const formNuevoEnlace =
    document.getElementById(
        "formNuevoEnlace"
    );

const nombreNuevo =
    document.getElementById(
        "nombreNuevo"
    );

const idNuevo =
    document.getElementById(
        "idNuevo"
    );

const notaNuevo =
    document.getElementById(
        "notaNuevo"
    );

const urlPrevisualizacion =
    document.getElementById(
        "urlPrevisualizacion"
    );

const errorFormulario =
    document.getElementById(
        "errorFormulario"
    );



/* =========================================================
   INICIO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciarAplicacion
);


async function iniciarAplicacion() {

    /*
     * Comprobamos que los elementos principales
     * realmente existen.
     */

    if (
        !nuevoEnlace ||
        !modalNuevo ||
        !formNuevoEnlace
    ) {

        console.error(
            "Error: elementos principales de la aplicación no encontrados."
        );

        return;
    }


    configurarEventos();

    cargarEnlacesLocales();

    combinarEnlaces();

    ordenarEnlaces();

    actualizarContador();

    aplicarFiltroActual();

    await cargarJSON();

}



/* =========================================================
   EVENTOS
   ========================================================= */

function configurarEventos() {


    /* NUEVO ENLACE */

    nuevoEnlace.addEventListener(
        "click",
        abrirModal
    );


    /* CERRAR */

    cerrarModal.addEventListener(
        "click",
        cerrarModalNuevo
    );


    cancelarNuevo.addEventListener(
        "click",
        cerrarModalNuevo
    );


    /* CLIC FUERA DEL MODAL */

    modalNuevo.addEventListener(
        "click",
        function (evento) {

            if (
                evento.target ===
                modalNuevo
            ) {

                cerrarModalNuevo();

            }

        }
    );


    /* ESC */

    document.addEventListener(
        "keydown",
        function (evento) {

            if (
                evento.key === "Escape" &&
                !modalNuevo.classList.contains(
                    "oculto"
                )
            ) {

                cerrarModalNuevo();

            }

        }
    );


    /* FORMULARIO */

    formNuevoEnlace.addEventListener(
        "submit",
        crearNuevoEnlace
    );


    /* ID */

    idNuevo.addEventListener(
        "input",
        function () {

            ocultarErrorFormulario();

            actualizarPrevisualizacion();

        }
    );


    /* NOMBRE */

    nombreNuevo.addEventListener(
        "input",
        ocultarErrorFormulario
    );


    /* NOTA */

    notaNuevo.addEventListener(
        "input",
        ocultarErrorFormulario
    );


    /* BUSCADOR */

    buscador.addEventListener(
        "input",
        aplicarFiltroDesdeBusqueda
    );


    /* LIMPIAR */

    limpiarBusqueda.addEventListener(
        "click",
        limpiarBusquedaTexto
    );


    /* RECARGAR */

    recargar.addEventListener(
        "click",
        cargarEnlaces
    );

}



/* =========================================================
   CARGAR JSON
   ========================================================= */

async function cargarJSON() {

    mostrarCargando();

    try {

        /*
         * El parámetro evita que GitHub Pages/navegador
         * utilice una copia antigua.
         */

        const url =
            "enlaces.json?v=" +
            Date.now();


        const respuesta =
            await fetch(url, {
                cache: "no-store"
            });


        if (!respuesta.ok) {

            throw new Error(
                "HTTP " +
                respuesta.status
            );
        }


        const datos =
            await respuesta.json();


        if (
            !Array.isArray(datos)
        ) {

            throw new Error(
                "El JSON no contiene un array."
            );
        }


        enlacesJSON =
            datos
                .filter(
                    elemento =>
                        elemento &&
                        typeof elemento === "object"
                )
                .map(
                    elemento => {

                        return {

                            Nombre:
                                String(
                                    elemento.Nombre ||
                                    "Sin nombre"
                                ),

                            ID_Aces_Stream:
                                String(
                                    elemento.ID_Aces_Stream ||
                                    ""
                                ),

                            Nota:
                                convertirNota(
                                    elemento.Nota
                                ),

                            URL:
                                elemento.URL
                                    ? String(elemento.URL)
                                    : generarURL(
                                        elemento.ID_Aces_Stream
                                    ),

                            local:
                                false

                        };

                    }
                );


        combinarEnlaces();

        ordenarEnlaces();

        actualizarContador();

        aplicarFiltroActual();


        estadoConexion.textContent =
            "DATOS ACTUALIZADOS";


        estadoConexion.style.color =
            "#35d07f";


    } catch (error) {

        console.error(
            "Error cargando JSON:",
            error
        );


        combinarEnlaces();

        ordenarEnlaces();

        actualizarContador();

        aplicarFiltroActual();


        estadoConexion.textContent =
            "DATOS LOCALES";


        estadoConexion.style.color =
            "#ffb347";


        mostrarMensaje(
            "No se pudo actualizar enlaces.json. " +
            "Los enlaces locales siguen disponibles.",
            "error"
        );

    }

}



/* =========================================================
   COMPATIBILIDAD CON BOTON RECARGAR
   ========================================================= */

async function cargarEnlaces() {

    ocultarMensaje();

    await cargarJSON();

}



/* =========================================================
   LOCAL STORAGE - CARGAR
   ========================================================= */

function cargarEnlacesLocales() {

    enlacesLocales = [];


    try {

        const almacenado =
            localStorage.getItem(
                CLAVE_LOCAL_STORAGE
            );


        if (
            !almacenado
        ) {

            return;

        }


        const datos =
            JSON.parse(
                almacenado
            );


        if (
            !Array.isArray(datos)
        ) {

            return;

        }


        enlacesLocales =
            datos
                .filter(
                    elemento =>
                        elemento &&
                        typeof elemento === "object"
                )
                .map(
                    elemento => {

                        const id =
                            String(
                                elemento.ID_Aces_Stream ||
                                ""
                            ).trim();


                        return {

                            Nombre:
                                String(
                                    elemento.Nombre ||
                                    "Enlace local"
                                ),

                            ID_Aces_Stream:
                                id,

                            Nota:
                                convertirNota(
                                    elemento.Nota
                                ),

                            URL:
                                elemento.URL
                                    ? String(elemento.URL)
                                    : generarURL(id),

                            local:
                                true,

                            localId:
                                String(
                                    elemento.localId ||
                                    generarIdLocal()
                                )

                        };

                    }
                )
                .filter(
                    elemento =>
                        elemento.ID_Aces_Stream !== ""
                );


    } catch (error) {

        console.error(
            "Error leyendo localStorage:",
            error
        );


        enlacesLocales = [];

    }

}



/* =========================================================
   LOCAL STORAGE - GUARDAR
   ========================================================= */

function guardarEnlacesLocales() {

    try {

        localStorage.setItem(
            CLAVE_LOCAL_STORAGE,
            JSON.stringify(
                enlacesLocales
            )
        );


        return true;


    } catch (error) {

        console.error(
            "Error guardando localStorage:",
            error
        );


        mostrarMensaje(
            "No se pudo guardar el enlace local.",
            "error"
        );


        return false;

    }

}



/* =========================================================
   COMBINAR
   ========================================================= */

function combinarEnlaces() {

    enlacesTodos = [
        ...enlacesJSON,
        ...enlacesLocales
    ];

}



/* =========================================================
   ORDENAR
   ========================================================= */

function ordenarEnlaces() {

    /*
     * La Nota determina la posición.
     *
     * Mayor Nota = primero.
     *
     * Si dos tienen la misma Nota,
     * se mantiene su posición relativa.
     */

    enlacesTodos.sort(
        function (a, b) {

            return (
                convertirNota(b.Nota) -
                convertirNota(a.Nota)
            );

        }
    );

}



/* =========================================================
   FILTRO
   ========================================================= */

function aplicarFiltroActual() {

    const texto =
        buscador.value
            .trim()
            .toLowerCase();


    if (
        texto === ""
    ) {

        enlacesFiltrados =
            [...enlacesTodos];

    } else {

        enlacesFiltrados =
            enlacesTodos.filter(
                function (enlace) {

                    const nombre =
                        String(
                            enlace.Nombre ||
                            ""
                        ).toLowerCase();


                    const id =
                        String(
                            enlace.ID_Aces_Stream ||
                            ""
                        ).toLowerCase();


                    const nota =
                        String(
                            enlace.Nota ??
                            ""
                        ).toLowerCase();


                    const url =
                        String(
                            enlace.URL ||
                            ""
                        ).toLowerCase();


                    return (
                        nombre.includes(texto) ||
                        id.includes(texto) ||
                        nota.includes(texto) ||
                        url.includes(texto)
                    );

                }
            );

    }


    renderizarEnlaces();

}



/* =========================================================
   BUSQUEDA
   ========================================================= */

function aplicarFiltroDesdeBusqueda() {

    limpiarBusqueda.style.display =
        buscador.value.trim()
            ? "block"
            : "none";


    aplicarFiltroActual();

}



/* =========================================================
   LIMPIAR BUSQUEDA
   ========================================================= */

function limpiarBusquedaTexto() {

    buscador.value = "";

    limpiarBusqueda.style.display =
        "none";


    aplicarFiltroActual();

    buscador.focus();

}



/* =========================================================
   RENDERIZAR
   ========================================================= */

function renderizarEnlaces() {

    listaEnlaces.innerHTML = "";


    if (
        enlacesFiltrados.length === 0
    ) {

        sinResultados.classList.remove(
            "oculto"
        );

        return;

    }


    sinResultados.classList.add(
        "oculto"
    );


    enlacesFiltrados.forEach(
        function (enlace) {

            listaEnlaces.appendChild(
                crearTarjeta(enlace)
            );

        }
    );

}



/* =========================================================
   CREAR TARJETA
   ========================================================= */

function crearTarjeta(enlace) {

    const tarjeta =
        document.createElement(
            "article"
        );


    tarjeta.className =
        "tarjeta";


    if (
        enlace.local
    ) {

        tarjeta.classList.add(
            "local"
        );

    }


    const nombre =
        limpiarTexto(
            enlace.Nombre ||
            "Sin nombre"
        );


    const id =
        limpiarTexto(
            enlace.ID_Aces_Stream ||
            ""
        );


    const nota =
        convertirNota(
            enlace.Nota
        );


    const url =
        limpiarTexto(
            enlace.URL ||
            generarURL(id)
        );


    tarjeta.innerHTML = `

        <div class="tarjeta-cabecera">

            <div>

                <h2 class="nombre">
                    ${escaparHTML(nombre)}
                </h2>

                ${
                    enlace.local
                        ? `
                            <span class="indicador-local">
                                LOCAL
                            </span>
                          `
                        : ""
                }

            </div>


            <div class="nota">

                <span class="nota-numero">
                    ${escaparHTML(nota)}
                </span>

                <span class="nota-texto">
                    NOTA
                </span>

            </div>

        </div>


        <div class="informacion">

            <div class="info-linea">

                <span class="info-label">
                    ID ACE STREAM
                </span>

                <span
                    class="info-valor"
                    title="${escaparHTML(id)}"
                >
                    ${escaparHTML(
                        id || "No disponible"
                    )}
                </span>

            </div>


            <div class="info-linea">

                <span class="info-label">
                    URL
                </span>

                <span
                    class="info-valor"
                    title="${escaparHTML(url)}"
                >
                    ${escaparHTML(
                        url || "No disponible"
                    )}
                </span>

            </div>

        </div>


        <div class="botones">

            <button
                type="button"
                class="boton-reproducir"
            >
                ▶ REPRODUCIR
            </button>


            <button
                type="button"
                class="boton-copiar"
                title="Copiar enlace"
            >
                ⧉
            </button>


            ${
                enlace.local
                    ? `
                        <button
                            type="button"
                            class="boton-borrar"
                            title="Borrar enlace local"
                        >
                            🗑
                        </button>
                      `
                    : ""
            }

        </div>

    `;



    /* =====================================================
       REPRODUCIR
       ===================================================== */

    const botonReproducir =
        tarjeta.querySelector(
            ".boton-reproducir"
        );


    botonReproducir.addEventListener(
        "click",
        function () {

            reproducir(url);

        }
    );



    /* =====================================================
       COPIAR
       ===================================================== */

    const botonCopiar =
        tarjeta.querySelector(
            ".boton-copiar"
        );


    botonCopiar.addEventListener(
        "click",
        function () {

            copiarURL(
                url,
                botonCopiar
            );

        }
    );



    /* =====================================================
       BORRAR LOCAL
       ===================================================== */

    if (
        enlace.local
    ) {

        const botonBorrar =
            tarjeta.querySelector(
                ".boton-borrar"
            );


        botonBorrar.addEventListener(
            "click",
            function () {

                borrarEnlaceLocal(
                    enlace.localId
                );

            }
        );

    }


    return tarjeta;

}



/* =========================================================
   BORRAR ENLACE LOCAL
   ========================================================= */

function borrarEnlaceLocal(
    localId
) {

    const enlace =
        enlacesLocales.find(
            function (elemento) {

                return (
                    elemento.localId ===
                    localId
                );

            }
        );


    if (
        !enlace
    ) {

        mostrarMensaje(
            "No se encontró el enlace local.",
            "error"
        );

        return;

    }


    const confirmar =
        window.confirm(
            '¿Quieres borrar el enlace "' +
            enlace.Nombre +
            '"?\n\nEsta acción no se puede deshacer.'
        );


    if (
        !confirmar
    ) {

        return;

    }


    const cantidadAntes =
        enlacesLocales.length;


    enlacesLocales =
        enlacesLocales.filter(
            function (elemento) {

                return (
                    elemento.localId !==
                    localId
                );

            }
        );


    if (
        enlacesLocales.length ===
        cantidadAntes
    ) {

        mostrarMensaje(
            "No se pudo borrar el enlace.",
            "error"
        );

        return;

    }


    const guardado =
        guardarEnlacesLocales();


    if (
        !guardado
    ) {

        return;

    }


    combinarEnlaces();

    ordenarEnlaces();

    actualizarContador();

    aplicarFiltroActual();


    mostrarMensaje(
        "Enlace local eliminado correctamente.",
        "ok"
    );


    setTimeout(
        ocultarMensaje,
        2200
    );

}



/* =========================================================
   REPRODUCIR
   ========================================================= */

function reproducir(url) {

    if (
        !url
    ) {

        mostrarMensaje(
            "Este enlace no contiene una URL válida.",
            "error"
        );

        return;

    }


    try {

        window.location.href =
            url;

    } catch (error) {

        console.error(
            error
        );

        mostrarMensaje(
            "No se pudo abrir el enlace.",
            "error"
        );

    }

}



/* =========================================================
   COPIAR URL
   ========================================================= */

async function copiarURL(
    url,
    boton
) {

    if (
        !url
    ) {

        mostrarMensaje(
            "No existe una URL para copiar.",
            "error"
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            url
        );


        const textoOriginal =
            boton.textContent;


        boton.textContent =
            "✓";


        boton.style.color =
            "#35d07f";


        mostrarMensaje(
            "Enlace copiado al portapapeles.",
            "ok"
        );


        setTimeout(
            function () {

                boton.textContent =
                    textoOriginal;

                boton.style.color =
                    "";

                ocultarMensaje();

            },
            1500
        );


    } catch (error) {

        copiarURLAlternativa(
            url
        );

    }

}



/* =========================================================
   COPIA ALTERNATIVA
   ========================================================= */

function copiarURLAlternativa(
    url
) {

    try {

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            url;


        textarea.style.position =
            "fixed";

        textarea.style.left =
            "-9999px";


        document.body.appendChild(
            textarea
        );


        textarea.focus();

        textarea.select();


        document.execCommand(
            "copy"
        );


        document.body.removeChild(
            textarea
        );


        mostrarMensaje(
            "Enlace copiado al portapapeles.",
            "ok"
        );


    } catch (error) {

        console.error(
            error
        );

        mostrarMensaje(
            "No se pudo copiar el enlace.",
            "error"
        );

    }

}



/* =========================================================
   MODAL - ABRIR
   ========================================================= */

function abrirModal() {

    limpiarFormulario();

    ocultarErrorFormulario();


    modalNuevo.classList.remove(
        "oculto"
    );


    modalNuevo.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";


    actualizarPrevisualizacion();


    setTimeout(
        function () {

            nombreNuevo.focus();

        },
        50
    );

}



/* =========================================================
   MODAL - CERRAR
   ========================================================= */

function cerrarModalNuevo() {

    modalNuevo.classList.add(
        "oculto"
    );


    modalNuevo.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";


    limpiarFormulario();

    ocultarErrorFormulario();

}



/* =========================================================
   LIMPIAR FORMULARIO
   ========================================================= */

function limpiarFormulario() {

    formNuevoEnlace.reset();

    notaNuevo.value =
        "0";

    urlPrevisualizacion.textContent =
        "acestream://";

}



/* =========================================================
   PREVISUALIZAR URL
   ========================================================= */

function actualizarPrevisualizacion() {

    const id =
        idNuevo.value.trim();


    if (
        !id
    ) {

        urlPrevisualizacion.textContent =
            "acestream://";

        return;

    }


    urlPrevisualizacion.textContent =
        generarURL(id);

}



/* =========================================================
   CREAR NUEVO ENLACE
   ========================================================= */

function crearNuevoEnlace(
    evento
) {

    evento.preventDefault();


    ocultarErrorFormulario();


    const nombre =
        nombreNuevo.value.trim();


    const id =
        idNuevo.value.trim();


    const nota =
        convertirNota(
            notaNuevo.value
        );


    /* VALIDAR ID */

    if (
        !id
    ) {

        mostrarErrorFormulario(
            "Debes introducir un ID_Aces_Stream."
        );

        idNuevo.focus();

        return;

    }


    /* VALIDAR CARACTERES */

    if (
        !validarIDAceStream(id)
    ) {

        mostrarErrorFormulario(
            "El ID_Aces_Stream contiene caracteres no válidos."
        );

        idNuevo.focus();

        return;

    }


    /* DUPLICADO */

    const idNormalizado =
        id.toLowerCase();


    const existe =
        enlacesTodos.some(
            function (enlace) {

                return (
                    String(
                        enlace.ID_Aces_Stream ||
                        ""
                    )
                    .trim()
                    .toLowerCase() ===
                    idNormalizado
                );

            }
        );


    if (
        existe
    ) {

        mostrarErrorFormulario(
            "Ese ID_Aces_Stream ya existe en la aplicación."
        );

        idNuevo.focus();

        return;

    }


    /* CREAR */

    const nuevoEnlace = {

        Nombre:
            nombre ||
            "Nuevo enlace",

        ID_Aces_Stream:
            id,

        Nota:
            nota,

        URL:
            generarURL(id),

        local:
            true,

        localId:
            generarIdLocal()

    };


    /* AÑADIR */

    enlacesLocales.push(
        nuevoEnlace
    );


    /* GUARDAR */

    const guardado =
        guardarEnlacesLocales();


    if (
        !guardado
    ) {

        /*
         * Si no se pudo guardar, quitamos también
         * el elemento que acabamos de añadir de memoria.
         */

        enlacesLocales =
            enlacesLocales.filter(
                function (elemento) {

                    return (
                        elemento.localId !==
                        nuevoEnlace.localId
                    );

                }
            );

        return;

    }


    /* ACTUALIZAR */

    combinarEnlaces();

    ordenarEnlaces();

    actualizarContador();

    aplicarFiltroActual();


    /* CERRAR */

    cerrarModalNuevo();


    /* MENSAJE */

    mostrarMensaje(
        "Enlace creado y guardado en este dispositivo.",
        "ok"
    );


    setTimeout(
        ocultarMensaje,
        2200
    );

}



/* =========================================================
   VALIDAR ID
   ========================================================= */

function validarIDAceStream(
    id
) {

    return /^[a-zA-Z0-9_-]+$/.test(
        id
    );

}



/* =========================================================
   GENERAR URL
   ========================================================= */

function generarURL(
    id
) {

    const limpio =
        String(
            id || ""
        ).trim();


    if (
        !limpio
    ) {

        return "acestream://";

    }


    return (
        "acestream://" +
        limpio
    );

}



/* =========================================================
   GENERAR ID LOCAL
   ========================================================= */

function generarIdLocal() {

    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 12)
    );

}



/* =========================================================
   CONVERTIR NOTA
   ========================================================= */

function convertirNota(
    valor
) {

    const numero =
        Number(valor);


    if (
        !Number.isFinite(numero)
    ) {

        return 0;

    }


    return Math.round(
        numero
    );

}



/* =========================================================
   CONTADOR
   ========================================================= */

function actualizarContador() {

    contadorEnlaces.textContent =
        enlacesTodos.length;

}



/* =========================================================
   MENSAJES
   ========================================================= */

function mostrarMensaje(
    texto,
    tipo
) {

    mensaje.textContent =
        texto;


    mensaje.className =
        "mensaje visible " +
        tipo;

}


function ocultarMensaje() {

    mensaje.textContent =
        "";

    mensaje.className =
        "mensaje";

}



/* =========================================================
   ERROR DEL FORMULARIO
   ========================================================= */

function mostrarErrorFormulario(
    texto
) {

    errorFormulario.textContent =
        texto;


    errorFormulario.classList.add(
        "visible"
    );

}


function ocultarErrorFormulario() {

    errorFormulario.textContent =
        "";


    errorFormulario.classList.remove(
        "visible"
    );

}



/* =========================================================
   CARGANDO
   ========================================================= */

function mostrarCargando() {

    listaEnlaces.innerHTML =
        '<div class="cargando">Cargando enlaces...</div>';


    sinResultados.classList.add(
        "oculto"
    );

}



/* =========================================================
   LIMPIAR TEXTO
   ========================================================= */

function limpiarTexto(
    valor
) {

    return String(
        valor
    )
    .replace(
        /\r/g,
        ""
    )
    .replace(
        /\n/g,
        " "
    )
    .trim();

}



/* =========================================================
   ESCAPAR HTML
   ========================================================= */

function escaparHTML(
    texto
) {

    return String(
        texto
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}



/* =========================================================
   INICIO DE SEGURIDAD
   ========================================================= */

window.addEventListener(
    "error",
    function (evento) {

        console.error(
            "Error JavaScript:",
            evento.error
        );

    }
);