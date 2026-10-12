// Pruebas de la lectura y la validación de la definición del proceso (FR5.1,
// ADR-003): cada problema impide cargar y el error nombra el archivo y el
// problema. Las copias estropeadas se escriben en carpetas temporales; la
// definición real nunca se modifica.

import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import { CARPETA_PLANTILLAS, RUTA_DEFINICION_POR_DEFECTO } from "../../src/base/config.js";
import { ErrorDefinicion } from "../../src/base/errores.js";
import { cargarDefinicion } from "../../src/definicion/cargar.js";
import { validarDefinicion } from "../../src/definicion/validar.js";
import { crearCarpetaTemporal } from "../ayudas/carpeta-temporal.js";
import { escribirDefinicionTemporal, leerDefinicionReal, pasoDe } from "../ayudas/definicion-temporal.js";

const cargar = (rutaDefinicion) => cargarDefinicion({ rutaDefinicion, carpetaPlantillas: CARPETA_PLANTILLAS });

/** Comprueba que cargar la copia falla con DEFINICION_NO_VALIDA y que el error nombra el archivo y cada problema. */
async function assertRechaza(ruta, ...patrones) {
  const error = await cargar(ruta).then(
    () => assert.fail("la definición debía rechazarse"),
    (e) => e,
  );
  assert.ok(error instanceof ErrorDefinicion, `es un ErrorDefinicion: ${error}`);
  assert.equal(error.codigo, "DEFINICION_NO_VALIDA");
  assert.equal(error.archivo, ruta);
  assert.ok(error.message.includes(ruta), "el mensaje nombra el archivo");
  for (const patron of patrones) {
    assert.match(error.message, patron);
    assert.ok(error.problemas.some((p) => patron.test(p)), `algún problema cumple ${patron}`);
  }
  return error;
}

test("la definición real pasa la validación sin problemas y se carga", async () => {
  const datos = await leerDefinicionReal();
  const plantillas = new Set(["01-hipotesis.md"]);

  await assert.doesNotReject(cargar(RUTA_DEFINICION_POR_DEFECTO));
  assert.ok(validarDefinicion(datos, { plantillasDisponibles: plantillas }).length > 0, "sin las plantillas reales sí hay problemas");
  assert.equal(validarDefinicion("no soy un objeto", { plantillasDisponibles: plantillas }).length, 1);
});

test("un archivo que no existe impide cargar y el error nombra la ruta", async (t) => {
  const carpeta = await crearCarpetaTemporal(t);
  const ruta = path.join(carpeta, "no-existe.json");

  await assert.rejects(cargar(ruta), (error) => {
    assert.ok(error instanceof ErrorDefinicion);
    assert.equal(error.codigo, "DEFINICION_NO_ENCONTRADA");
    assert.equal(error.archivo, ruta);
    assert.ok(error.message.includes(ruta));
    assert.match(error.message, /HERRAMIENTA_DEFINICION/);
    return true;
  });
  await assert.rejects(cargar(carpeta), { codigo: "DEFINICION_ILEGIBLE" }, "una carpeta en lugar de un archivo tampoco se puede leer");
});

test("un JSON dañado impide cargar y el error nombra el archivo", async (t) => {
  const ruta = await escribirDefinicionTemporal(t, () => '{ "version": 1, "pasos": [ ');

  await assert.rejects(cargar(ruta), (error) => {
    assert.ok(error instanceof ErrorDefinicion);
    assert.equal(error.codigo, "DEFINICION_JSON_DANADO");
    assert.ok(error.message.includes(ruta));
    assert.match(error.message, /no es JSON válido/);
    return true;
  });
});

test("un paso que falta o un orden repetido se rechaza nombrando el problema", async (t) => {
  const sinPaso = await escribirDefinicionTemporal(t, (datos) => {
    datos.pasos = datos.pasos.filter((p) => p.id !== "mockups");
  });
  const ordenRepetido = await escribirDefinicionTemporal(t, (datos) => {
    pasoDe(datos, "wireframes").orden = 7;
  });

  await assertRechaza(sinPaso, /debe haber 10 pasos, y hay 9/, /falta el paso con orden 10/);
  await assertRechaza(ordenRepetido, /el orden 7 está repetido en los pasos "story-map" y "wireframes"/, /falta el paso con orden 8/);
});

