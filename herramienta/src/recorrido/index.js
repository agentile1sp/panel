// Punto de entrada público de U3 · Recorrido.
//
// La raíz de composición (src/main.js) y U4 solo usan lo que se exporta aquí:
//   - crearServicioRecorrido({ almacen, adjuntos, definicion }): el servicio
//     con las operaciones del recorrido y las que necesita el catálogo (crear,
//     sembrar, borrar, deshacerCreacion, recuperarBorrado, confirmarBorrado,
//     existe y pasoActual).
//   - registrarRutasRecorrido(rutas, { servicio, definicion, nombreDe }): la API local.
//   - ESTADOS: los tres estados de un paso con su texto.

export { crearServicioRecorrido, CARPETA_RECORRIDOS } from "./servicio.js";
export { registrarRutasRecorrido } from "./rutas.js";
export { ESTADOS } from "./modelo.js";
