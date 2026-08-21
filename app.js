/* =========================================================
   GESTOR ACE STREAM - V2
   LÓGICA DE LA APLICACIÓN
   ========================================================= */

"use strict";



/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const CLAVE_LOCAL_STORAGE =
    "gestor_ace_stream_enlaces_locales_v2";



/* =========================================================
   VARIABLES
   ========================================================= */

let enlacesJSON = [];

let enlacesLocales = [];

let enlacesTodos = [];

let enlacesFiltrados = [];



/* =========================================================
   ELEMENTOS HTML
   ========================================================= */

const listaEnlaces =
    document.getElementById("listaEnlaces");

const buscador =
    document.getElementById("buscador");

const limpiarBusqueda =
    document.getElementById("limpiarBusqueda");

const recargar =
    document.getElementById("recargar");

const nuevoEnlace =
    document.getElementById("nuevoEnlace");

const contadorEnlaces =
    document.getElementById("contadorEnlaces");

const mensaje =
    document.getElementById("mensaje");

const sinResultados =
    document.getElementById("sinResultados");

const estadoConexion =
    document.getElementById("estadoConexion");



/* MODAL */

const modalNuevo =
    document.getElementById("modalNuevo");

const cerrarModal =
    document.getElementById("cerrarModal");

const cancelarNuevo =
    document.getElementById("cancelarNuevo");

const formNuevoEnlace =
    document.getElementById("formNuevoEnlace");

const nombreNuevo =
    document.getElementById("nombreNuevo");

const idNuevo =
    document.getElementById("idNuevo");

const notaNuevo =
    document.getElementById("notaNuevo");

const urlPrevisualizacion =
    document.getElementById("urlPrevisualizacion");



/* =========================================================
   CARGAR JSON
   ========================================================= */

async function cargarEnlaces() {

    mostrarCargando();

    ocultarMensaje();


    try {

        const cacheBuster =
            "?v=" + Date.now();


        const respuesta =
            await fetch(
                "enlaces.json" + cacheBuster
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo cargar enlaces.json"
            );
        }


        const datos =
            await respuesta.json();


        if (!Array.isArray(datos)) {

            throw new Error(
                "El formato de enlaces.json no es válido."
            );
        }


        enlacesJSON =
            datos
                .filter(
                    enlace =>
                        enlace &&
                        typeof enlace === "object"
                )
                .map(
                    enlace => {

                        return {
                            Nombre:
                                enlace.Nombre || "Sin nombre",

                            ID_Aces_Stream:
                                enlace.ID_Aces_Stream || "",

                            Nota:
                                convertirNota(enlace.Nota),

                            URL:
                                enlace.URL ||
                                generarURL(
                                    enlace.ID_Aces_Stream
                                ),

                            local:
                                false
                        };

                    }
                );


        cargarEnlacesLocales();

        combinarEnlaces();

        ordenarEnlaces();

        actualizarContador();

        aplicarFiltroActual();


        estadoConexion.textContent =
            "DATOS ACTUALIZADOS";

        estadoConexion.style.color =
            "#35d07f";


    } catch (error) {

        console.error(error);


        enlacesJSON = [];

        cargarEnlacesLocales();

        combinarEnlaces();

        ordenarEnlaces();

        actualizarContador();

        aplicarFiltroActual();


        mostrarMensaje(
            "No se pudo cargar enlaces.json. " +
            "Los enlaces guardados localmente siguen disponibles.",
            "error"
        );


        estadoConexion.textContent =
            "DATOS LOCALES";

        estadoConexion.style.color =
            "#ffb347";

    }

}



/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function cargarEnlacesLocales() {

    try {

        const datos =
            localStorage.getItem(
                CLAVE_LOCAL_STORAGE
            );


        if (!datos) {

            enlacesLocales = [];

            return;
        }


        const parseados =
            JSON.parse(datos);


        if (!Array.isArray(parseados)) {

            enlacesLocales = [];

            return;
        }


        enlacesLocales =
            parseados
                .filter(
                    enlace =>
                        enlace &&
                        typeof enlace === "object"
                )
                .map(
                    enlace => {

                        return {
                            Nombre:
                                enlace.Nombre ||
                                "Enlace local",

                            ID_Aces_Stream:
                                enlace.ID_Aces_Stream ||
                                "",

                            Nota:
                                convertirNota(
                                    enlace.Nota
                                ),

                            URL:
                                enlace.URL ||
                                generarURL(
                                    enlace.ID_Aces_Stream
                                ),

                            local:
                                true,

                            localId:
                                enlace.localId ||
                                generarIdLocal()
                        };

                    }
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
   GUARDAR LOCAL STORAGE
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
            "No se pudieron guardar los enlaces locales:",
            error
        );


        mostrarMensaje(
            "No se pudo guardar el enlace en este dispositivo.",
            "error"
        );


        return false;
    }

}



/* =========================================================
   COMBINAR DATOS
   ========================================================= */

function combinarEnlaces() {

    enlacesTodos = [
        ...enlacesJSON,
        ...enlacesLocales
    ];

}



