// Reglas del recorrido de un producto (U3).
//
// Funciones puras, sin E/S: reciben un recorrido y devuelven otro nuevo, sin
// modificar el anterior. Las usa el servicio antes de guardar.
//   - Habilitación en cadena (FR3.3, ADR-004): un paso está habilitado si todos
//     sus orígenes, directos e indirectos (origenesTodos de U2), están en
//     Completo. El paso 1 no tiene orígenes, así que siempre lo está; los
//     registros transversales también (FR2.4).
//   - Paso actual (FR1.2, ADR-007): el primer paso, en orden, que no está en
//     Completo, o "Completo" si lo están todos.
//   - En un paso no habilitado no se edita ni se cambia el estado (FR3.4). Si
//     un origen deja de estar Completo, los dependientes conservan contenido y
//     estado (FR3.5): ninguna regla los toca.
//   - Guardar contenido no cambia el estado (FR4.7) ni ningún otro paso (FR4.6).

import { ErrorRecorrido } from "../base/errores.js";
import {
  ESTADOS,
  ESTADO_COMPLETO,
  ESTADO_INICIAL,
  PATRON_ID,
  completarIdsElementos,
  contenidoVacio,
  crearRecorridoVacio,
  esObjeto,
  normalizarCamposEntrada,
  normalizarContenido,
  tieneContenido,
  validarContenido,
  validarEntrada,
} from "./modelo.js";

export const TEXTO_COMPLETO = "Completo";

// ---------------------------------------------------------------------------
// Consultas

/**
 * Estado de cada paso, en orden: su estado, si está habilitado y qué pasos
 * faltan por completar (id y nombre, en el orden del proceso).
 * @param {object} recorrido
 * @param {import("../definicion/index.js").Definicion} definicion
 */
export function estadoDePasos(recorrido, definicion) {
  return definicion.pasos().map((paso) => {
    const faltan = pasosQueFaltan(recorrido, paso.id, definicion);
    return {
      id: paso.id,
      orden: paso.orden,
      nombre: paso.nombre,
      tipo: paso.tipo,
      estado: estadoDe(recorrido, paso.id),
      habilitado: faltan.length === 0,
      faltan,
    };
  });
}

/**
 * Paso actual: el primero, en orden, que no está en Completo.
 * @returns {{ completo: boolean, id: string | null, nombre: string }}
 */
export function pasoActual(recorrido, definicion) {
  const paso = definicion.pasos().find((p) => estadoDe(recorrido, p.id) !== ESTADO_COMPLETO);
  return paso === undefined ? { completo: true, id: null, nombre: TEXTO_COMPLETO } : { completo: false, id: paso.id, nombre: paso.nombre };
}

/** Une nombres en español: "A", "A y B", "A, B y C". */
export function unirNombres(nombres) {
  if (nombres.length <= 1) return nombres.join("");
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}

// ---------------------------------------------------------------------------
// Cambios en los pasos

/**
 * Cambia el estado de un paso habilitado (FR3.1, FR3.2, FR3.4).
 * @param {string} [ahora] marca de tiempo ISO (por defecto, la actual)
 */
export function cambiarEstado(recorrido, idPaso, estado, definicion, ahora = marcaDeTiempo()) {
  const paso = buscarPaso(definicion, idPaso);
  if (typeof estado !== "string" || !Object.hasOwn(ESTADOS, estado)) {
    throw new ErrorRecorrido(
      "ESTADO_NO_VALIDO",
      `El estado ${JSON.stringify(estado)} no es válido. Los estados son "pendiente" (Pendiente), "en-curso" (En curso) y "completo" (Completo).`,
      { estado: 400 },
    );
  }
  exigirHabilitado(recorrido, paso, definicion, "cambiar el estado");
  const nuevo = structuredClone(recorrido);
  nuevo.pasos[idPaso] = { ...nuevo.pasos[idPaso], estado, actualizadoEn: ahora };
  return nuevo;
}

