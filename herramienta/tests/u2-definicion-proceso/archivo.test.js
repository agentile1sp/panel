// Pruebas del archivo de definición del proceso (modelo de datos de U2):
// herramienta/proceso/definicion-proceso.json tiene los 10 pasos y los 2
// registros transversales tal como en la tabla de requirements.md (AC5.1), con
// sus tipos de elemento (hallazgo R-05) y los campos de cada plantilla (FR4.1).
// El archivo solo se lee; los casos de error se prueban en validar.test.js.

import assert from "node:assert/strict";
import { test } from "node:test";
import { leerDefinicionReal } from "../ayudas/definicion-temporal.js";

// Tabla de requirements.md (FR5): orden, id estable, nombre, tipo, orígenes y plantillas.
const TABLA_REQUISITOS = [
  { orden: 1, id: "hipotesis", nombre: "Hipótesis", tipo: "texto", origenes: [], plantillas: ["01-hipotesis.md"] },
  { orden: 2, id: "linea-base", nombre: "Línea base", tipo: "texto", origenes: [1], plantillas: ["02-linea-base.md"] },
  { orden: 3, id: "walking-skeleton", nombre: "Walking skeleton", tipo: "texto", origenes: [1, 2], plantillas: ["03-walking-skeleton.md"] },
  { orden: 4, id: "mapa-de-piezas", nombre: "Mapa de piezas", tipo: "estructurado", origenes: [3], plantillas: ["04-mapa-de-piezas.md"] },
  { orden: 5, id: "fichas", nombre: "Fichas", tipo: "estructurado", origenes: [3, 4], plantillas: ["05a-ficha-capacidad.md", "05b-ficha-instancia.md"] },
  { orden: 6, id: "user-flow", nombre: "User flow", tipo: "visual", origenes: [5], plantillas: ["06-user-flow.md"] },
  { orden: 7, id: "story-map", nombre: "Story map", tipo: "estructurado", origenes: [4, 5, 6], plantillas: ["07-story-map.md"] },
  { orden: 8, id: "wireframes", nombre: "Wireframes", tipo: "visual", origenes: [6, 7], plantillas: ["08-wireframes.md"] },
  { orden: 9, id: "cierre-del-alcance", nombre: "Cierre del alcance", tipo: "estructurado", origenes: [1, 2, 3, 4, 5, 6, 7, 8], plantillas: ["09-cierre-del-alcance.md"] },
  { orden: 10, id: "mockups", nombre: "Mockups", tipo: "visual", origenes: [8, 9], plantillas: ["10-mockups.md"] },
];

const REGISTROS = [
  { id: "acuerdos", nombre: "Acuerdos", plantilla: "transversal-acuerdos.md" },
  { id: "gaps-y-supuestos", nombre: "Gaps y supuestos", plantilla: "transversal-gaps-y-supuestos.md" },
];

function plantillasDelPaso(paso) {
  return [...new Set([paso.plantilla, ...(paso.elementos ?? []).map((e) => e.plantilla)])].sort();
}

