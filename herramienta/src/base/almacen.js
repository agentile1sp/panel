// Almacén de archivos de la base común (U1).
//
// U1 es la única dueña de la escritura de archivos. Las demás unidades guardan
// y leen a través de este almacén, siempre con rutas relativas a la carpeta de
// datos y separadas por "/" (por ejemplo, "productos/p1/recorrido.json").
//
// Garantías:
// - Escritura completa o nula (NFR1): se escribe un archivo temporal en la misma
//   carpeta, se fuerza a disco (fsync) y se renombra sobre el definitivo. Si
//   algo falla, el archivo anterior queda intacto y se lanza ErrorAlmacen.
// - Ninguna ruta sale de la carpeta de datos: se rechazan rutas absolutas,
//   caracteres de control, barras invertidas y tramos que empiezan por punto
//   (lo que incluye "../" y la carpeta reservada ".apartado").
// - Deshacer para operaciones compuestas (hallazgo R-02):
//   * guardar() y borrar() devuelven el contenido anterior (o null), y
//     restaurar(ruta, anterior) lo vuelve a dejar como estaba.
//   * apartar(ruta) mueve un archivo o carpeta a ".apartado/<marca>/" y
//     devuelve la marca; recuperar(marca) lo devuelve a su sitio y
//     descartar(marca) lo borra de verdad.

