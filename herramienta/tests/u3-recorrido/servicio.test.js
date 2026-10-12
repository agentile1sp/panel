// Pruebas del servicio del recorrido (U3) sobre una carpeta de datos temporal
// real, con el almacén y los adjuntos de U1: persistencia (AC6.1), paso no
// habilitado, adjuntos, registros (AC3.4), crear y deshacer, borrar y
// recuperar (R-02) y siembra coherente con la habilitación en cadena.

import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { before, test } from "node:test";
import { crearAdjuntos } from "../../src/base/adjuntos.js";
import { crearAlmacen } from "../../src/base/almacen.js";
import { crearServicioRecorrido } from "../../src/recorrido/servicio.js";
import { crearCarpetaTemporal } from "../ayudas/carpeta-temporal.js";
import { IDS_PASOS, cargarDefinicionReal, llevarHasta } from "../ayudas/recorrido.js";
import { crearRegistroDePrueba } from "../ayudas/registro.js";

let definicion;
before(async () => {
  definicion = await cargarDefinicionReal();
});

async function crearServicio(t, carpeta) {
  const carpetaDatos = carpeta ?? (await crearCarpetaTemporal(t, "herramienta-u3-servicio-"));
  const almacen = crearAlmacen(carpetaDatos);
  const registro = crearRegistroDePrueba();
  const servicio = crearServicioRecorrido({ almacen, adjuntos: crearAdjuntos(almacen), definicion, registro });
  return { servicio, almacen, carpetaDatos, registro };
}

const archivoRecorrido = (carpetaDatos, id) => path.join(carpetaDatos, "recorridos", id, "recorrido.json");

test("crear un recorrido, guardar el contenido del paso 2 y leerlo desde un servicio nuevo sobre la misma carpeta devuelve lo mismo (AC6.1)", async (t) => {
  const { servicio, carpetaDatos } = await crearServicio(t);
  await llevarHasta(servicio, "p1", ["hipotesis"]);
  const contenido = { campos: { fecha: "2026-10-12", "como-lo-resuelvo-hoy": ["Con una hoja de cálculo", 'Notas "sueltas"'] } };
  await servicio.guardarContenido("p1", "linea-base", contenido);
  await servicio.cambiarEstado("p1", "linea-base", "en-curso");

  const { servicio: otro } = await crearServicio(t, carpetaDatos);
  const leido = await otro.obtener("p1");

  assert.equal(leido.pasos["linea-base"].estado, "en-curso");
  assert.deepEqual(leido.pasos["linea-base"].contenido.campos["como-lo-resuelvo-hoy"], contenido.campos["como-lo-resuelvo-hoy"]);
  assert.equal(leido.pasos["linea-base"].contenido.campos.fecha, "2026-10-12");
  assert.deepEqual(await otro.pasoActual("p1"), { completo: false, id: "linea-base", nombre: "Línea base" });
  const enDisco = JSON.parse(await readFile(archivoRecorrido(carpetaDatos, "p1"), "utf8"));
  assert.equal(enDisco.idProducto, "p1", "el archivo es JSON legible");
  await assert.rejects(otro.obtener("no-existe"), { codigo: "NO_EXISTE", estado: 404 });
  await assert.rejects(otro.obtener("../fuera"), { codigo: "ID_NO_VALIDO", estado: 400 });
});

test("guardar contenido en un paso no habilitado lanza ErrorRecorrido y no cambia el archivo", async (t) => {
  const { servicio, carpetaDatos } = await crearServicio(t);
  await llevarHasta(servicio, "p1", ["hipotesis", "linea-base"], { "walking-skeleton": "en-curso" });
  const antes = await readFile(archivoRecorrido(carpetaDatos, "p1"), "utf8");

  await assert.rejects(servicio.guardarContenido("p1", "mapa-de-piezas", { campos: { pasada: "1" } }), (error) => {
    assert.equal(error.name, "ErrorRecorrido");
    assert.equal(error.estado, 409);
    assert.deepEqual(error.faltan, [{ id: "walking-skeleton", nombre: "Walking skeleton" }]);
    return true;
  });
  await assert.rejects(servicio.cambiarEstado("p1", "mapa-de-piezas", "completo"), { codigo: "PASO_NO_HABILITADO" });
  await assert.rejects(servicio.guardarContenido("p1", "hipotesis", { campos: { inventado: "x" } }), { codigo: "CONTENIDO_NO_VALIDO" });
  assert.equal(await readFile(archivoRecorrido(carpetaDatos, "p1"), "utf8"), antes, "el archivo no cambia");
});

