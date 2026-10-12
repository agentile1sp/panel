// Prueba de humo de U4: el ejecutor de pruebas encuentra los archivos de esta
// unidad y puede importar el punto de entrada del catálogo.

import assert from "node:assert/strict";
import { test } from "node:test";
import { ErrorCatalogo } from "../../src/base/errores.js";
import { ARCHIVO_PRODUCTOS, LONGITUD_MAXIMA_NOMBRE } from "../../src/catalogo/index.js";

test("el ejecutor de pruebas de U4 está listo y el catálogo se puede importar", () => {
  assert.equal(ARCHIVO_PRODUCTOS, "catalogo/productos.json");
  assert.equal(LONGITUD_MAXIMA_NOMBRE, 100);
  const error = new ErrorCatalogo("NO_EXISTE", "No existe el producto.", { estado: 404 });
  assert.equal(error.name, "ErrorCatalogo");
  assert.equal(error.estado, 404);
});
