/* =========================================================
   GESTOR ACE STREAM
   LÓGICA DE LA APLICACIÓN
   ========================================================= */

"use strict";


/* =========================================================
   VARIABLES
   ========================================================= */

let enlaces = [];

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

const contadorEnlaces =
    document.getElementById("contadorEnlaces");

const mensaje =
    document.getElementById("mensaje");

const sinResultados =
    document.getElementById("sinResultados");

const estadoConexion =
    document.getElementById("estadoConexion");


/* =========================================================
   CARGAR JSON
   ========================================================= */

async function cargarEnlaces() {

    mostrarCargando();

    ocultarMensaje();

    try {

        /*
         * Se añade un parámetro aleatorio para evitar
         * que el navegador utilice una versión antigua
         * del JSON almacenada en caché.
         */

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
                "El formato del JSON no es válido"
            );
        }


        enlaces = datos.filter(
            enlace => {

                return enlace &&
                    typeof enlace === "object";
            }
        );


        enlacesFiltrados =
            [...enlaces];


        actualizarContador();

        renderizarEnlaces();


        estadoConexion.textContent =
            "DATOS ACTUALIZADOS";


        estadoConexion.style.color =
            "#35d07f";


    } catch (error) {

        console.error(error);

        enlaces = [];

        enlacesFiltrados = [];

        actualizarContador();

        listaEnlaces.innerHTML = "";

        sinResultados.classList.add("oculto");

        mostrarMensaje(
            "No se pudo cargar el fichero enlaces.json. " +
            "Comprueba que existe en el mismo directorio que index.html.",
            "error"
        );


        estadoConexion.textContent =
            "ERROR AL CARGAR DATOS";


        estadoConexion.style.color =
            "#ff3b30";
    }
}


/* =========================================================
   MOSTRAR CARGANDO
   ========================================================= */

function mostrarCargando() {

    listaEnlaces.innerHTML =
        '<div class="cargando">Cargando enlaces...</div>';

    sinResultados.classList.add("oculto");
}


/* =========================================================
   RENDERIZAR ENLACES
   ========================================================= */

function renderizarEnlaces() {

    listaEnlaces.innerHTML = "";


    if (enlacesFiltrados.length === 0) {

        sinResultados.classList.remove("oculto");

        return;
    }


    sinResultados.classList.add("oculto");


    enlacesFiltrados.forEach(
        (enlace, indice) => {

            const tarjeta =
                crearTarjeta(
                    enlace,
                    indice
                );

            listaEnlaces.appendChild(
                tarjeta
            );
        }
    );
}


/* =========================================================
   CREAR TARJETA
   ========================================================= */

function crearTarjeta(enlace, indice) {

    const tarjeta =
        document.createElement("article");


    tarjeta.className =
        "tarjeta";


    /* -----------------------------------------------------
       DATOS
       ----------------------------------------------------- */

    const nombre =
        limpiarTexto(
            enlace.Nombre || "Sin nombre"
        );


    const idAce =
        limpiarTexto(
            enlace.ID_Aces_Stream || ""
        );


    const nota =
        limpiarTexto(
            enlace.Nota ?? "-"
        );


    const url =
        limpiarTexto(
            enlace.URL || ""
        );


    /* -----------------------------------------------------
       HTML
       ----------------------------------------------------- */

    tarjeta.innerHTML = `

        <div class="tarjeta-cabecera">

            <h2 class="nombre">
                ${escaparHTML(nombre)}
            </h2>

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
                    title="${escaparHTML(idAce)}">

                    ${escaparHTML(
                        idAce || "No disponible"
                    )}

                </span>

            </div>


            <div class="info-linea">

                <span class="info-label">
                    URL
                </span>

                <span
                    class="info-valor"
                    title="${escaparHTML(url)}">

                    ${escaparHTML(
                        url || "No disponible"
                    )}

                </span>

            </div>

        </div>


        <div class="botones">

            <button
                class="boton-reproducir"
                data-url="${escaparAtributo(url)}">

                ▶ REPRODUCIR

            </button>


            <button
                class="boton-copiar"
                data-url="${escaparAtributo(url)}"
                title="Copiar enlace">

                ⧉

            </button>

        </div>

    `;


    /* -----------------------------------------------------
       BOTON REPRODUCIR
       ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       BOTON COPIAR
       ----------------------------------------------------- */

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
   REPRODUCIR ACE STREAM
   ========================================================= */

function reproducir(url) {

    if (!url) {

        mostrarMensaje(
            "Este enlace no contiene una URL válida.",
            "error"
        );

        return;
    }


    /*
     * Si la URL no empieza por acestream://,
     * intentamos igualmente abrirla como enlace.
     */

    try {

        window.location.href = url;

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "No se pudo abrir el enlace.",
            "error"
        );
    }
}


/* =========================================================
   COPIAR URL
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

        await navigator.clipboard.writeText(url);


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


        /*
         * Método alternativo para navegadores
         * que no permiten Clipboard API.
         */

        try {

            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.value = url;

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


        } catch (error2) {

            mostrarMensaje(
                "No se pudo copiar el enlace.",
                "error"
            );
        }
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
                .trim()
                .toLowerCase();


        limpiarBusqueda.style.display =
            texto
                ? "block"
                : "none";


        if (!texto) {

            enlacesFiltrados =
                [...enlaces];

        } else {

            enlacesFiltrados =
                enlaces.filter(
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
                                enlace.Nota || ""
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
);


/* =========================================================
   LIMPIAR BUSQUEDA
   ========================================================= */

limpiarBusqueda.addEventListener(
    "click",
    () => {

        buscador.value = "";

        limpiarBusqueda.style.display =
            "none";

        enlacesFiltrados =
            [...enlaces];

        renderizarEnlaces();

        buscador.focus();
    }
);


/* =========================================================
   RECARGAR
   ========================================================= */

recargar.addEventListener(
    "click",
    () => {

        cargarEnlaces();
    }
);


/* =========================================================
   CONTADOR
   ========================================================= */

function actualizarContador() {

    contadorEnlaces.textContent =
        enlaces.length;
}


/* =========================================================
   MENSAJES
   ========================================================= */

function mostrarMensaje(texto, tipo) {

    mensaje.textContent =
        texto;

    mensaje.className =
        "mensaje visible " + tipo;
}


function ocultarMensaje() {

    mensaje.textContent = "";

    mensaje.className =
        "mensaje";
}


/* =========================================================
   LIMPIEZA DE TEXTO
   ========================================================= */

function limpiarTexto(valor) {

    return String(valor)
        .replace(/\r/g, "")
        .replace(/\n/g, " ")
        .trim();
}


/* =========================================================
   SEGURIDAD HTML
   ========================================================= */

function escaparHTML(texto) {

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escaparAtributo(texto) {

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
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