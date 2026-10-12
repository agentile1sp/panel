// Pruebas de integración del arranque con la definición del proceso (FR5.1,
// hallazgo R-01): con la definición real la herramienta arranca y expone la
// definición; con una definición inválida no arranca, no deja el servidor
// escuchando ni crea la carpeta de datos, y la consola nombra el problema.

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { arrancar } from "../../src/main.js";
import { crearCarpetaTemporal } from "../ayudas/carpeta-temporal.js";
import { escribirDefinicionTemporal, pasoDe } from "../ayudas/definicion-temporal.js";
import { crearRegistroDePrueba } from "../ayudas/registro.js";

const MAIN = fileURLToPath(new URL("../../src/main.js", import.meta.url));

function ejecutarMain(entorno) {
  return new Promise((resolve, reject) => {
    const proceso = spawn(process.execPath, [MAIN], { env: { ...process.env, ...entorno }, stdio: ["ignore", "pipe", "pipe"] });
    let salida = "";
    let errores = "";
    proceso.stdout.on("data", (trozo) => (salida += trozo));
    proceso.stderr.on("data", (trozo) => (errores += trozo));
    const limite = setTimeout(() => proceso.kill("SIGKILL"), 10_000);
    proceso.on("error", reject);
    proceso.on("close", (codigo) => {
      clearTimeout(limite);
      resolve({ codigo, salida, errores });
    });
  });
}

/** Ocupa y libera un puerto libre de 127.0.0.1 para saber qué número usar. */
function puertoLibre() {
  return new Promise((resolve, reject) => {
    const servidor = createServer();
    servidor.once("error", reject);
    servidor.listen(0, "127.0.0.1", () => {
      const { port } = servidor.address();
      servidor.close(() => resolve(port));
    });
  });
}

/** Comprueba que nadie escucha en el puerto ocupándolo un momento. */
function assertPuertoSinUsar(puerto) {
  return new Promise((resolve, reject) => {
    const servidor = createServer();
    servidor.once("error", (error) => reject(new assert.AssertionError({ message: `el puerto ${puerto} sigue ocupado: ${error.code}` })));
    servidor.listen(puerto, "127.0.0.1", () => servidor.close(() => resolve()));
  });
}

test("con la definición real, arrancar() funciona y devuelve la definición con 10 pasos", async (t) => {
  const carpetaDatos = await crearCarpetaTemporal(t);
  const aplicacion = await arrancar({ entorno: { HERRAMIENTA_DATOS: carpetaDatos, PUERTO: "0" }, registro: crearRegistroDePrueba() });
  t.after(() => aplicacion.detener());

  assert.equal(aplicacion.definicion.pasos().length, 10);
  assert.equal(aplicacion.definicion.paso("hipotesis").orden, 1);
  assert.deepEqual(aplicacion.definicion.registros().map((r) => r.id), ["acuerdos", "gaps-y-supuestos"]);
  const estado = await fetch(`${aplicacion.direccion}/api/estado`);
  assert.equal(estado.status, 200);
});

test("con una definición inválida, arrancar() falla nombrando el problema, no deja el servidor escuchando y la ejecución directa termina con código 1", async (t) => {
  const rutaEstropeada = await escribirDefinicionTemporal(t, (datos) => {
    pasoDe(datos, "story-map").origenes = ["mapa-de-piezas", "fichas", "mockups"];
  });
  const base = await crearCarpetaTemporal(t);
  const carpetaDatos = path.join(base, "datos-sin-crear");
  const puerto = await puertoLibre();
  const entorno = { HERRAMIENTA_DATOS: carpetaDatos, PUERTO: String(puerto), HERRAMIENTA_DEFINICION: rutaEstropeada };

  await assert.rejects(arrancar({ entorno, registro: crearRegistroDePrueba() }), (error) => {
    assert.equal(error.name, "ErrorDefinicion");
    assert.equal(error.codigo, "DEFINICION_NO_VALIDA");
    assert.ok(error.message.includes(rutaEstropeada), "nombra el archivo");
    assert.match(error.message, /paso "story-map": el origen "mockups" \(orden 10\) no es anterior al propio paso/);
    return true;
  });
  await assertPuertoSinUsar(puerto);
  await assert.rejects(access(carpetaDatos), { code: "ENOENT" }, "no se llega a crear la carpeta de datos");

  const resultado = await ejecutarMain(entorno);
  assert.equal(resultado.codigo, 1);
  assert.match(resultado.errores, /No se pudo arrancar la herramienta: La definición del proceso/);
  assert.ok(resultado.errores.includes(rutaEstropeada), "la consola nombra el archivo");
  assert.match(resultado.errores, /el origen "mockups"/);
  assert.doesNotMatch(resultado.salida, /está en marcha/);
});