/* =========================================================
   ORDENAR POR NOTA
   ========================================================= */

function ordenarEnlaces() {

    /*
     * Mayor nota primero.
     *
     * En caso de empate se mantiene el orden
     * en el que estaban los elementos.
     */

    enlacesTodos.sort(
        (a, b) => {

            const notaA =
                convertirNota(a.Nota);

            const notaB =
                convertirNota(b.Nota);


            return notaB - notaA;
        }
    );

}



/* =========================================================
   APLICAR FILTRO
   ========================================================= */

function aplicarFiltroActual() {

    const texto =
        buscador.value
            .trim()
            .toLowerCase();


    if (!texto) {

        enlacesFiltrados =
            [...enlacesTodos];

    } else {

        enlacesFiltrados =
            enlacesTodos.filter(
                enlace => {

                    const nombre =
                        String(
                            enlace.Nombre || ""
                        ).toLowerCase();

                    const id =
                        String(
                            enlace.ID_Aces_Stream || ""
                        ).toLowerCase();

                    const nota =
                        String(
                            enlace.Nota ?? ""
                        ).toLowerCase();

                    const url =
                        String(
                            enlace.URL || ""
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
   RENDERIZAR
   ========================================================= */

function renderizarEnlaces() {

    listaEnlaces.innerHTML = "";


    if (enlacesFiltrados.length === 0) {

        sinResultados.classList.remove(
            "oculto"
        );

        return;
    }


    sinResultados.classList.add(
        "oculto"
    );


    enlacesFiltrados.forEach(
        enlace => {

            const tarjeta =
                crearTarjeta(enlace);

            listaEnlaces.appendChild(
                tarjeta
            );

        }
    );

}



/* =========================================================
   CREAR TARJETA
   ========================================================= */

function crearTarjeta(enlace) {

    const tarjeta =
        document.createElement("article");


    tarjeta.className =
        "tarjeta";


    if (enlace.local) {

        tarjeta.classList.add(
            "local"
        );
    }


    const nombre =
        limpiarTexto(
            enlace.Nombre ||
            "Sin nombre"
        );


    const idAce =
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
            generarURL(idAce)
        );



    /* =====================================================
       HTML
       ===================================================== */

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
                    title="${escaparHTML(idAce)}"
                >
                    ${
                        escaparHTML(
                            idAce ||
                            "No disponible"
                        )
                    }
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
                    ${
                        escaparHTML(
                            url ||
                            "No disponible"
                        )
                    }
                </span>

            </div>

        </div>


        <div class="botones">

            <button
                class="boton-reproducir"
                data-url="${escaparAtributo(url)}"
            >
                ▶ REPRODUCIR
            </button>


            <button
                class="boton-copiar"
                data-url="${escaparAtributo(url)}"
                title="Copiar enlace"
            >
                ⧉
            </button>

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
        () => {

            reproducir(
                botonReproducir.dataset.url
            );

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
        () => {

            copiarURL(
                botonCopiar.dataset.url,
                botonCopiar
            );

        }
    );


    return tarjeta;
}



/* =========================================================
   REPRODUCIR
   ========================================================= */

function reproducir(url) {

    if (!url) {

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

        console.error(error);

        mostrarMensaje(
            "No se pudo abrir el enlace.",
            "error"
        );

    }

}



/* =========================================================
   COPIAR
   ========================================================= */

async function copiarURL(url, boton) {

    if (!url) {

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
            () => {

                boton.textContent =
                    textoOriginal;

                boton.style.color =
                    "";

                ocultarMensaje();

            },
            1500
        );


    } catch (error) {

        console.error(error);


        copiarURLAlternativa(
            url
        );

    }

}



/* =========================================================
   COPIA ALTERNATIVA
   ========================================================= */

function copiarURLAlternativa(url) {

    try {

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            url;


        textarea.style.position =
            "fixed";

        textarea.style.opacity =
            "0";


        document.body.appendChild(
            textarea
        );


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

        console.error(error);


        mostrarMensaje(
            "No se pudo copiar el enlace.",
            "error"
        );

    }

}



/* =========================================================
   BUSCADOR
   ========================================================= */

buscador.addEventListener(
    "input",
    () => {

        const texto =
            buscador.value
                .trim();


        limpiarBusqueda.style.display =
            texto
                ? "block"
                : "none";


        aplicarFiltroActual();

    }
);



/* =========================================================
   LIMPIAR BUSQUEDA
   ========================================================= */

limpiarBusqueda.addEventListener(
    "click",
    () => {

        buscador.value =
            "";

        limpiarBusqueda.style.display =
            "none";


        aplicarFiltroActual();


        buscador.focus();

    }
);



/* =========================================================
   BOTON RECARGAR
   ========================================================= */

recargar.addEventListener(
    "click",
    () => {

        cargarEnlaces();

    }
);



/* =========================================================
   MODAL
   ========================================================= */

nuevoEnlace.addEventListener(
    "click",
    () => {

        abrirModal();

    }
);


cerrarModal.addEventListener(
    "click",
    () => {

        cerrarModalNuevo();

    }
);


cancelarNuevo.addEventListener(
    "click",
    () => {

        cerrarModalNuevo();

    }
);



/* =========================================================
   CERRAR MODAL AL PULSAR FUERA
   ========================================================= */

modalNuevo.addEventListener(
    "click",
    evento => {

        if (
            evento.target ===
            modalNuevo
        ) {

            cerrarModalNuevo();

        }

    }
);



/* =========================================================
   ESC PARA CERRAR
   ========================================================= */

document.addEventListener(
    "keydown",
    evento => {

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



/* =========================================================
   ABRIR MODAL
   ========================================================= */

function abrirModal() {

    modalNuevo.classList.remove(
        "oculto"
    );


    formNuevoEnlace.reset();


    notaNuevo.value =
        "0";


    actualizarPrevisualizacion();


    setTimeout(
        () => {

            nombreNuevo.focus();

        },
        100
    );

}



/* =========================================================
   CERRAR MODAL
   ========================================================= */

function cerrarModalNuevo() {

    modalNuevo.classList.add(
        "oculto"
    );


    formNuevoEnlace.reset();


    notaNuevo.value =
        "0";


    actualizarPrevisualizacion();

}



/* =========================================================
   PREVISUALIZACION URL
   ========================================================= */

idNuevo.addEventListener(
    "input",
    actualizarPrevisualizacion
);


function actualizarPrevisualizacion() {

    const id =
        idNuevo.value.trim();


    if (!id) {

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

formNuevoEnlace.addEventListener(
    "submit",
    evento => {

        evento.preventDefault();


        const nombre =
            nombreNuevo.value.trim();


        const id =
            idNuevo.value.trim();


        const nota =
            convertirNota(
                notaNuevo.value
            );


        /* ---------------------------------------------
           VALIDACION ID
           --------------------------------------------- */

        if (!id) {

            mostrarMensajeModal(
                "Debes introducir un ID_Aces_Stream."
            );

            idNuevo.focus();

            return;
        }


        /* ---------------------------------------------
           VALIDAR ID
           --------------------------------------------- */

        if (
            !validarIDAceStream(id)
        ) {

            mostrarMensajeModal(
                "El ID_Aces_Stream contiene caracteres no válidos."
            );

            idNuevo.focus();

            return;
        }


        /* ---------------------------------------------
           COMPROBAR DUPLICADO
           --------------------------------------------- */

        const existe =
            enlacesTodos.some(
                enlace =>
                    String(
                        enlace.ID_Aces_Stream
                    ).toLowerCase() ===
                    id.toLowerCase()
            );


        if (existe) {

            mostrarMensajeModal(
                "Ese ID_Aces_Stream ya existe en la aplicación."
            );

            idNuevo.focus();

            return;
        }


        /* ---------------------------------------------
           CREAR OBJETO
           --------------------------------------------- */

        const nuevo = {

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


        /* ---------------------------------------------
           GUARDAR
           --------------------------------------------- */

        enlacesLocales.push(
            nuevo
        );


        const guardado =
            guardarEnlacesLocales();


        if (!guardado) {

            return;
        }


        /* ---------------------------------------------
           ACTUALIZAR LISTADO
           --------------------------------------------- */

        combinarEnlaces();

        ordenarEnlaces();

        actualizarContador();

        aplicarFiltroActual();


        /* ---------------------------------------------
           CERRAR MODAL
           --------------------------------------------- */

        cerrarModalNuevo();


        mostrarMensaje(
            "Enlace creado y guardado en este dispositivo.",
            "ok"
        );


        setTimeout(
            ocultarMensaje,
            2500
        );

    }
);



/* =========================================================
   VALIDAR ID ACE STREAM
   ========================================================= */

function validarIDAceStream(id) {

    /*
     * Permitimos letras, números y algunos caracteres
     * habituales de identificadores.
     */

    return /^[a-zA-Z0-9_-]+$/.test(
        id
    );

}



/* =========================================================
   GENERAR URL
   ========================================================= */

function generarURL(id) {

    if (!id) {

        return "acestream://";

    }


    return "acestream://" + id;

}



/* =========================================================
   GENERAR ID LOCAL
   ========================================================= */

function generarIdLocal() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}



/* =========================================================
   CONVERTIR NOTA
   ========================================================= */

function convertirNota(valor) {

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
   MENSAJE DEL MODAL
   ========================================================= */

function mostrarMensajeModal(
    texto
) {

    /*
     * Para no complicar el formulario con otro elemento,
     * utilizamos el mensaje general.
     */

    mostrarMensaje(
        texto,
        "error"
    );


    setTimeout(
        ocultarMensaje,
        3500
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

function limpiarTexto(valor) {

    return String(valor)
        .replace(/\r/g, "")
        .replace(/\n/g, " ")
        .trim();

}



/* =========================================================
   ESCAPAR HTML
   ========================================================= */

function escaparHTML(texto) {

    return String(texto)

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
   ESCAPAR ATRIBUTO
   ========================================================= */

function escaparAtributo(texto) {

    return String(texto)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        );

}



/* =========================================================
   INICIO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarEnlaces();

    }
);