// Prueba de integración del arranque: arrancar, guardar, detener, volver a
// arrancar y leer (FR6.1, AC6.1 a nivel de base), la ruta de estado y el fallo
// claro cuando la carpeta de datos no se puede crear.

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { arrancar } from "../../src/main.js";
import { crearCarpetaTemporal } from "../ayudas/carpeta-temporal.js";
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

test("lo guardado sigue ahí después de detener y volver a arrancar la herramienta", async (t) => {
  const carpetaDatos = await crearCarpetaTemporal(t);
  const entorno = { HERRAMIENTA_DATOS: carpetaDatos, PUERTO: "0" };
  const producto = { nombre: "Producto de prueba", notas: "Con \"comillas\" y\nvarias líneas" };

  const primera = await arrancar({ entorno, registro: crearRegistroDePrueba() });
  try {
    await primera.almacen.guardar("productos/p1/producto.json", producto);
  } finally {
    await primera.detener();
  }

  const segunda = await arrancar({ entorno, registro: crearRegistroDePrueba() });
  t.after(() => segunda.detener());
  assert.deepEqual(await segunda.almacen.leer("productos/p1/producto.json"), producto);
  assert.deepEqual(await segunda.almacen.listar("productos"), [{ nombre: "p1", esCarpeta: true }]);
});

test("GET /api/estado responde { ok: true } tras el arranque y la página inicial está en marcha", async (t) => {
  const carpetaDatos = await crearCarpetaTemporal(t);
  const registro = crearRegistroDePrueba();
  await writeFile(path.join(carpetaDatos, "marcador.txt"), "x");
  const aplicacion = await arrancar({ entorno: { HERRAMIENTA_DATOS: carpetaDatos, PUERTO: "0" }, registro });
  t.after(() => aplicacion.detener());
  const marca = await aplicacion.almacen.apartar("marcador.txt");

  const estado = await fetch(`${aplicacion.direccion}/api/estado`);
  const inicio = await fetch(`${aplicacion.direccion}/`);

  assert.equal(estado.status, 200);
  assert.deepEqual(await estado.json(), { ok: true });
  assert.match(await inicio.text(), /La herramienta está en marcha/);
  assert.match(aplicacion.direccion, /^http:\/\/127\.0\.0\.1:\d+$/);
  assert.ok(registro.mensajes.log.some((m) => m.includes(aplicacion.direccion)), "escribe la dirección local en la consola");

  const otraVez = await arrancar({ entorno: { HERRAMIENTA_DATOS: carpetaDatos, PUERTO: "0" }, registro });
  t.after(() => otraVez.detener());
  assert.ok(registro.mensajes.warn.some((m) => m.includes(marca) && m.includes("marcador.txt")), "avisa de los elementos apartados al arrancar");
});

test("con la carpeta de datos no creable, el arranque falla con mensaje claro y código de salida distinto de cero", async (t) => {
  const base = await crearCarpetaTemporal(t);
  const archivo = path.join(base, "soy-un-archivo.txt");
  await writeFile(archivo, "no soy una carpeta");
  const carpetaImposible = path.join(archivo, "datos");

  await assert.rejects(arrancar({ entorno: { HERRAMIENTA_DATOS: carpetaImposible, PUERTO: "0" }, registro: crearRegistroDePrueba() }), {
    codigo: "CARPETA_DATOS_NO_DISPONIBLE",
  });

  const resultado = await ejecutarMain({ HERRAMIENTA_DATOS: carpetaImposible, PUERTO: "0" });
  assert.notEqual(resultado.codigo, 0);
  assert.match(resultado.errores, /No se pudo arrancar la herramienta: No se pudo crear o usar la carpeta de datos/);
  assert.match(resultado.errores, /HERRAMIENTA_DATOS/);
});