/**
 * Guarda el contenido de un paso habilitado sin tocar su estado (FR4.7). Un
 * adjunto solo se puede conservar, no inventar: para adjuntar se usa la subida.
 */
export function guardarContenido(recorrido, idPaso, contenido, definicion, ahora = marcaDeTiempo()) {
  const paso = buscarPaso(definicion, idPaso);
  exigirHabilitado(recorrido, paso, definicion, "editar el contenido");
  exigirContenidoValido(paso, contenido);
  const evidencia = conservarAdjunto(recorrido.pasos[idPaso].contenido.evidencia, contenido.evidencia ?? null);
  const nuevo = structuredClone(recorrido);
  const normalizado = normalizarContenido(paso, { ...contenido, evidencia });
  nuevo.pasos[idPaso] = { ...nuevo.pasos[idPaso], contenido: normalizado, actualizadoEn: ahora };
  return nuevo;
}

/** Deja la evidencia (enlace o adjunto recién subido) en un paso visual habilitado. */
export function ponerEvidencia(recorrido, idPaso, evidencia, definicion, ahora = marcaDeTiempo()) {
  const paso = buscarPaso(definicion, idPaso);
  if (paso.evidencia === undefined) {
    throw new ErrorRecorrido("PASO_SIN_EVIDENCIA", `El paso "${paso.nombre}" no admite enlace ni adjunto: solo los pasos visuales.`, { estado: 400 });
  }
  exigirHabilitado(recorrido, paso, definicion, "adjuntar un archivo");
  exigirContenidoValido(paso, { evidencia });
  const nuevo = structuredClone(recorrido);
  nuevo.pasos[idPaso].contenido.evidencia = { ...evidencia };
  nuevo.pasos[idPaso].actualizadoEn = ahora;
  return nuevo;
}

// ---------------------------------------------------------------------------
// Registros transversales (siempre habilitados: FR2.4, FR4.5, AC3.4)

/** @param {{ idRegistro: string, tipo: string, campos: unknown, id: string, ahora?: string }} entrada */
export function anadirEntrada(recorrido, { idRegistro, tipo, campos, id, ahora = marcaDeTiempo() }, definicion) {
  const registro = buscarRegistro(definicion, idRegistro);
  exigirEntradaValida(registro, tipo, campos);
  const nueva = { id, campos: normalizarCamposEntrada(registro, tipo, campos ?? {}), creadaEn: ahora, actualizadaEn: ahora };
  const nuevo = structuredClone(recorrido);
  nuevo.registros[idRegistro][tipo].push(nueva);
  return { recorrido: nuevo, entrada: nueva };
}

/** @param {{ idRegistro: string, tipo: string, idEntrada: string, campos: unknown, ahora?: string }} cambio */
export function editarEntrada(recorrido, { idRegistro, tipo, idEntrada, campos, ahora = marcaDeTiempo() }, definicion) {
  const registro = buscarRegistro(definicion, idRegistro);
  exigirEntradaValida(registro, tipo, campos);
  const nuevo = structuredClone(recorrido);
  const indice = buscarIndiceEntrada(nuevo, registro, tipo, idEntrada);
  const entrada = { ...nuevo.registros[idRegistro][tipo][indice], campos: normalizarCamposEntrada(registro, tipo, campos ?? {}), actualizadaEn: ahora };
  nuevo.registros[idRegistro][tipo][indice] = entrada;
  return { recorrido: nuevo, entrada };
}

/** @param {{ idRegistro: string, tipo: string, idEntrada: string }} cual */
export function quitarEntrada(recorrido, { idRegistro, tipo, idEntrada }, definicion) {
  const registro = buscarRegistro(definicion, idRegistro);
  const tipoValido = validarEntrada(registro, tipo, undefined);
  if (tipoValido.length > 0) throw errorTipoEntrada(tipoValido);
  const nuevo = structuredClone(recorrido);
  const indice = buscarIndiceEntrada(nuevo, registro, tipo, idEntrada);
  const [entrada] = nuevo.registros[idRegistro][tipo].splice(indice, 1);
  return { recorrido: nuevo, entrada };
}

