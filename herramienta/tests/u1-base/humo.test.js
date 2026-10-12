// Prueba de humo: el ejecutor de pruebas funciona y la configuración carga con
// sus valores por defecto.

import assert from "node:assert/strict";
import { test } from "node:test";
import { CARPETA_DATOS_POR_DEFECTO, leerConfig } from "../../src/base/config.js";

test("la configuración por defecto escucha en 127.0.0.1:3210 y usa herramienta/datos", () => {
  const config = leerConfig({});

  assert.equal(config.host, "127.0.0.1");
  assert.equal(config.puerto, 3210);
  assert.equal(config.carpetaDatos, CARPETA_DATOS_POR_DEFECTO);
  assert.match(config.carpetaDatos, /herramienta[\\/]datos$/);
  assert.throws(() => leerConfig({ PUERTO: "no-es-un-numero" }), /PUERTO/);
});