test("un origen inexistente, o posterior al propio paso, se rechaza nombrando el paso y el origen", async (t) => {
  const inexistente = await escribirDefinicionTemporal(t, (datos) => {
    pasoDe(datos, "linea-base").origenes = ["idea-escogida"];
  });
  const posterior = await escribirDefinicionTemporal(t, (datos) => {
    pasoDe(datos, "fichas").origenes = ["walking-skeleton", "story-map"];
  });
  const propio = await escribirDefinicionTemporal(t, (datos) => {
    pasoDe(datos, "user-flow").origenes = ["user-flow"];
  });

  await assertRechaza(inexistente, /paso "linea-base": el origen "idea-escogida" no es ningún paso/);
  await assertRechaza(posterior, /paso "fichas": el origen "story-map" \(orden 7\) no es anterior al propio paso/);
  await assertRechaza(propio, /paso "user-flow": el origen "user-flow" \(orden 6\) no es anterior/);
});

test("una plantilla que no existe se rechaza nombrando el archivo de la plantilla", async (t) => {
  const deUnPaso = await escribirDefinicionTemporal(t, (datos) => {
    pasoDe(datos, "hipotesis").plantilla = "01-hipotesis-vieja.md";
  });
  const deUnElemento = await escribirDefinicionTemporal(t, (datos) => {
    pasoDe(datos, "fichas").elementos[1].plantilla = "05c-ficha-otra.md";
  });
  const conCarpeta = await escribirDefinicionTemporal(t, (datos) => {
    datos.registros[0].plantilla = "../LEEME.md";
  });

  await assertRechaza(deUnPaso, /paso "hipotesis": la plantilla "01-hipotesis-vieja\.md" no existe/);
  await assertRechaza(deUnElemento, /tipo de elemento "ficha-instancia": la plantilla "05c-ficha-otra\.md" no existe/);
  await assertRechaza(conCarpeta, /registro "acuerdos": "plantilla" debe ser el nombre de un archivo \.md .*sin carpetas/);
});

test("un tipo de paso o de campo no válido, y un paso estructurado sin tipos de elemento, se rechazan", async (t) => {
  const tipoPaso = await escribirDefinicionTemporal(t, (datos) => {
    pasoDe(datos, "linea-base").tipo = "tabla";
  });
  const tipoCampo = await escribirDefinicionTemporal(t, (datos) => {
    pasoDe(datos, "hipotesis").campos[0].tipo = "fecha";
  });
  const sinElementos = await escribirDefinicionTemporal(t, (datos) => {
    pasoDe(datos, "story-map").elementos = [];
  });
  const visualSinChecklist = await escribirDefinicionTemporal(t, (datos) => {
    delete pasoDe(datos, "mockups").checklist;
    pasoDe(datos, "mockups").evidencia = "foto";
  });

  await assertRechaza(tipoPaso, /paso "linea-base": el tipo "tabla" no es válido/);
  await assertRechaza(tipoCampo, /paso "hipotesis", campo "fecha": el tipo "fecha" no es válido/);
  await assertRechaza(sinElementos, /paso "story-map": un paso estructurado debe tener al menos un tipo de elemento/);
  await assertRechaza(visualSinChecklist, /paso "mockups": un paso visual debe tener una "checklist"/, /"evidencia" debe ser "enlace-o-adjunto", y vale "foto"/);
});

test("varios problemas a la vez aparecen todos en el mismo error", async (t) => {
  const ruta = await escribirDefinicionTemporal(t, (datos) => {
    datos.version = 2;
    pasoDe(datos, "hipotesis").nombre = "  ";
    pasoDe(datos, "story-map").campos.push({ id: "leyenda-de-codigos", nombre: "Otra", tipo: "texto" });
    datos.registros = datos.registros.filter((r) => r.id !== "gaps-y-supuestos");
  });

  const error = await assertRechaza(
    ruta,
    /"version" debe ser 1, y vale 2/,
    /paso "hipotesis": "nombre" no puede estar vacío/,
    /paso "story-map": el id de campo "leyenda-de-codigos" está repetido/,
    /falta el registro transversal "gaps-y-supuestos"/,
  );
  assert.equal(error.problemas.length, 4);
  assert.match(error.message, /\(4 problemas\)/);
});
