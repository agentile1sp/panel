// Prueba de humo de U3: el ejecutor de pruebas encuentra los archivos de esta
// unidad y puede importar el modelo del recorrido.

import assert from "node:assert/strict";
import { test } from "node:test";
import { ESTADOS } from "../../src/recorrido/modelo.js";

test("el ejecutor de pruebas de U3 está listo y el modelo se puede importar", () => {
  assert.deepEqual(Object.values(ESTADOS), ["Pendiente", "En curso", "Completo"]);
});
