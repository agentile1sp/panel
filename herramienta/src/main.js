// Raíz de composición de la herramienta (pertenece a U1, hallazgo R-01).
//
// Carga y valida la definición del proceso (U2), crea la carpeta de datos, el
// almacén, los adjuntos y el servidor, registra las rutas y arranca. Es el
// único sitio que conoce a todas las unidades:
//   - U2: la definición se carga antes de tocar la carpeta de datos y de crear
//     el servidor. Si falta o no es válida, la herramienta no arranca y el
//     mensaje nombra el archivo y el problema.
//   - U3: el servicio del recorrido se crea con el almacén, los adjuntos y la
//     definición, y sus rutas se registran aquí. El nombre de cada producto
//     llega por el proveedor `nombreDe`, que consulta el catálogo de U4.
//   - U4: el catálogo se crea con el almacén y el servicio del recorrido. Antes
//     de iniciar el servidor se cargan los productos de ejemplo si es la
//     primera apertura (ADR-006); si la carga falla, se deshace, se avisa en la
//     consola y la herramienta arranca igualmente (se reintenta en el próximo
//     arranque). Sus rutas se registran aquí.
//
// Uso: `npm start` dentro de herramienta/ (o `node src/main.js`).

import { constants, realpathSync } from "node:fs";
import { access, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { crearAdjuntos } from "./base/adjuntos.js";
import { CARPETA_APARTADOS, crearAlmacen } from "./base/almacen.js";
import { leerConfig } from "./base/config.js";
import { ErrorArranque } from "./base/errores.js";
import { crearRegistroRutas, crearServidor } from "./base/servidor.js";
import { cargarEjemplosSiPrimeraApertura, crearServicioCatalogo, registrarRutasCatalogo } from "./catalogo/index.js";
import { cargarDefinicion } from "./definicion/index.js";
import { crearServicioRecorrido, registrarRutasRecorrido } from "./recorrido/index.js";

/**
 * Arranca la herramienta y devuelve sus piezas y una función para detenerla.
 * @param {{ entorno?: Record<string, string | undefined>, registro?: Pick<Console, "log" | "warn" | "error"> }} [opciones]
 */
export async function arrancar({ entorno = process.env, registro = console } = {}) {
  const config = leerConfig(entorno);
  // U2: si la definición falta o no es válida, lanza ErrorDefinicion y no se arranca nada.
  const definicion = await cargarDefinicion({ rutaDefinicion: config.rutaDefinicion, carpetaPlantillas: config.carpetaPlantillas });
  await prepararCarpetaDatos(config.carpetaDatos);
  const almacen = crearAlmacen(config.carpetaDatos);
  await avisarApartados(almacen, registro);
  const adjuntos = crearAdjuntos(almacen);

  const recorridos = crearServicioRecorrido({ almacen, adjuntos, definicion, registro });
  const catalogo = crearServicioCatalogo({ almacen, recorridos, registro });
  await cargarEjemplos({ almacen, recorridos, catalogo, registro });

  const rutas = crearRegistroRutas();
  registrarRutasBase(rutas);
  registrarRutasRecorrido(rutas, { servicio: recorridos, definicion, nombreDe: catalogo.nombreDe, registro });
  registrarRutasCatalogo(rutas, { catalogo, registro });

  const servidor = crearServidor({ rutas, carpetaPublica: config.carpetaPublica, host: config.host, registro });
  const { puerto, direccion } = await servidor.iniciar(config.puerto);
  registro.log(`La herramienta está en marcha en ${direccion}`);
  registro.log(`Carpeta de datos: ${config.carpetaDatos}`);
  return { config, definicion, almacen, adjuntos, recorridos, catalogo, rutas, puerto, direccion, detener: () => servidor.detener() };
}

/**
 * Carga los productos de ejemplo si es la primera apertura (U4). No son
 * imprescindibles: si la carga falla, ya se ha deshecho, así que se avisa en la
 * consola y la herramienta arranca sin ellos; se reintenta en el próximo arranque.
 */
async function cargarEjemplos({ almacen, recorridos, catalogo, registro }) {
  try {
    const { cargados } = await cargarEjemplosSiPrimeraApertura({ almacen, recorridos, catalogo, registro });
    if (cargados > 0) registro.log(`Primera apertura: se han cargado ${cargados} productos de ejemplo en el catálogo.`);
  } catch (error) {
    registro.error(
      `No se pudieron cargar los productos de ejemplo: ${error.message}\n` +
        "La herramienta arranca sin ellos; se volverá a intentar en el próximo arranque.",
    );
  }
}

function registrarRutasBase(rutas) {
  // Ruta de comprobación: responde { ok: true } mientras el servidor está en marcha.
  rutas.registrar("GET", "/api/estado", () => undefined);
}

async function prepararCarpetaDatos(carpeta) {
  try {
    await mkdir(carpeta, { recursive: true });
    await access(carpeta, constants.R_OK | constants.W_OK);
  } catch (error) {
    throw new ErrorArranque(
      "CARPETA_DATOS_NO_DISPONIBLE",
      `No se pudo crear o usar la carpeta de datos "${carpeta}": ${error.message}. ` +
        "Revisa los permisos o indica otra carpeta con la variable HERRAMIENTA_DATOS.",
      error,
    );
  }
}

async function avisarApartados(almacen, registro) {
  const apartados = await almacen.listarApartados();
  if (apartados.length === 0) return;
  registro.warn(
    `Aviso: hay ${apartados.length} elemento(s) apartado(s) en ${CARPETA_APARTADOS}/ de la carpeta de datos. ` +
      "Puede que una operación no terminara bien. No se ha perdido nada:",
  );
  for (const { marca, ruta, fecha, error } of apartados) {
    registro.warn(`  - ${marca}: ${ruta ?? "(ruta desconocida)"}${fecha ? ` (apartado el ${fecha})` : ""}${error ? ` [${error}]` : ""}`);
  }
}

function esEjecucionDirecta() {
  if (process.argv[1] === undefined) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false; // argv[1] no es un archivo legible: no se ha lanzado este archivo directamente
  }
}

async function ejecutar() {
  let aplicacion;
  try {
    aplicacion = await arrancar();
  } catch (error) {
    console.error(`No se pudo arrancar la herramienta: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  const parar = () => {
    aplicacion.detener().then(
      () => process.exit(0),
      (error) => {
        console.error(error.message);
        process.exit(1);
      },
    );
  };
  process.once("SIGINT", parar);
  process.once("SIGTERM", parar);
}

if (esEjecucionDirecta()) {
  await ejecutar();
}
