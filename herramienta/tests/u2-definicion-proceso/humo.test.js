// Prueba de humo de U2: el ejecutor de pruebas funciona, la configuración
// incluye la ubicación de la definición del proceso y de las plantillas, y el
// error de la definición lleva su código, su archivo y sus problemas.

import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import { CARPETA_PLANTILLAS, RUTA_DEFINICION_POR_DEFECTO, leerConfig } from "../../src/base/config.js";
import { ErrorDefinicion } from "../../src/base/errores.js";

test("la configuración apunta a la definición del proceso y a las plantillas, y HERRAMIENTA_DEFINICION la cambia", () => {
  const porDefecto = leerConfig({});
  const cambiada = leerConfig({ HERRAMIENTA_DEFINICION: "otra/definicion.json" });
  const error = new ErrorDefinicion("DEFINICION_NO_VALIDA", "mensaje", { archivo: "/ruta/x.json", problemas: ["uno"] });

  assert.equal(porDefecto.rutaDefinicion, RUTA_DEFINICION_POR_DEFECTO);
  assert.match(porDefecto.rutaDefinicion, /herramienta[\\/]proceso[\\/]definicion-proceso\.json$/);
  assert.equal(porDefecto.carpetaPlantillas, CARPETA_PLANTILLAS);
  assert.match(porDefecto.carpetaPlantillas, /docs[\\/]proceso-producto[\\/]plantillas$/);
  assert.equal(cambiada.rutaDefinicion, path.resolve("otra/definicion.json"));
  assert.equal(leerConfig({ HERRAMIENTA_DEFINICION: "  " }).rutaDefinicion, RUTA_DEFINICION_POR_DEFECTO);
  assert.equal(error.name, "ErrorDefinicion");
  assert.equal(error.codigo, "DEFINICION_NO_VALIDA");
  assert.equal(error.archivo, "/ruta/x.json");
  assert.deepEqual(error.problemas, ["uno"]);
});
