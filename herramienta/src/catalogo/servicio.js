// Servicio del catálogo de productos (U4).
//
// Guarda la lista de productos en catalogo/productos.json con el almacén de U1
// y pide a U3 el paso actual de cada uno, sin guardar una copia (ADR-007).
//
// Crear y borrar escriben en dos sitios (el recorrido de U3 y productos.json).
// Si falla la segunda escritura, se deshace la primera y todo queda como
// estaba (Q4 de Units Generation, resuelve R-01 del diseño):
//   - crear:  recorridos.crear(id), después guardar productos.json; si falla,
//             recorridos.deshacerCreacion(...).
//   - borrar: recorridos.borrar(id) (aparta el recorrido), después guardar
//             productos.json; si falla, recorridos.recuperarBorrado(marca); si
//             va bien, recorridos.confirmarBorrado(marca).
// Si el propio deshacer falla, los dos errores se registran en la consola y se
// devuelve el error original (riesgo aceptado R-02: lo apartado sigue en
// .apartado/ y U1 avisa al arrancar).
//
// Las operaciones del catálogo se hacen de una en una (en serie), para que dos
// peticiones seguidas no se pisen. nombreDe solo lee y no espera a la cola.

import { ErrorAlmacen, ErrorCatalogo, ErrorRecorrido } from "../base/errores.js";
import { ARCHIVO_PRODUCTOS, catalogoVacio, leerCatalogo, nuevoProducto } from "./modelo.js";
import { nuevoIdProducto, validarNombre } from "./nombre.js";

const INTENTOS_ID = 10;

/**
 * @param {{
 *   almacen: ReturnType<import("../base/almacen.js").crearAlmacen>,
 *   recorridos: ReturnType<import("../recorrido/index.js").crearServicioRecorrido>,
 *   registro?: Pick<Console, "error">,
 *   generarId?: () => string,
 *   ahora?: () => string,
 * }} dependencias
 */