// ---------------------------------------------------------------------------
// Siembra y lectura

/**
 * Construye un recorrido sembrado (productos de ejemplo de U4) y comprueba que
 * respeta la habilitación en cadena: ningún paso con estado distinto de
 * Pendiente o con contenido puede tener orígenes sin completar.
 * @param {{ pasos?: Record<string, { estado?: string, contenido?: object }>, registros?: Record<string, Record<string, { id?: string, campos?: object }[]>> }} datos
 * @param {{ generarId: () => string, ahora?: string }} opciones
 */
export function sembrarRecorrido(idProducto, datos, definicion, { generarId, ahora = marcaDeTiempo() }) {
  if (!esObjeto(datos)) throw errorSiembra(["Los datos de siembra deben ser un objeto con \"pasos\" y \"registros\"."]);
  const recorrido = crearRecorridoVacio(idProducto, definicion);
  const problemas = [...sembrarPasos(recorrido, datos.pasos, definicion, { generarId, ahora }), ...sembrarRegistros(recorrido, datos.registros, definicion, { generarId, ahora })];
  if (problemas.length > 0) throw errorSiembra(problemas);
  const incoherentes = estadoDePasos(recorrido, definicion)
    .filter((paso) => !paso.habilitado && (paso.estado !== ESTADO_INICIAL || tieneContenido(recorrido.pasos[paso.id].contenido)))
    .map((paso) => `El paso "${paso.nombre}" tiene estado o contenido pero no está habilitado: falta completar ${unirNombres(paso.faltan.map((f) => f.nombre))}.`);
  if (incoherentes.length > 0) {
    throw new ErrorRecorrido("SIEMBRA_INCOHERENTE", `Los datos de siembra no respetan la habilitación en cadena:\n  - ${incoherentes.join("\n  - ")}`, {
      estado: 400,
      problemas: incoherentes,
    });
  }
  return recorrido;
}

/**
 * Comprueba la forma de un recorrido leído del disco y completa lo que falte
 * (pasos o registros sin datos). Si el archivo no tiene forma de recorrido,
 * lanza RECORRIDO_DANADO sin tocarlo.
 */
export function asegurarForma(datos, idProducto, definicion) {
  const ruta = `recorridos/${idProducto}/recorrido.json`;
  if (!esObjeto(datos) || !esObjeto(datos.pasos) || (datos.registros !== undefined && !esObjeto(datos.registros))) {
    throw danado(ruta, "no tiene la forma de un recorrido (faltan los pasos o los registros)");
  }
  const vacio = crearRecorridoVacio(idProducto, definicion);
  const pasos = { ...datos.pasos };
  for (const paso of definicion.pasos()) {
    const guardado = datos.pasos[paso.id];
    if (guardado === undefined) {
      pasos[paso.id] = vacio.pasos[paso.id];
      continue;
    }
    if (!esObjeto(guardado) || !Object.hasOwn(ESTADOS, guardado.estado) || !esObjeto(guardado.contenido ?? {})) {
      throw danado(ruta, `el paso "${paso.id}" no tiene un estado o un contenido válidos`);
    }
    pasos[paso.id] = { ...guardado, contenido: { ...contenidoVacio(paso), ...(guardado.contenido ?? {}) }, actualizadoEn: guardado.actualizadoEn ?? null };
  }
  const registros = { ...(datos.registros ?? {}) };
  for (const registro of definicion.registros()) {
    const guardado = esObjeto(registros[registro.id]) ? registros[registro.id] : {};
    registros[registro.id] = { ...guardado };
    for (const tipo of registro.elementos) {
      registros[registro.id][tipo.id] = Array.isArray(guardado[tipo.id]) ? guardado[tipo.id] : [];
    }
  }
  return { ...datos, version: datos.version ?? vacio.version, idProducto, pasos, registros };
}

