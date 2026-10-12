// Lógica de la pantalla de un paso y de la de registros (U3) que no toca el
// DOM: qué control corresponde a cada campo según su tipo, conversión entre
// el formulario y el contenido, y comprobación de enlaces antes de enviar.
// Se prueba con `node --test` (tests/u3-recorrido/pantallas.test.js).
//
// El "formulario" es un objeto con los textos tal como están en los controles:
//   { campos: { <id>: texto }, elementos: { <tipo>: [ { id, campos: { <id>: texto } } ] },
//     checklist: { <id>: true|false }, evidencia: { tipo: "ninguna"|"enlace"|"adjunto", url, adjunto } }

const LONGITUD_MAXIMA_ENLACE = 2048;

/**
 * Control que corresponde a un campo: una línea para "texto", un área de
 * texto para "texto-largo" y un área de texto con una entrada por línea para
 * "lista".
 */
export function controlDeCampo(campo) {
  const ayudaLista = "Escribe una entrada por línea.";
  if (campo.tipo === "lista") {
    return { control: "textarea", filas: 4, esLista: true, etiqueta: campo.nombre, ayuda: [campo.ayuda, ayudaLista].filter(Boolean).join(" ") };
  }
  if (campo.tipo === "texto-largo") {
    return { control: "textarea", filas: 5, esLista: false, etiqueta: campo.nombre, ayuda: campo.ayuda ?? "" };
  }
  return { control: "input", filas: null, esLista: false, etiqueta: campo.nombre, ayuda: campo.ayuda ?? "" };
}

/** Valor guardado → texto del control. */
export function valorAControl(campo, valor) {
  if (campo.tipo === "lista") return Array.isArray(valor) ? valor.join("\n") : "";
  return typeof valor === "string" ? valor : "";
}

/** Texto del control → valor que se guarda (las listas sin líneas vacías). */
export function controlAValor(campo, texto) {
  const valor = typeof texto === "string" ? texto : "";
  if (campo.tipo !== "lista") return valor;
  return valor
    .split("\n")
    .map((linea) => linea.replace(/\r$/, ""))
    .filter((linea) => linea.trim() !== "");
}

export function camposAFormulario(definicionCampos, campos = {}) {
  return Object.fromEntries(definicionCampos.map((campo) => [campo.id, valorAControl(campo, campos[campo.id])]));
}

export function formularioACampos(definicionCampos, textos = {}) {
  return Object.fromEntries(definicionCampos.map((campo) => [campo.id, controlAValor(campo, textos[campo.id])]));
}

/** Contenido guardado de un paso → formulario. */
export function contenidoAFormulario(definicionPaso, contenido = {}) {
  const evidencia = contenido.evidencia ?? null;
  return {
    campos: camposAFormulario(definicionPaso.campos, contenido.campos),
    elementos: Object.fromEntries(
      (definicionPaso.elementos ?? []).map((tipo) => [
        tipo.id,
        (contenido.elementos?.[tipo.id] ?? []).map((elemento) => ({ id: elemento.id ?? null, campos: camposAFormulario(tipo.campos, elemento.campos) })),
      ]),
    ),
    checklist: Object.fromEntries((definicionPaso.checklist ?? []).map((punto) => [punto.id, contenido.checklist?.[punto.id] === true])),
    evidencia: {
      tipo: evidencia?.tipo ?? "ninguna",
      url: evidencia?.tipo === "enlace" ? evidencia.url : "",
      adjunto: evidencia?.tipo === "adjunto" ? { idAdjunto: evidencia.idAdjunto, nombre: evidencia.nombre } : null,
    },
  };
}

/**
 * Formulario → contenido para enviar. Comprueba el enlace antes de enviarlo.
 * @returns {{ contenido: object, problemas: string[] }}
 */
export function formularioAContenido(definicionPaso, formulario) {
  const problemas = [];
  const contenido = {
    campos: formularioACampos(definicionPaso.campos, formulario.campos),
    elementos: Object.fromEntries(
      (definicionPaso.elementos ?? []).map((tipo) => [
        tipo.id,
        (formulario.elementos?.[tipo.id] ?? []).map((elemento) => {
          const campos = formularioACampos(tipo.campos, elemento.campos);
          return elemento.id ? { id: elemento.id, campos } : { campos };
        }),
      ]),
    ),
    checklist: Object.fromEntries((definicionPaso.checklist ?? []).map((punto) => [punto.id, formulario.checklist?.[punto.id] === true])),
    evidencia: null,
  };
  if (definicionPaso.evidencia !== undefined) {
    const { evidencia, problema } = evidenciaDeFormulario(formulario.evidencia);
    contenido.evidencia = evidencia;
    if (problema) problemas.push(problema);
  }
  return { contenido, problemas };
}

/** Comprueba que un enlace es http o https antes de enviarlo (hallazgo R-03). */
export function comprobarEnlace(url) {
  const texto = typeof url === "string" ? url.trim() : "";
  const mal = { valido: false, mensaje: "El enlace debe empezar por http:// o https://." };
  if (texto === "" || texto.length > LONGITUD_MAXIMA_ENLACE) return mal;
  try {
    const { protocol } = new URL(texto);
    return protocol === "http:" || protocol === "https:" ? { valido: true, mensaje: "" } : mal;
  } catch {
    return mal; // no es una URL
  }
}

/** Nombre en minúsculas de un tipo de elemento para los botones ("Añadir ficha de capacidad"). */
export function nombreEnMinusculas(nombre) {
  if (typeof nombre !== "string" || nombre === "") return "";
  const segunda = nombre.charAt(1);
  // Las siglas (por ejemplo, "CRUD") se dejan como están.
  return segunda !== "" && segunda === segunda.toUpperCase() && segunda !== segunda.toLowerCase() ? nombre : nombre.charAt(0).toLowerCase() + nombre.slice(1);
}

function evidenciaDeFormulario(evidencia = {}) {
  if (evidencia.tipo === "enlace") {
    const { valido, mensaje } = comprobarEnlace(evidencia.url);
    return valido ? { evidencia: { tipo: "enlace", url: evidencia.url.trim() } } : { evidencia: null, problema: mensaje };
  }
  if (evidencia.tipo === "adjunto") {
    if (!evidencia.adjunto) return { evidencia: null, problema: "Sube primero el archivo adjunto con el botón \"Subir adjunto\"." };
    return { evidencia: { tipo: "adjunto", idAdjunto: evidencia.adjunto.idAdjunto, nombre: evidencia.adjunto.nombre } };
  }
  return { evidencia: null };
}
