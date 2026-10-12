// Punto de entrada público de U2 · Definición del proceso.
//
// Las demás unidades (la raíz de composición en src/main.js y U3) solo usan lo
// que se exporta aquí:
//   - cargarDefinicion({ rutaDefinicion, carpetaPlantillas }): lee, valida y
//     devuelve la definición de solo lectura, o lanza ErrorDefinicion.
//   - El tipo Definicion (JSDoc) con sus consultas: pasos(), paso(id),
//     registros(), registro(id), origenesDirectos(id) y origenesTodos(id).

export { cargarDefinicion } from "./cargar.js";

/** @typedef {import("./definicion.js").Definicion} Definicion */
/** @typedef {import("./definicion.js").DefinicionPaso} DefinicionPaso */
/** @typedef {import("./definicion.js").DefinicionRegistro} DefinicionRegistro */
/** @typedef {import("./definicion.js").DefinicionElemento} DefinicionElemento */
/** @typedef {import("./definicion.js").DefinicionCampo} DefinicionCampo */