// ---------------------------------------------------------------------------
// Ayudas internas

function sembrarPasos(recorrido, pasosSemilla, definicion, { generarId, ahora }) {
  if (pasosSemilla === undefined) return [];
  if (!esObjeto(pasosSemilla)) return ['"pasos" debe ser un objeto con un elemento por paso.'];
  const problemas = [];
  for (const [idPaso, semilla] of Object.entries(pasosSemilla)) {
    const paso = definicion.pasos().find((p) => p.id === idPaso);
    if (paso === undefined || !esObjeto(semilla)) {
      problemas.push(paso === undefined ? `El paso "${idPaso}" no existe en la definición del proceso.` : `Los datos del paso "${paso.nombre}" deben ser un objeto.`);
      continue;
    }
    const estado = semilla.estado ?? ESTADO_INICIAL;
    const contenido = completarIdsElementos(semilla.contenido ?? {}, generarId);
    const propios = [
      ...(Object.hasOwn(ESTADOS, estado) ? [] : [`El estado ${JSON.stringify(estado)} del paso "${paso.nombre}" no es válido.`]),
      ...validarContenido(paso, contenido).map((p) => `Paso "${paso.nombre}": ${p}`),
      ...(contenido?.evidencia?.tipo === "adjunto" ? [`Paso "${paso.nombre}": los datos de siembra no pueden traer adjuntos, solo enlaces.`] : []),
    ];
    problemas.push(...propios);
    if (propios.length === 0) recorrido.pasos[idPaso] = { estado, contenido: normalizarContenido(paso, contenido), actualizadoEn: ahora };
  }
  return problemas;
}

function sembrarRegistros(recorrido, registrosSemilla, definicion, { generarId, ahora }) {
  if (registrosSemilla === undefined) return [];
  if (!esObjeto(registrosSemilla)) return ['"registros" debe ser un objeto con un elemento por registro.'];
  const problemas = [];
  for (const [idRegistro, porTipo] of Object.entries(registrosSemilla)) {
    const registro = definicion.registros().find((r) => r.id === idRegistro);
    if (registro === undefined || !esObjeto(porTipo)) {
      problemas.push(registro === undefined ? `El registro "${idRegistro}" no existe en la definición del proceso.` : `Los datos del registro "${registro.nombre}" deben ser un objeto.`);
      continue;
    }
    for (const [tipo, entradas] of Object.entries(porTipo)) {
      const listas = Array.isArray(entradas) ? entradas : null;
      if (listas === null) {
        problemas.push(`Las entradas "${tipo}" del registro "${registro.nombre}" deben ser una lista.`);
        continue;
      }
      for (const entrada of listas) {
        const idNoValido = esObjeto(entrada) && entrada.id !== undefined && !(typeof entrada.id === "string" && PATRON_ID.test(entrada.id));
        const propios = esObjeto(entrada)
          ? [...validarEntrada(registro, tipo, entrada.campos), ...(idNoValido ? [`La entrada ${JSON.stringify(entrada.id)} no tiene un id válido.`] : [])]
          : [`Cada entrada "${tipo}" debe ser un objeto con "campos".`];
        problemas.push(...propios.map((p) => `Registro "${registro.nombre}": ${p}`));
        if (propios.length === 0) {
          const campos = normalizarCamposEntrada(registro, tipo, entrada.campos ?? {});
          recorrido.registros[idRegistro][tipo].push({ id: entrada.id ?? generarId(), campos, creadaEn: ahora, actualizadaEn: ahora });
        }
      }
    }
  }
  return problemas;
}

function estadoDe(recorrido, idPaso) {
  return recorrido.pasos[idPaso]?.estado ?? ESTADO_INICIAL;
}

function pasosQueFaltan(recorrido, idPaso, definicion) {
  return definicion
    .origenesTodos(idPaso)
    .filter((id) => estadoDe(recorrido, id) !== ESTADO_COMPLETO)
    .map((id) => ({ id, nombre: definicion.paso(id).nombre }));
}

