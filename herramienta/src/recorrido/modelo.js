// Modelo del recorrido de un producto (U3).
//
// Funciones puras, sin E/S: crean un recorrido vacío a partir de la definición
// del proceso (U2), dejan el contenido de un paso y las entradas de los
// registros con su forma completa y comprueban que encajan con la definición.
//
// Forma del recorrido (se guarda en recorridos/<idProducto>/recorrido.json):
//   {
//     version: 1,
//     idProducto,
//     pasos: { <idPaso>: { estado, contenido, actualizadoEn } },
//     registros: { <idRegistro>: { <tipoElemento>: [ { id, campos, creadaEn, actualizadaEn } ] } }
//   }
// y el contenido de cada paso:
//   { campos: { <idCampo>: valor }, elementos: { <tipo>: [ { id, campos } ] },
//     checklist: { <idPunto>: true|false }, evidencia: null | { tipo: "enlace", url } | { tipo: "adjunto", idAdjunto, nombre } }
//
// Nada se copia ni se calcula a partir de otro paso (FR4.6, DL-09): cada
// contenido se valida solo contra la definición de su propio paso.

export const VERSION_RECORRIDO = 1;

/** Estados de un paso (FR3.1), con el texto que ve la persona usuaria. */
export const ESTADOS = Object.freeze({ pendiente: "Pendiente", "en-curso": "En curso", completo: "Completo" });
export const ESTADO_INICIAL = "pendiente";
export const ESTADO_COMPLETO = "completo";

/** Ids de producto, de elemento y de entrada: letras, números, guiones y guiones bajos. */
export const PATRON_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;
export const LONGITUD_MAXIMA_ENLACE = 2048;
const CLAVES_CONTENIDO = ["campos", "elementos", "checklist", "evidencia"];

/**
 * Recorrido nuevo: los 10 pasos en Pendiente con el contenido vacío y los
 * registros sin entradas (FR2.2).
 * @param {string} idProducto
 * @param {import("../definicion/index.js").Definicion} definicion
 */
export function crearRecorridoVacio(idProducto, definicion) {
  const pasos = {};
  for (const paso of definicion.pasos()) {
    pasos[paso.id] = { estado: ESTADO_INICIAL, contenido: contenidoVacio(paso), actualizadoEn: null };
  }
  const registros = {};
  for (const registro of definicion.registros()) {
    registros[registro.id] = Object.fromEntries(registro.elementos.map((tipo) => [tipo.id, []]));
  }
  return { version: VERSION_RECORRIDO, idProducto, pasos, registros };
}

/** Contenido vacío de un paso, con todos sus campos, tipos de elemento y casillas. */
export function contenidoVacio(definicionPaso) {
  return {
    campos: camposVacios(definicionPaso.campos),
    elementos: Object.fromEntries((definicionPaso.elementos ?? []).map((tipo) => [tipo.id, []])),
    checklist: Object.fromEntries((definicionPaso.checklist ?? []).map((punto) => [punto.id, false])),
    evidencia: null,
  };
}

/** Indica si un contenido tiene algo escrito, marcado o adjuntado. */
export function tieneContenido(contenido) {
  const conValor = (valor) => (Array.isArray(valor) ? valor.length > 0 : typeof valor === "string" && valor !== "");
  return (
    Object.values(contenido.campos ?? {}).some(conValor) ||
    Object.values(contenido.elementos ?? {}).some((lista) => lista.length > 0) ||
    Object.values(contenido.checklist ?? {}).some((marcado) => marcado === true) ||
    (contenido.evidencia ?? null) !== null
  );
}

/** Indica si un texto es un enlace http o https (hallazgo R-03 de Domain Design). */
export function esEnlaceValido(url) {
  if (typeof url !== "string" || url.length === 0 || url.length > LONGITUD_MAXIMA_ENLACE) return false;
  if (url.trim() !== url) return false;
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false; // no es una URL: se rechaza
  }
}

// ---------------------------------------------------------------------------
// Validación

/**
 * Comprueba que un contenido encaja con la definición de su paso: solo los
 * campos, tipos de elemento y casillas declarados, con su tipo, y enlaces http
 * o https. Devuelve todos los problemas juntos (vacío si es válido).
 * @param {import("../definicion/index.js").DefinicionPaso} definicionPaso
 * @param {unknown} contenido
 * @returns {string[]}
 */