export function crearServicioCatalogo({ almacen, recorridos, registro = console, generarId = nuevoIdProducto, ahora = () => new Date().toISOString() }) {
  if (!almacen || !recorridos) {
    throw new TypeError("crearServicioCatalogo necesita el almacén y el servicio del recorrido (U3).");
  }
  const enSerie = crearCola();

  async function leerOVacio() {
    return (await leerCatalogo(almacen)) ?? catalogoVacio();
  }

  // --- Consultas -----------------------------------------------------------

  /** Productos en orden de creación, cada uno con su paso actual (FR1.1). */
  function listar() {
    return enSerie(async () => {
      const { productos } = await leerOVacio();
      const resultado = [];
      for (const producto of productos) resultado.push(await conPasoActual(producto));
      return resultado;
    });
  }

  /** Un producto con su paso actual; lanza NO_EXISTE (404) si no está en el catálogo. */
  function obtener(idProducto) {
    return enSerie(async () => {
      const { productos } = await leerOVacio();
      return conPasoActual(productos[buscarIndice(productos, idProducto)]);
    });
  }

  /**
   * Nombre de un producto, o null si no está en el catálogo. Es el proveedor
   * `nombreDe` de las rutas de U3: si el catálogo no se puede leer, lo registra
   * y devuelve null para que el recorrido se siga pudiendo abrir.
   */
  async function nombreDe(idProducto) {
    try {
      const catalogo = await leerCatalogo(almacen);
      return catalogo?.productos.find((p) => p.idProducto === idProducto)?.nombre ?? null;
    } catch (error) {
      registro.error(`[catalogo] No se pudo leer el nombre del producto "${idProducto}": ${error.message}`);
      return null;
    }
  }

  // --- Cambios -------------------------------------------------------------

  /** Crea un producto con su recorrido vacío (FR1.3). */
  async function crear(nombre) {
    const limpio = validarNombre(nombre);
    return enSerie(async () => {
      const catalogo = await leerOVacio();
      const idProducto = await idLibre(catalogo);
      const creacion = await recorridos.crear(idProducto);
      const producto = nuevoProducto(idProducto, limpio, ahora());
      try {
        await almacen.guardar(ARCHIVO_PRODUCTOS, { ...catalogo, productos: [...catalogo.productos, producto] });
      } catch (error) {
        await deshacer(() => recorridos.deshacerCreacion(creacion), error, {
          que: `crear el producto "${limpio}"`,
          consecuencia: `Puede quedar un recorrido sin producto en recorridos/${idProducto}/ de la carpeta de datos.`,
        });
        throw error;
      }
      return conPasoActual(producto);
    });
  }

  /** Cambia el nombre de un producto (FR1.4). */
  async function renombrar(idProducto, nombre) {
    const limpio = validarNombre(nombre);
    return enSerie(async () => {
      const catalogo = await leerOVacio();
      const indice = buscarIndice(catalogo.productos, idProducto);
      const producto = { ...catalogo.productos[indice], nombre: limpio, actualizadoEn: ahora() };
      const productos = catalogo.productos.map((p, i) => (i === indice ? producto : p));
      await almacen.guardar(ARCHIVO_PRODUCTOS, { ...catalogo, productos });
      return conPasoActual(producto);
    });
  }

  /** Borra un producto con su recorrido y todo su contenido (FR1.5). Devuelve el producto borrado. */
  function borrar(idProducto) {
    return enSerie(async () => {
      const catalogo = await leerOVacio();
      const producto = catalogo.productos[buscarIndice(catalogo.productos, idProducto)];
      // Un producto cuyo recorrido ya no existe (por ejemplo, borrado a mano) se quita igualmente del catálogo.
      const marca = (await recorridos.existe(idProducto)) ? await recorridos.borrar(idProducto) : null;
      try {
        await almacen.guardar(ARCHIVO_PRODUCTOS, { ...catalogo, productos: catalogo.productos.filter((p) => p.idProducto !== idProducto) });
      } catch (error) {
        if (marca !== null) {
          await deshacer(() => recorridos.recuperarBorrado(marca), error, {
            que: `borrar el producto "${producto.nombre}"`,
            consecuencia: `Su recorrido sigue apartado en .apartado/${marca}/ de la carpeta de datos y se puede recuperar a mano.`,
          });
        }
        throw error;
      }
      if (marca !== null) await confirmarBorrado(marca, producto);
      return { ...producto };
    });
  }

  /**
   * Ejecuta una tarea en la cola del catálogo, de una en una con las demás
   * operaciones. La usa la carga de los productos de ejemplo (ejemplos.js).
   * @template T
   * @param {() => Promise<T>} tarea
   * @returns {Promise<T>}
   */
  function enExclusiva(tarea) {
    return enSerie(tarea);
  }

  // --- Ayudas internas -----------------------------------------------------

  async function conPasoActual(producto) {
    try {
      return { ...producto, pasoActual: await recorridos.pasoActual(producto.idProducto) };
    } catch (error) {
      if (!(error instanceof ErrorRecorrido) && !(error instanceof ErrorAlmacen)) throw error;
      // El catálogo se sigue mostrando aunque un recorrido falte o esté dañado; el problema queda a la vista y en la consola.
      registro.error(`[catalogo] No se pudo leer el recorrido del producto "${producto.nombre}" (${producto.idProducto}): ${error.message}`);
      return { ...producto, pasoActual: null, problema: error.message };
    }
  }

  async function idLibre(catalogo) {
    for (let intento = 0; intento < INTENTOS_ID; intento += 1) {
      const id = generarId();
      const enCatalogo = catalogo.productos.some((p) => p.idProducto === id);
      if (!enCatalogo && !(await recorridos.existe(id))) return id;
    }
    throw new ErrorCatalogo("ID_NO_DISPONIBLE", "No se pudo generar un identificador libre para el producto. Vuelve a intentarlo.", { estado: 500 });
  }

  async function confirmarBorrado(marca, producto) {
    try {
      await recorridos.confirmarBorrado(marca);
    } catch (error) {
      // El producto ya no está en el catálogo; lo apartado se queda en .apartado/ y U1 avisa al arrancar.
      registro.error(
        `[catalogo] Se borró el producto "${producto.nombre}", pero no se pudo eliminar su recorrido apartado en .apartado/${marca}/: ${error.message}`,
      );
    }
  }

  async function deshacer(accion, original, { que, consecuencia }) {
    try {
      await accion();
    } catch (errorDeshacer) {
      registro.error(`[catalogo] Falló al ${que}: ${original.message}`);
      registro.error(`[catalogo] Y no se pudo deshacer lo que ya se había hecho: ${errorDeshacer.message}. ${consecuencia}`);
    }
  }

  return Object.freeze({ listar, obtener, nombreDe, crear, renombrar, borrar, enExclusiva });
}

function buscarIndice(productos, idProducto) {
  const indice = productos.findIndex((p) => p.idProducto === idProducto);
  if (indice === -1) {
    throw new ErrorCatalogo("NO_EXISTE", `No existe ningún producto con el identificador ${JSON.stringify(idProducto)}.`, { estado: 404 });
  }
  return indice;
}

/** Cola única: las tareas se ejecutan de una en una, en el orden en que llegan. */
function crearCola() {
  let ultima = Promise.resolve();
  return function enSerie(tarea) {
    // El fallo de la tarea anterior ya lo recibió quien la pidió; aquí solo se espera a que termine.
    const actual = ultima.catch(() => undefined).then(tarea);
    ultima = actual;
    return actual;
  };
}
