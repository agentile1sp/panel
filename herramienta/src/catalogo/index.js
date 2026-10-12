// Punto de entrada público de U4 · Catálogo.
//
// La raíz de composición (src/main.js) y las pruebas solo usan lo que se
// exporta aquí:
//   - crearServicioCatalogo({ almacen, recorridos }): el catálogo de productos
//     (listar, obtener, crear, renombrar, borrar y nombreDe para U3).
//   - cargarEjemplosSiPrimeraApertura({ almacen, recorridos, catalogo }): carga
//     los tres productos ficticios solo en la primera apertura (ADR-006).
//   - registrarRutasCatalogo(rutas, { catalogo }): la API local del catálogo.
//   - validarNombre y nuevoIdProducto: reglas del nombre y del id de un producto.

export { crearServicioCatalogo } from "./servicio.js";
export { cargarEjemplosSiPrimeraApertura, leerEjemplos, RUTA_EJEMPLOS_POR_DEFECTO } from "./ejemplos.js";
export { registrarRutasCatalogo } from "./rutas.js";
export { validarNombre, nuevoIdProducto, LONGITUD_MAXIMA_NOMBRE } from "./nombre.js";
export { ARCHIVO_PRODUCTOS, ARCHIVO_PRIMERA_APERTURA } from "./modelo.js";