export function validarContenido(definicionPaso, contenido) {
  if (!esObjeto(contenido)) return ["El contenido debe ser un objeto."];
  const problemas = [];
  for (const clave of Object.keys(contenido)) {
    if (!CLAVES_CONTENIDO.includes(clave)) problemas.push(`El contenido tiene una parte desconocida: "${clave}".`);
  }
  if (contenido.campos !== undefined) problemas.push(...validarCampos(definicionPaso.campos, contenido.campos, "el paso"));
  problemas.push(...validarElementos(definicionPaso, contenido.elementos));
  problemas.push(...validarChecklist(definicionPaso, contenido.checklist));
  problemas.push(...validarEvidencia(definicionPaso, contenido.evidencia));
  return problemas;
}

/**
 * Comprueba los campos de una entrada de un registro transversal.
 * @param {import("../definicion/index.js").DefinicionRegistro} definicionRegistro
 * @param {string} tipo id del tipo de elemento (por ejemplo, "acuerdo")
 * @param {unknown} campos
 * @returns {string[]}
 */
export function validarEntrada(definicionRegistro, tipo, campos) {
  const definicionTipo = definicionRegistro.elementos.find((elemento) => elemento.id === tipo);
  if (definicionTipo === undefined) {
    return [`El registro "${definicionRegistro.nombre}" no tiene entradas de tipo "${tipo}".`];
  }
  if (campos === undefined) return [];
  return validarCampos(definicionTipo.campos, campos, `la entrada "${definicionTipo.nombre}"`);
}

function validarCampos(definicionCampos, campos, donde) {
  if (!esObjeto(campos)) return [`Los campos de ${donde} deben ser un objeto.`];
  const problemas = [];
  for (const [id, valor] of Object.entries(campos)) {
    const campo = definicionCampos.find((c) => c.id === id);
    if (campo === undefined) {
      problemas.push(`El campo "${id}" no existe en ${donde}.`);
    } else if (!valorEncaja(campo.tipo, valor)) {
      problemas.push(`El campo "${campo.nombre}" de ${donde} debe ser ${descripcionTipo(campo.tipo)}.`);
    }
  }
  return problemas;
}

function validarElementos(definicionPaso, elementos) {
  if (elementos === undefined) return [];
  if (!esObjeto(elementos)) return ["Los elementos deben ser un objeto con una lista por tipo."];
  const problemas = [];
  for (const [tipo, lista] of Object.entries(elementos)) {
    const definicionTipo = (definicionPaso.elementos ?? []).find((elemento) => elemento.id === tipo);
    if (definicionTipo === undefined) {
      problemas.push(`El paso "${definicionPaso.nombre}" no admite elementos de tipo "${tipo}".`);
    } else if (!Array.isArray(lista)) {
      problemas.push(`Los elementos "${definicionTipo.nombre}" deben ser una lista.`);
    } else {
      problemas.push(...validarListaElementos(definicionTipo, lista));
    }
  }
  return problemas;
}

function validarListaElementos(definicionTipo, lista) {
  const problemas = [];
  const vistos = new Set();
  lista.forEach((elemento, indice) => {
    const donde = `el elemento ${indice + 1} de "${definicionTipo.nombre}"`;
    if (!esObjeto(elemento)) {
      problemas.push(`${mayuscula(donde)} debe ser un objeto con "id" y "campos".`);
      return;
    }
    const extra = Object.keys(elemento).filter((clave) => clave !== "id" && clave !== "campos");
    if (extra.length > 0) problemas.push(`${mayuscula(donde)} tiene partes desconocidas: ${extra.join(", ")}.`);
    if (typeof elemento.id !== "string" || !PATRON_ID.test(elemento.id)) {
      problemas.push(`${mayuscula(donde)} no tiene un id válido.`);
    } else if (vistos.has(elemento.id)) {
      problemas.push(`${mayuscula(donde)} repite el id "${elemento.id}".`);
    }
    vistos.add(elemento.id);
    if (elemento.campos !== undefined) problemas.push(...validarCampos(definicionTipo.campos, elemento.campos, donde));
  });
  return problemas;
}

function validarChecklist(definicionPaso, checklist) {
  if (checklist === undefined) return [];
  if (!esObjeto(checklist)) return ["La checklist debe ser un objeto."];
  const problemas = [];
  for (const [id, marcado] of Object.entries(checklist)) {
    const punto = (definicionPaso.checklist ?? []).find((p) => p.id === id);
    if (punto === undefined) {
      problemas.push(`La casilla "${id}" no existe en la checklist del paso "${definicionPaso.nombre}".`);
    } else if (typeof marcado !== "boolean") {
      problemas.push(`La casilla "${punto.texto}" debe estar marcada o desmarcada (verdadero o falso).`);
    }
  }
  return problemas;
}