test("subir un adjunto a un paso visual habilitado lo guarda y deja la evidencia; leerlo devuelve el mismo contenido y el nombre", async (t) => {
  const { servicio, carpetaDatos } = await crearServicio(t);
  await llevarHasta(servicio, "p1", IDS_PASOS.slice(0, 5));
  const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff, 0x10]);

  const recorrido = await servicio.subirAdjunto("p1", "user-flow", "Flujo final.png", bytes);

  const evidencia = recorrido.pasos["user-flow"].contenido.evidencia;
  assert.equal(evidencia.tipo, "adjunto");
  assert.equal(evidencia.nombre, "Flujo final.png");
  const leido = await servicio.leerAdjunto("p1", "user-flow");
  assert.deepEqual(leido, { contenido: bytes, nombre: "Flujo final.png" });
  assert.equal(recorrido.pasos["user-flow"].estado, "pendiente", "subir un adjunto no cambia el estado");

  // Sustituir el adjunto por un enlace borra el archivo que ya no se usa.
  await servicio.guardarContenido("p1", "user-flow", { evidencia: { tipo: "enlace", url: "https://ejemplo.com/flujo" } });
  assert.deepEqual(await readdir(path.join(carpetaDatos, "recorridos", "p1", "adjuntos")), []);
  await assert.rejects(servicio.leerAdjunto("p1", "user-flow"), { codigo: "SIN_ADJUNTO", estado: 404 });
  await assert.rejects(servicio.subirAdjunto("p1", "fichas", "x.png", bytes), { codigo: "PASO_SIN_EVIDENCIA" });
  await assert.rejects(servicio.subirAdjunto("p1", "wireframes", "x.png", bytes), { codigo: "PASO_NO_HABILITADO" });
  await assert.rejects(
    servicio.guardarContenido("p1", "user-flow", { evidencia: { tipo: "adjunto", idAdjunto: "0123456789abcdef-otro.png", nombre: "otro.png" } }),
    { codigo: "ADJUNTO_NO_VALIDO" },
    "no se puede apuntar a un adjunto que el paso no tiene",
  );
});

test("añadir, editar y quitar una entrada de acuerdos funciona en un recorrido recién creado (AC3.4)", async (t) => {
  const { servicio } = await crearServicio(t);
  await servicio.crear("p1");

  const entrada = await servicio.anadirEntrada("p1", "acuerdos", "acuerdo", { codigo: "A1", decision: "Todo se introduce a mano" });
  assert.match(entrada.id, /^[0-9a-f-]{36}$/);
  assert.equal(entrada.campos.decision, "Todo se introduce a mano");
  assert.equal(entrada.campos.motivo, "", "los campos que faltan quedan vacíos");

  const editada = await servicio.editarEntrada("p1", "acuerdos", "acuerdo", entrada.id, { codigo: "A1", decision: "Todo a mano", motivo: "Más sencillo" });
  assert.equal(editada.creadaEn, entrada.creadaEn);
  assert.equal((await servicio.obtener("p1")).registros.acuerdos.acuerdo[0].campos.motivo, "Más sencillo");

  await servicio.quitarEntrada("p1", "acuerdos", "acuerdo", entrada.id);
  assert.deepEqual((await servicio.obtener("p1")).registros.acuerdos.acuerdo, []);
  await assert.rejects(servicio.quitarEntrada("p1", "acuerdos", "acuerdo", entrada.id), { codigo: "ENTRADA_NO_EXISTE", estado: 404 });
  await assert.rejects(servicio.anadirEntrada("p1", "acuerdos", "gap", {}), { codigo: "TIPO_DESCONOCIDO", estado: 404 });
  await assert.rejects(servicio.anadirEntrada("p1", "registro-inventado", "acuerdo", {}), { codigo: "REGISTRO_DESCONOCIDO" });
});