import { randomBytes } from "node:crypto";
import { mkdir, open, readFile, readdir, rename, rm, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { ErrorAlmacen } from "./errores.js";

export const CARPETA_APARTADOS = ".apartado";
const FICHA_APARTADO = "apartado.json";
const CONTENIDO_APARTADO = "contenido";
const PATRON_MARCA = /^\d{13,}-[0-9a-f]{8}$/;
const CARACTERES_NO_VALIDOS = /[\u0000-\u001f\u007f\\]/;

/**
 * Crea un almacén sobre una carpeta de datos.
 * @param {string} carpetaDatos ruta absoluta (o relativa a la carpeta actual)
 */
export function crearAlmacen(carpetaDatos) {
  if (typeof carpetaDatos !== "string" || carpetaDatos.trim() === "") {
    throw new ErrorAlmacen("CARPETA_NO_VALIDA", "Falta la carpeta de datos del almacén.");
  }
  const raiz = path.resolve(carpetaDatos);
  const carpetaApartados = path.join(raiz, CARPETA_APARTADOS);
  const resolver = (ruta, opciones) => resolverRuta(raiz, ruta, opciones);

  async function leer(ruta) {
    const texto = await leerTexto(resolver(ruta), ruta);
    return texto === null ? null : interpretarJson(texto, ruta);
  }

  async function guardar(ruta, datos) {
    const destino = resolver(ruta);
    const bytes = Buffer.from(serializar(datos, ruta), "utf8");
    const anterior = await leer(ruta);
    await escribirAtomico(destino, bytes, ruta);
    return anterior;
  }

  async function borrar(ruta) {
    const destino = resolver(ruta);
    const anterior = await leer(ruta);
    await borrarArchivo(destino, ruta);
    return anterior;
  }

  async function restaurar(ruta, anterior) {
    if (anterior === null) {
      await borrarArchivo(resolver(ruta), ruta);
      return;
    }
    await guardar(ruta, anterior);
  }

  async function existe(ruta) {
    return existeRutaAbsoluta(resolver(ruta), ruta);
  }

  async function listar(carpeta = "") {
    const absoluta = resolver(carpeta, { permitirRaiz: true });
    const entradas = await leerCarpeta(absoluta, carpeta);
    return entradas
      .filter((entrada) => !entrada.name.startsWith("."))
      .map((entrada) => ({ nombre: entrada.name, esCarpeta: entrada.isDirectory() }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }

  async function guardarBinario(ruta, contenido) {
    if (!(contenido instanceof Uint8Array)) {
      throw new ErrorAlmacen("DATOS_NO_VALIDOS", `El contenido de "${ruta}" debe ser binario (Buffer).`);
    }
    await escribirAtomico(resolver(ruta), contenido, ruta);
  }

  async function leerBinario(ruta) {
    try {
      return await readFile(resolver(ruta));
    } catch (error) {
      if (noExiste(error)) return null;
      throw errorDeLectura(ruta, error);
    }
  }

  async function apartar(ruta) {
    const origen = resolver(ruta);
    if (!(await existeRutaAbsoluta(origen, ruta))) {
      throw new ErrorAlmacen("NO_EXISTE", `No se puede apartar "${ruta}" porque no existe.`);
    }
    const marca = `${Date.now()}-${randomBytes(4).toString("hex")}`;
    const ficha = { ruta: normalizarRuta(ruta), fecha: new Date().toISOString() };
    await moverAApartados({ carpetaApartados, marca, origen, ficha });
    return marca;
  }

  async function recuperar(marca) {
    const carpetaMarca = resolverMarca(carpetaApartados, marca);
    const ficha = await leerFicha(carpetaMarca, marca);
    const destino = resolver(ficha.ruta);
    if (await existeRutaAbsoluta(destino, ficha.ruta)) {
      throw new ErrorAlmacen(
        "DESTINO_OCUPADO",
        `No se puede recuperar "${ficha.ruta}" porque ya hay algo guardado en esa ruta.`,
      );
    }
    await moverDesdeApartados(carpetaMarca, destino, ficha.ruta);
    await quitarCarpetaMarca(carpetaMarca, marca);
    return ficha.ruta;
  }

  async function descartar(marca) {
    const carpetaMarca = resolverMarca(carpetaApartados, marca);
    if (!(await existeRutaAbsoluta(carpetaMarca, marca))) {
      throw new ErrorAlmacen("NO_EXISTE", `No hay nada apartado con la marca "${marca}".`);
    }
    try {
      await rm(carpetaMarca, { recursive: true });
    } catch (error) {
      throw new ErrorAlmacen("DESCARTE_FALLIDO", `No se pudo borrar lo apartado con la marca "${marca}": ${error.message}`, error);
    }
  }

  async function listarApartados() {
    const entradas = await leerCarpeta(carpetaApartados, CARPETA_APARTADOS);
    const marcas = entradas.filter((e) => e.isDirectory() && PATRON_MARCA.test(e.name)).map((e) => e.name);
    const apartados = await Promise.all(marcas.map((marca) => describirApartado(carpetaApartados, marca)));
    return apartados.sort((a, b) => a.marca.localeCompare(b.marca));
  }

  return Object.freeze({
    carpetaDatos: raiz,
    rutaAbsoluta: (ruta) => resolver(ruta),
    guardar,
    leer,
    borrar,
    restaurar,
    existe,
    listar,
    guardarBinario,
    leerBinario,
    apartar,
    recuperar,
    descartar,
    listarApartados,
  });
}

// ---------------------------------------------------------------------------
// Rutas

function resolverRuta(raiz, ruta, { permitirRaiz = false } = {}) {
  if (typeof ruta !== "string") throw rutaNoValida(ruta, "debe ser un texto");
  if (path.isAbsolute(ruta) || ruta.startsWith("/")) {
    throw rutaNoValida(ruta, "debe ser relativa a la carpeta de datos");
  }
  if (CARACTERES_NO_VALIDOS.test(ruta)) throw rutaNoValida(ruta, "contiene caracteres no permitidos");
  const tramos = ruta.split("/").filter((tramo) => tramo !== "");
  if (tramos.some((tramo) => tramo.startsWith("."))) {
    throw rutaNoValida(ruta, 'ningún tramo puede empezar por punto (por ejemplo, "../")');
  }
  const absoluta = path.resolve(raiz, ...tramos);
  if (!estaDentro(raiz, absoluta)) throw rutaNoValida(ruta, "sale de la carpeta de datos");
  if (absoluta === raiz && !permitirRaiz) throw rutaNoValida(ruta, "está vacía");
  return absoluta;
}

/** Indica si `ruta` es `raiz` o está dentro de ella (comparación de rutas absolutas). */
export function estaDentro(raiz, ruta) {
  const relativa = path.relative(raiz, ruta);
  if (relativa === "") return true;
  return relativa.split(path.sep)[0] !== ".." && !path.isAbsolute(relativa);
}

function normalizarRuta(ruta) {
  return ruta.split("/").filter((tramo) => tramo !== "").join("/");
}

function rutaNoValida(ruta, motivo) {
  return new ErrorAlmacen("RUTA_NO_VALIDA", `La ruta ${JSON.stringify(ruta)} no es válida: ${motivo}.`);
}

function resolverMarca(carpetaApartados, marca) {
  if (typeof marca !== "string" || !PATRON_MARCA.test(marca)) {
    throw new ErrorAlmacen("MARCA_NO_VALIDA", `La marca ${JSON.stringify(marca)} no es una marca de apartado válida.`);
  }
  return path.join(carpetaApartados, marca);
}

function noExiste(error) {
  return error?.code === "ENOENT" || error?.code === "ENOTDIR";
}

// ---------------------------------------------------------------------------
// Lectura

async function leerTexto(absoluta, ruta) {
  try {
    return await readFile(absoluta, "utf8");
  } catch (error) {
    if (noExiste(error)) return null;
    throw errorDeLectura(ruta, error);
  }
}

function interpretarJson(texto, ruta) {
  try {
    return JSON.parse(texto.replace(/^﻿/, ""));
  } catch (error) {
    throw new ErrorAlmacen(
      "ARCHIVO_DANADO",
      `El archivo "${ruta}" está dañado: no contiene JSON válido (${error.message}).`,
      error,
    );
  }
}

async function leerCarpeta(absoluta, ruta) {
  try {
    return await readdir(absoluta, { withFileTypes: true });
  } catch (error) {
    if (noExiste(error)) return [];
    throw errorDeLectura(ruta, error);
  }
}

async function existeRutaAbsoluta(absoluta, ruta) {
  try {
    await stat(absoluta);
    return true;
  } catch (error) {
    if (noExiste(error)) return false;
    throw errorDeLectura(ruta, error);
  }
}

function errorDeLectura(ruta, error) {
  return new ErrorAlmacen("LECTURA_FALLIDA", `No se pudo leer "${ruta}": ${error.message}`, error);
}

// ---------------------------------------------------------------------------
// Escritura

function serializar(datos, ruta) {
  let texto;
  try {
    texto = JSON.stringify(datos, null, 2);
  } catch (error) {
    throw new ErrorAlmacen("DATOS_NO_VALIDOS", `No se pueden guardar los datos de "${ruta}": ${error.message}`, error);
  }
  if (texto === undefined) {
    throw new ErrorAlmacen("DATOS_NO_VALIDOS", `No se pueden guardar los datos de "${ruta}": no son JSON.`);
  }
  return `${texto}\n`;
}

async function escribirAtomico(destino, bytes, ruta) {
  const carpeta = path.dirname(destino);
  const temporal = path.join(carpeta, `.${path.basename(destino)}.${randomBytes(6).toString("hex")}.tmp`);
  try {
    await mkdir(carpeta, { recursive: true });
    await escribirYSincronizar(temporal, bytes);
    await rename(temporal, destino);
  } catch (error) {
    await borrarTemporal(temporal);
    throw new ErrorAlmacen(
      "ESCRITURA_FALLIDA",
      `No se pudo guardar "${ruta}"; se conserva el contenido anterior. Motivo: ${error.message}`,
      error,
    );
  }
}

async function escribirYSincronizar(ruta, bytes) {
  const archivo = await open(ruta, "wx", 0o644);
  try {
    await archivo.writeFile(bytes);
    await archivo.sync();
  } finally {
    await archivo.close();
  }
}

async function borrarTemporal(temporal) {
  try {
    await unlink(temporal);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`[almacen] No se pudo borrar el archivo temporal ${temporal}: ${error.message}`);
    }
  }
}

async function borrarArchivo(absoluta, ruta) {
  try {
    await rm(absoluta);
  } catch (error) {
    if (noExiste(error)) return;
    throw new ErrorAlmacen("BORRADO_FALLIDO", `No se pudo borrar "${ruta}": ${error.message}`, error);
  }
}

// ---------------------------------------------------------------------------
// Apartados

async function moverAApartados({ carpetaApartados, marca, origen, ficha }) {
  const carpetaMarca = path.join(carpetaApartados, marca);
  try {
    await mkdir(carpetaMarca, { recursive: true });
    const bytes = Buffer.from(serializar(ficha, FICHA_APARTADO), "utf8");
    await escribirAtomico(path.join(carpetaMarca, FICHA_APARTADO), bytes, `${CARPETA_APARTADOS}/${marca}/${FICHA_APARTADO}`);
    await rename(origen, path.join(carpetaMarca, CONTENIDO_APARTADO));
  } catch (error) {
    await quitarCarpetaMarca(carpetaMarca, marca);
    if (error instanceof ErrorAlmacen) throw error;
    throw new ErrorAlmacen("APARTADO_FALLIDO", `No se pudo apartar "${ficha.ruta}": ${error.message}`, error);
  }
}

async function moverDesdeApartados(carpetaMarca, destino, ruta) {
  try {
    await mkdir(path.dirname(destino), { recursive: true });
    await rename(path.join(carpetaMarca, CONTENIDO_APARTADO), destino);
  } catch (error) {
    throw new ErrorAlmacen("RECUPERACION_FALLIDA", `No se pudo recuperar "${ruta}": ${error.message}`, error);
  }
}

async function quitarCarpetaMarca(carpetaMarca, marca) {
  try {
    await rm(carpetaMarca, { recursive: true, force: true });
  } catch (error) {
    console.error(`[almacen] No se pudo limpiar ${CARPETA_APARTADOS}/${marca}: ${error.message}`);
  }
}

async function leerFicha(carpetaMarca, marca) {
  const ruta = `${CARPETA_APARTADOS}/${marca}/${FICHA_APARTADO}`;
  const texto = await leerTexto(path.join(carpetaMarca, FICHA_APARTADO), ruta);
  if (texto === null) {
    throw new ErrorAlmacen("NO_EXISTE", `No hay nada apartado con la marca "${marca}".`);
  }
  const ficha = interpretarJson(texto, ruta);
  if (typeof ficha?.ruta !== "string") {
    throw new ErrorAlmacen("ARCHIVO_DANADO", `El archivo "${ruta}" está dañado: no indica la ruta original.`);
  }
  return ficha;
}

async function describirApartado(carpetaApartados, marca) {
  try {
    const ficha = await leerFicha(path.join(carpetaApartados, marca), marca);
    return { marca, ruta: ficha.ruta, fecha: ficha.fecha ?? null };
  } catch (error) {
    return { marca, ruta: null, fecha: null, error: error.message };
  }
}