function exigirHabilitado(recorrido, paso, definicion, accion) {
  const faltan = pasosQueFaltan(recorrido, paso.id, definicion);
  if (faltan.length === 0) return;
  throw new ErrorRecorrido(
    "PASO_NO_HABILITADO",
    `No se puede ${accion} del paso "${paso.nombre}" porque no está habilitado. Falta completar: ${unirNombres(faltan.map((f) => f.nombre))}.`,
    { estado: 409, faltan },
  );
}

function exigirContenidoValido(paso, contenido) {
  const problemas = validarContenido(paso, contenido);
  if (problemas.length === 0) return;
  throw new ErrorRecorrido("CONTENIDO_NO_VALIDO", `El contenido del paso "${paso.nombre}" no encaja con su plantilla:\n  - ${problemas.join("\n  - ")}`, {
    estado: 400,
    problemas,
  });
}

function conservarAdjunto(actual, nueva) {
  if (nueva?.tipo !== "adjunto") return nueva;
  if (actual?.tipo === "adjunto" && actual.idAdjunto === nueva.idAdjunto) return { ...actual };
  throw new ErrorRecorrido(
    "ADJUNTO_NO_VALIDO",
    'El adjunto indicado no es el que tiene el paso. Para adjuntar un archivo usa "Subir adjunto".',
    { estado: 400, problemas: ["El adjunto indicado no es el que tiene el paso."] },
  );
}

function exigirEntradaValida(registro, tipo, campos) {
  const problemas = validarEntrada(registro, tipo, campos);
  if (problemas.length === 0) return;
  if (!registro.elementos.some((e) => e.id === tipo)) throw errorTipoEntrada(problemas);
  throw new ErrorRecorrido("ENTRADA_NO_VALIDA", `La entrada no encaja con el registro "${registro.nombre}":\n  - ${problemas.join("\n  - ")}`, {
    estado: 400,
    problemas,
  });
}

function errorTipoEntrada(problemas) {
  return new ErrorRecorrido("TIPO_DESCONOCIDO", problemas[0], { estado: 404, problemas });
}

function buscarIndiceEntrada(recorrido, registro, tipo, idEntrada) {
  const indice = recorrido.registros[registro.id][tipo].findIndex((entrada) => entrada.id === idEntrada);
  if (indice === -1) {
    throw new ErrorRecorrido("ENTRADA_NO_EXISTE", `No hay ninguna entrada ${JSON.stringify(idEntrada)} en el registro "${registro.nombre}".`, { estado: 404 });
  }
  return indice;
}

function buscarPaso(definicion, idPaso) {
  const paso = definicion.pasos().find((p) => p.id === idPaso);
  if (paso === undefined) {
    throw new ErrorRecorrido("PASO_DESCONOCIDO", `El paso ${JSON.stringify(idPaso)} no existe en el proceso.`, { estado: 404 });
  }
  return paso;
}

function buscarRegistro(definicion, idRegistro) {
  const registro = definicion.registros().find((r) => r.id === idRegistro);
  if (registro === undefined) {
    throw new ErrorRecorrido("REGISTRO_DESCONOCIDO", `El registro ${JSON.stringify(idRegistro)} no existe en el proceso.`, { estado: 404 });
  }
  return registro;
}

function errorSiembra(problemas) {
  return new ErrorRecorrido("SIEMBRA_NO_VALIDA", `Los datos de siembra no son válidos:\n  - ${problemas.join("\n  - ")}`, { estado: 400, problemas });
}

function danado(ruta, motivo) {
  return new ErrorRecorrido(
    "RECORRIDO_DANADO",
    `El archivo "${ruta}" de la carpeta de datos está dañado: ${motivo}. Revísalo a mano; la herramienta no lo sobrescribe.`,
    { estado: 500 },
  );
}

function marcaDeTiempo() {
  return new Date().toISOString();
}