test("crear y luego deshacerCreacion dejan todo como estaba", async (t) => {
  const { servicio, almacen, carpetaDatos } = await crearServicio(t);
  const antes = await readdir(carpetaDatos);

  const creacion = await servicio.crear("p1");
  assert.equal(await servicio.existe("p1"), true);
  await assert.rejects(servicio.crear("p1"), { codigo: "YA_EXISTE", estado: 409 });
  await servicio.deshacerCreacion(creacion);

  assert.equal(await servicio.existe("p1"), false);
  assert.deepEqual(await almacen.listar("recorridos"), []);
  assert.deepEqual(await almacen.listarApartados(), [], "no deja nada apartado");
  assert.deepEqual((await readdir(carpetaDatos)).filter((n) => n !== "recorridos" && n !== ".apartado"), antes);
});

test("borrar aparta el recorrido y sus adjuntos; recuperarBorrado los devuelve y confirmarBorrado los elimina", async (t) => {
  const { servicio, almacen } = await crearServicio(t);
  await llevarHasta(servicio, "p1", IDS_PASOS.slice(0, 5));
  await servicio.subirAdjunto("p1", "user-flow", "flujo.pdf", Buffer.from("%PDF-1.4"));

  const marca = await servicio.borrar("p1");
  assert.equal(await servicio.existe("p1"), false);
  assert.equal((await almacen.listarApartados())[0].ruta, "recorridos/p1");

  assert.equal(await servicio.recuperarBorrado(marca), "p1");
  assert.equal((await servicio.leerAdjunto("p1", "user-flow")).nombre, "flujo.pdf", "vuelve con su adjunto");

  const otraMarca = await servicio.borrar("p1");
  await servicio.confirmarBorrado(otraMarca);
  assert.equal(await servicio.existe("p1"), false);
  assert.deepEqual(await almacen.listarApartados(), []);
  await assert.rejects(servicio.recuperarBorrado(otraMarca), { codigo: "MARCA_NO_EXISTE", estado: 404 });
  await assert.rejects(servicio.borrar("p1"), { codigo: "NO_EXISTE" });
});

test("sembrar respeta la habilitación en cadena: acepta datos coherentes y rechaza un paso Completo con un origen sin completar", async (t) => {
  const { servicio, carpetaDatos } = await crearServicio(t);
  const aMedias = {
    pasos: {
      hipotesis: { estado: "completo", contenido: { campos: { "creo-que": "La persona registrará su agua" } } },
      "linea-base": { estado: "en-curso", contenido: { campos: { creencias: ["Bebo poca agua"] } } },
    },
    registros: { acuerdos: { acuerdo: [{ campos: { codigo: "A1", decision: "Solo web" } }] } },
  };

  const { recorrido } = await servicio.sembrar("ejemplo-1", aMedias);
  assert.equal(recorrido.pasos.hipotesis.estado, "completo");
  assert.deepEqual(recorrido.pasos["linea-base"].contenido.campos.creencias, ["Bebo poca agua"]);
  assert.equal(recorrido.registros.acuerdos.acuerdo.length, 1);
  assert.equal((await servicio.pasoActual("ejemplo-1")).nombre, "Línea base");

  const incoherente = { pasos: { hipotesis: { estado: "en-curso" }, "linea-base": { estado: "completo" } } };
  await assert.rejects(servicio.sembrar("ejemplo-2", incoherente), (error) => {
    assert.equal(error.codigo, "SIEMBRA_INCOHERENTE");
    assert.match(error.message, /"Línea base".*falta completar Hipótesis/);
    return true;
  });
  await assert.rejects(readFile(archivoRecorrido(carpetaDatos, "ejemplo-2")), { code: "ENOENT" }, "no se escribe nada");
  await assert.rejects(servicio.sembrar("ejemplo-3", { pasos: { "paso-inventado": {} } }), { codigo: "SIEMBRA_NO_VALIDA" });
  await assert.rejects(servicio.sembrar("ejemplo-1", {}), { codigo: "YA_EXISTE" });
});
