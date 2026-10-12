// Servicio del recorrido de un producto (U3).
//
// Lee el recorrido, aplica las reglas (reglas.js, sin E/S) y lo guarda con el
// almacén de U1. Todo pasa por el almacén y los adjuntos de U1: cada cambio
// reescribe recorridos/<idProducto>/recorrido.json completo o no lo cambia
// (NFR1), y los errores del almacén se propagan tal cual, nunca se pierden.
//
// Los cambios de un mismo producto se hacen de uno en uno (en serie) para que
// dos peticiones seguidas no se pisen.
//
// Además de lo que usan las rutas, ofrece a U4 las operaciones del catálogo
// (hallazgo R-02): crear, sembrar, borrar, deshacerCreacion, recuperarBorrado,
// confirmarBorrado, existe y pasoActual.

import { randomUUID } from "node:crypto";
import { ErrorRecorrido } from "../base/errores.js";
import { PATRON_ID, completarIdsElementos, crearRecorridoVacio } from "./modelo.js";
import * as reglas from "./reglas.js";

export const CARPETA_RECORRIDOS = "recorridos";
export const ARCHIVO_RECORRIDO = "recorrido.json";
export const CARPETA_ADJUNTOS = "adjuntos";
const PATRON_ID_ADJUNTO = /^[0-9a-f]{16}-[^/\\]+$/;

/**
 * @param {{
 *   almacen: ReturnType<import("../base/almacen.js").crearAlmacen>,
 *   adjuntos: ReturnType<import("../base/adjuntos.js").crearAdjuntos>,
 *   definicion: import("../definicion/index.js").Definicion,
 *   registro?: Pick<Console, "error">,
 *   generarId?: () => string,
 * }} dependencias
 */