test("el archivo real carga y tiene 10 pasos con orden del 1 al 10 y los 2 registros transversales (AC5.1)", async () => {
  const datos = await leerDefinicionReal();

  assert.equal(datos.version, 1);
  assert.equal(datos.pasos.length, 10);
  assert.deepEqual(datos.pasos.map((p) => p.orden).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(
    datos.registros.map(({ id, nombre, plantilla }) => ({ id, nombre, plantilla })),
    REGISTROS,
  );
  assert.deepEqual(datos.registros.find((r) => r.id === "gaps-y-supuestos").elementos.map((e) => e.id), ["gap", "supuesto"]);
  assert.deepEqual(datos.registros.find((r) => r.id === "acuerdos").elementos.map((e) => e.id), ["acuerdo"]);
});

test("orden, nombre, tipo, orígenes y plantilla de cada paso coinciden con la tabla de requirements.md", async () => {
  const datos = await leerDefinicionReal();
  const idPorOrden = new Map(TABLA_REQUISITOS.map((fila) => [fila.orden, fila.id]));

  for (const fila of TABLA_REQUISITOS) {
    const paso = datos.pasos.find((p) => p.orden === fila.orden);
    assert.ok(paso, `existe el paso ${fila.orden}`);
    assert.equal(paso.id, fila.id, `id del paso ${fila.orden}`);
    assert.equal(paso.nombre, fila.nombre, `nombre del paso ${fila.orden}`);
    assert.equal(paso.tipo, fila.tipo, `tipo del paso ${fila.orden}`);
    assert.deepEqual(paso.origenes, fila.origenes.map((orden) => idPorOrden.get(orden)), `orígenes del paso ${fila.orden}`);
    assert.deepEqual(plantillasDelPaso(paso), [...fila.plantillas].sort(), `plantillas del paso ${fila.orden}`);
  }
});

test("el paso 5 tiene fichas de capacidad y de instancia, y el paso 7 tiene historias y las tres tablas (R-05)", async () => {
  const datos = await leerDefinicionReal();
  const fichas = datos.pasos.find((p) => p.id === "fichas");
  const storyMap = datos.pasos.find((p) => p.id === "story-map");

  assert.deepEqual(fichas.elementos.map((e) => e.id), ["ficha-capacidad", "ficha-instancia"]);
  assert.equal(fichas.elementos.find((e) => e.id === "ficha-capacidad").plantilla, "05a-ficha-capacidad.md");
  assert.equal(fichas.elementos.find((e) => e.id === "ficha-instancia").plantilla, "05b-ficha-instancia.md");
  const idsStoryMap = storyMap.elementos.map((e) => e.id);
  for (const id of ["historia", "fila-crud", "fila-estados", "fila-navegacion"]) {
    assert.ok(idsStoryMap.includes(id), `el story map tiene el tipo de elemento "${id}"`);
  }
  const campos = (paso, elemento) => paso.elementos.find((e) => e.id === elemento).campos.map((c) => c.id);
  assert.ok(campos(fichas, "ficha-capacidad").includes("criterios-de-aceptacion"));
  assert.deepEqual(campos(storyMap, "fila-crud"), ["objeto", "crear", "ver", "editar", "borrar", "fuera-a-proposito"]);
  assert.deepEqual(campos(storyMap, "fila-estados"), ["objeto", "estado", "evento", "resultado"]);
  assert.deepEqual(campos(storyMap, "fila-navegacion"), ["pantalla", "accion", "lleva-a"]);
});

test("los pasos visuales tienen checklist y evidencia de enlace o adjunto; los de texto, al menos un campo; los estructurados, tipos de elemento", async () => {
  const datos = await leerDefinicionReal();

  for (const paso of datos.pasos) {
    if (paso.tipo === "visual") {
      assert.ok(Array.isArray(paso.checklist) && paso.checklist.length > 0, `checklist de ${paso.id}`);
      assert.ok(paso.checklist.every((punto) => punto.id && punto.texto), `puntos de checklist completos en ${paso.id}`);
      assert.equal(paso.evidencia, "enlace-o-adjunto", `evidencia de ${paso.id}`);
      assert.equal(paso.elementos, undefined, `${paso.id} no tiene tipos de elemento`);
    } else {
      assert.equal(paso.checklist, undefined, `${paso.id} no tiene checklist`);
    }
    if (paso.tipo === "texto") assert.ok(paso.campos.length > 0, `campos de ${paso.id}`);
    if (paso.tipo === "estructurado") assert.ok(paso.elementos.length > 0, `tipos de elemento de ${paso.id}`);
  }
  assert.deepEqual(
    datos.pasos.find((p) => p.id === "user-flow").checklist.map((punto) => punto.texto),
    [
      "Todo paso termina en una pantalla con nombre, no en un estado.",
      "Cada momento de cada ficha aparece en el flujo.",
      "Hay al menos un flujo de excepción por momento.",
    ],
  );
});
