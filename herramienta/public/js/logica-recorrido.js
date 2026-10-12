// Lógica de las pantallas del recorrido (U3) que no toca el DOM: textos de los
// estados, del paso actual y de los pasos que faltan, y direcciones de las
// pantallas. Se prueba con `node --test` (tests/u3-recorrido/pantallas.test.js).

/** Texto de cada estado: siempre con palabras, no solo con color (NFR4). */
export const TEXTOS_ESTADO = Object.freeze({ pendiente: "Pendiente", "en-curso": "En curso", completo: "Completo" });

export function textoEstado(estado) {
  return TEXTOS_ESTADO[estado] ?? "Estado desconocido";
}

/** Clase CSS del estado (solo refuerza el texto; nunca lo sustituye). */
export function claseEstado(estado) {
  return Object.hasOwn(TEXTOS_ESTADO, estado) ? `estado estado-${estado}` : "estado";
}

/** Une nombres en español: "A", "A y B", "A, B y C". */
export function unirNombres(nombres) {
  if (nombres.length <= 1) return nombres.join("");
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}

/** "Falta completar: Walking skeleton" para un paso bloqueado; vacío si está habilitado. */
export function textoFaltan(faltan) {
  if (!Array.isArray(faltan) || faltan.length === 0) return "";
  return `Falta completar: ${unirNombres(faltan.map((paso) => paso.nombre))}`;
}

export function textoPasoActual(pasoActual) {
  if (!pasoActual) return "";
  return pasoActual.completo ? "Paso actual: Completo (todos los pasos están en Completo)" : `Paso actual: ${pasoActual.nombre}`;
}

/** Nombre que se muestra del producto: su nombre o, si no lo hay, su identificador. */
export function tituloProducto(vista) {
  return typeof vista?.nombre === "string" && vista.nombre.trim() !== "" ? vista.nombre : `Producto ${vista?.idProducto ?? ""}`.trim();
}

/** Lee producto, paso y registro de la dirección de la página (?producto=...&paso=...). */
export function leerParametros(busqueda) {
  const parametros = new URLSearchParams(busqueda);
  const leer = (nombre) => {
    const valor = parametros.get(nombre);
    return valor === null || valor.trim() === "" ? null : valor;
  };
  return { producto: leer("producto"), paso: leer("paso"), registro: leer("registro") };
}

export function urlRecorrido(producto) {
  return `recorrido.html?${new URLSearchParams({ producto })}`;
}

export function urlPaso(producto, paso) {
  return `paso.html?${new URLSearchParams({ producto, paso })}`;
}

export function urlRegistros(producto, registro) {
  return `registros.html?${new URLSearchParams({ producto, registro })}`;
}

/** Ruta de la API del recorrido de un producto. */
export function rutaApiRecorrido(producto) {
  return `/api/recorridos/${encodeURIComponent(producto)}`;
}