export function crearServicioRecorrido({ almacen, adjuntos, definicion, registro = console, generarId = () => randomUUID() }) {
  if (!almacen || !adjuntos || !definicion) {
    throw new TypeError("crearServicioRecorrido necesita el almacén, los adjuntos y la definición del proceso.");
  }
  const enSerie = crearCola();
  const rutas = {
    carpeta: (id) => `${CARPETA_RECORRIDOS}/${id}`,
    archivo: (id) => `${CARPETA_RECORRIDOS}/${id}/${ARCHIVO_RECORRIDO}`,
    adjuntos: (id) => `${CARPETA_RECORRIDOS}/${id}/${CARPETA_ADJUNTOS}`,
  };

  async function leer(idProducto) {
    const datos = await almacen.leer(rutas.archivo(idProducto));
    if (datos === null) throw noExiste(idProducto);
    return reglas.asegurarForma(datos, idProducto, definicion);
  }

  /** Lee, aplica `cambio` (que devuelve { recorrido, ... }) y guarda, en serie por producto. */
  function modificar(idProducto, cambio) {
    exigirId(idProducto);
    return enSerie(idProducto, async () => {
      const actual = await leer(idProducto);
      const resultado = cambio(actual);
      await almacen.guardar(rutas.archivo(idProducto), resultado.recorrido);
      return resultado;
    });
  }

  // --- Consultas -----------------------------------------------------------

  async function existe(idProducto) {
    exigirId(idProducto);
    return almacen.existe(rutas.archivo(idProducto));
  }

  async function obtener(idProducto) {
    exigirId(idProducto);
    return leer(idProducto);
  }

  async function pasoActual(idProducto) {
    return reglas.pasoActual(await obtener(idProducto), definicion);
  }

  // --- Pasos ---------------------------------------------------------------

  async function guardarContenido(idProducto, idPaso, contenido) {
    const { recorrido, anterior } = await modificar(idProducto, (actual) => ({
      recorrido: reglas.guardarContenido(actual, idPaso, completarIdsElementos(contenido, generarId), definicion),
      anterior: actual.pasos[idPaso]?.contenido.evidencia ?? null,
    }));
    await limpiarAdjuntoSustituido(idProducto, anterior, recorrido.pasos[idPaso].contenido.evidencia);
    return recorrido;
  }

  async function cambiarEstado(idProducto, idPaso, estado) {
    const { recorrido } = await modificar(idProducto, (actual) => ({ recorrido: reglas.cambiarEstado(actual, idPaso, estado, definicion) }));
    return recorrido;
  }

  /** Guarda un adjunto en un paso visual habilitado y lo deja como su evidencia (FR4.4). */
  async function subirAdjunto(idProducto, idPaso, nombre, contenido) {
    exigirId(idProducto);
    const { recorrido, anterior } = await enSerie(idProducto, async () => {
      const actual = await leer(idProducto);
      // Comprueba antes de escribir nada que el paso es visual y está habilitado.
      reglas.ponerEvidencia(actual, idPaso, { tipo: "adjunto", idAdjunto: "comprobacion", nombre: "comprobacion" }, definicion);
      const guardado = await adjuntos.guardarAdjunto(rutas.adjuntos(idProducto), nombre, contenido);
      const evidencia = { tipo: "adjunto", idAdjunto: guardado.ruta.split("/").pop(), nombre: guardado.nombre };
      try {
        const nuevo = reglas.ponerEvidencia(actual, idPaso, evidencia, definicion);
        await almacen.guardar(rutas.archivo(idProducto), nuevo);
        return { recorrido: nuevo, anterior: actual.pasos[idPaso].contenido.evidencia };
      } catch (error) {
        await quitarArchivo(guardado.ruta);
        throw error;
      }
    });
    await limpiarAdjuntoSustituido(idProducto, anterior, recorrido.pasos[idPaso].contenido.evidencia);
    return recorrido;
  }

  /** Devuelve { contenido, nombre } del adjunto de un paso. */
  async function leerAdjunto(idProducto, idPaso) {
    const recorrido = await obtener(idProducto);
    const paso = definicion.pasos().find((p) => p.id === idPaso);
    if (paso === undefined) throw new ErrorRecorrido("PASO_DESCONOCIDO", `El paso ${JSON.stringify(idPaso)} no existe en el proceso.`, { estado: 404 });
    const evidencia = recorrido.pasos[idPaso].contenido.evidencia;
    if (evidencia?.tipo !== "adjunto") {
      throw new ErrorRecorrido("SIN_ADJUNTO", `El paso "${paso.nombre}" no tiene ningún archivo adjunto.`, { estado: 404 });
    }
    if (typeof evidencia.idAdjunto !== "string" || !PATRON_ID_ADJUNTO.test(evidencia.idAdjunto)) {
      throw new ErrorRecorrido("RECORRIDO_DANADO", `El adjunto del paso "${paso.nombre}" tiene un identificador no válido en ${rutas.archivo(idProducto)}.`, { estado: 500 });
    }
    const leido = await adjuntos.leerAdjunto(`${rutas.adjuntos(idProducto)}/${evidencia.idAdjunto}`);
    if (leido === null) {
      throw new ErrorRecorrido("ADJUNTO_PERDIDO", `El archivo adjunto "${evidencia.nombre}" del paso "${paso.nombre}" ya no está en la carpeta de datos.`, { estado: 404 });
    }
    return leido;
  }

  // --- Registros transversales (siempre habilitados) ------------------------

  async function anadirEntrada(idProducto, idRegistro, tipo, campos) {
    const { entrada } = await modificar(idProducto, (actual) => reglas.anadirEntrada(actual, { idRegistro, tipo, campos, id: generarId() }, definicion));
    return entrada;
  }

  async function editarEntrada(idProducto, idRegistro, tipo, idEntrada, campos) {
    const { entrada } = await modificar(idProducto, (actual) => reglas.editarEntrada(actual, { idRegistro, tipo, idEntrada, campos }, definicion));
    return entrada;
  }

  async function quitarEntrada(idProducto, idRegistro, tipo, idEntrada) {
    const { entrada } = await modificar(idProducto, (actual) => reglas.quitarEntrada(actual, { idRegistro, tipo, idEntrada }, definicion));
    return entrada;
  }

  // --- Operaciones para U4 (catálogo) ---------------------------------------

  /** Crea el recorrido vacío de un producto nuevo. Devuelve lo necesario para deshacerlo. */
  function crear(idProducto) {
    return guardarNuevo(idProducto, () => crearRecorridoVacio(idProducto, definicion));
  }

  /** Crea el recorrido de un producto de ejemplo con su contenido, respetando la habilitación en cadena. */
  function sembrar(idProducto, datos) {
    return guardarNuevo(idProducto, () => reglas.sembrarRecorrido(idProducto, datos, definicion, { generarId }));
  }

  function guardarNuevo(idProducto, construir) {
    exigirId(idProducto);
    return enSerie(idProducto, async () => {
      if (await almacen.existe(rutas.archivo(idProducto))) {
        throw new ErrorRecorrido("YA_EXISTE", `Ya existe un recorrido para el producto "${idProducto}".`, { estado: 409 });
      }
      const recorrido = construir();
      await almacen.guardar(rutas.archivo(idProducto), recorrido);
      return { idProducto, recorrido };
    });
  }

  /** Deshace crear o sembrar: borra la carpeta del recorrido con todo lo que tenga. */
  function deshacerCreacion(creacion) {
    const idProducto = typeof creacion === "string" ? creacion : creacion?.idProducto;
    exigirId(idProducto);
    return enSerie(idProducto, async () => {
      if (!(await almacen.existe(rutas.carpeta(idProducto)))) return;
      const marca = await almacen.apartar(rutas.carpeta(idProducto));
      await almacen.descartar(marca);
    });
  }

  /** Aparta el recorrido con sus adjuntos y devuelve la marca para recuperarlo o confirmarlo. */
  function borrar(idProducto) {
    exigirId(idProducto);
    return enSerie(idProducto, async () => {
      if (!(await almacen.existe(rutas.archivo(idProducto)))) throw noExiste(idProducto);
      return almacen.apartar(rutas.carpeta(idProducto));
    });
  }

  /** Devuelve a su sitio un recorrido apartado con borrar(). Devuelve el id del producto. */
  async function recuperarBorrado(marca) {
    const idProducto = await idDeMarca(marca);
    await enSerie(idProducto, () => almacen.recuperar(marca));
    return idProducto;
  }

  /** Borra de verdad un recorrido apartado con borrar(). */
  async function confirmarBorrado(marca) {
    const idProducto = await idDeMarca(marca);
    await enSerie(idProducto, () => almacen.descartar(marca));
  }

  // --- Ayudas internas -----------------------------------------------------

  async function idDeMarca(marca) {
    const apartado = (await almacen.listarApartados()).find((a) => a.marca === marca);
    if (apartado === undefined) {
      throw new ErrorRecorrido("MARCA_NO_EXISTE", `No hay ningún recorrido apartado con la marca ${JSON.stringify(marca)}.`, { estado: 404 });
    }
    const tramos = (apartado.ruta ?? "").split("/");
    if (tramos.length !== 2 || tramos[0] !== CARPETA_RECORRIDOS || !PATRON_ID.test(tramos[1])) {
      throw new ErrorRecorrido("MARCA_AJENA", `La marca ${JSON.stringify(marca)} no corresponde a un recorrido.`, { estado: 400 });
    }
    return tramos[1];
  }

  async function limpiarAdjuntoSustituido(idProducto, anterior, actual) {
    if (anterior?.tipo !== "adjunto" || (actual?.tipo === "adjunto" && actual.idAdjunto === anterior.idAdjunto)) return;
    if (!PATRON_ID_ADJUNTO.test(anterior.idAdjunto ?? "")) return;
    await quitarArchivo(`${rutas.adjuntos(idProducto)}/${anterior.idAdjunto}`);
  }

  /** Borra un archivo (adjunto) sin interrumpir la operación: si falla, lo registra en la consola. */
  async function quitarArchivo(ruta) {
    try {
      if (!(await almacen.existe(ruta))) return;
      await almacen.descartar(await almacen.apartar(ruta));
    } catch (error) {
      registro.error(`[recorrido] No se pudo borrar el adjunto que ya no se usa "${ruta}": ${error.message}`);
    }
  }

  return Object.freeze({
    existe,
    obtener,
    pasoActual,
    guardarContenido,
    cambiarEstado,
    subirAdjunto,
    leerAdjunto,
    anadirEntrada,
    editarEntrada,
    quitarEntrada,
    crear,
    sembrar,
    deshacerCreacion,
    borrar,
    recuperarBorrado,
    confirmarBorrado,
  });
}

function exigirId(idProducto) {
  if (typeof idProducto !== "string" || !PATRON_ID.test(idProducto)) {
    throw new ErrorRecorrido(
      "ID_NO_VALIDO",
      `El identificador de producto ${JSON.stringify(idProducto)} no es válido: usa letras, números, guiones o guiones bajos (máximo 64).`,
      { estado: 400 },
    );
  }
}

function noExiste(idProducto) {
  return new ErrorRecorrido("NO_EXISTE", `No existe el recorrido del producto "${idProducto}".`, { estado: 404 });
}

/** Cola por clave: las tareas de una misma clave se ejecutan de una en una, en orden. */
function crearCola() {
  const colas = new Map();
  return function enSerie(clave, tarea) {
    const anterior = colas.get(clave) ?? Promise.resolve();
    // El fallo de la tarea anterior ya lo recibió quien la pidió; aquí solo se espera a que termine.
    const actual = anterior.catch(() => undefined).then(tarea);
    colas.set(clave, actual);
    actual.then(
      () => colas.get(clave) === actual && colas.delete(clave),
      () => colas.get(clave) === actual && colas.delete(clave),
    );
    return actual;
  };
}