function validarEvidencia(definicionPaso, evidencia) {
  if (evidencia === undefined || evidencia === null) return [];
  if (definicionPaso.evidencia === undefined) {
    return [`El paso "${definicionPaso.nombre}" no admite enlace ni adjunto.`];
  }
  if (!esObjeto(evidencia)) return ["La evidencia debe ser un enlace o un adjunto."];
  if (evidencia.tipo === "enlace") {
    return esEnlaceValido(evidencia.url) && soloClaves(evidencia, ["tipo", "url"])
      ? []
      : ["El enlace debe empezar por http:// o https:// y no puede tener espacios al principio ni al final."];
  }
  if (evidencia.tipo === "adjunto") {
    const valido =
      soloClaves(evidencia, ["tipo", "idAdjunto", "nombre"]) &&
      typeof evidencia.idAdjunto === "string" &&
      evidencia.idAdjunto !== "" &&
      typeof evidencia.nombre === "string";
    return valido ? [] : ["El adjunto indicado no es válido."];
  }
  return ['La evidencia debe ser de tipo "enlace" o "adjunto".'];
}

// ---------------------------------------------------------------------------
// Normalización (siempre después de validar)

/**
 * Devuelve el contenido con su forma completa: los campos, tipos de elemento y
 * casillas que falten quedan vacíos. No copia nada de otro paso.
 */
export function normalizarContenido(definicionPaso, contenido) {
  const vacio = contenidoVacio(definicionPaso);
  return {
    campos: normalizarCampos(definicionPaso.campos, contenido.campos),
    elementos: Object.fromEntries(
      (definicionPaso.elementos ?? []).map((tipo) => [
        tipo.id,
        (contenido.elementos?.[tipo.id] ?? []).map((elemento) => ({ id: elemento.id, campos: normalizarCampos(tipo.campos, elemento.campos) })),
      ]),
    ),
    checklist: { ...vacio.checklist, ...(contenido.checklist ?? {}) },
    evidencia: contenido.evidencia ?? null,
  };
}

/** Campos de una entrada de registro con su forma completa. */
export function normalizarCamposEntrada(definicionRegistro, tipo, campos) {
  const definicionTipo = definicionRegistro.elementos.find((elemento) => elemento.id === tipo);
  return normalizarCampos(definicionTipo.campos, campos);
}

/**
 * Pone un id a los elementos que llegan sin él (por ejemplo, los que se acaban
 * de añadir). Devuelve un contenido nuevo; el original no cambia.
 * @param {unknown} contenido
 * @param {() => string} generarId
 */
export function completarIdsElementos(contenido, generarId) {
  if (!esObjeto(contenido) || !esObjeto(contenido.elementos)) return contenido;
  const elementos = {};
  for (const [tipo, lista] of Object.entries(contenido.elementos)) {
    elementos[tipo] = Array.isArray(lista)
      ? lista.map((elemento) => (esObjeto(elemento) && elemento.id === undefined ? { ...elemento, id: generarId() } : elemento))
      : lista;
  }
  return { ...contenido, elementos };
}

function camposVacios(definicionCampos) {
  return Object.fromEntries(definicionCampos.map((campo) => [campo.id, campo.tipo === "lista" ? [] : ""]));
}

function normalizarCampos(definicionCampos, campos = {}) {
  return Object.fromEntries(
    definicionCampos.map((campo) => {
      const valor = campos[campo.id];
      if (valor === undefined) return [campo.id, campo.tipo === "lista" ? [] : ""];
      return [campo.id, Array.isArray(valor) ? [...valor] : valor];
    }),
  );
}

// ---------------------------------------------------------------------------
// Utilidades

function valorEncaja(tipo, valor) {
  if (tipo === "lista") return Array.isArray(valor) && valor.every((linea) => typeof linea === "string");
  return typeof valor === "string";
}

function descripcionTipo(tipo) {
  return tipo === "lista" ? "una lista de textos" : "un texto";
}

/** Indica si un valor es un objeto normal (no null ni lista). */
export function esObjeto(valor) {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function soloClaves(objeto, claves) {
  return Object.keys(objeto).every((clave) => claves.includes(clave));
}

function mayuscula(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
