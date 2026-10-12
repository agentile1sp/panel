// Pruebas de la pantalla del catálogo (U4) sin navegador: la lógica de
// pantalla (public/js/logica-catalogo.js) y el HTML servido en "/" (español,
// JavaScript y CSS en archivos, sin <script> en línea, controles con etiqueta y
// borrado con <dialog>) (FR1.1, FR1.3, FR1.5, FR1.6, FR1.7, NFR2, NFR4).

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MENSAJE_CATALOGO_VACIO,
  comprobarNombre,
  rutaApiProducto,
  textoConfirmacionBorrado,
  textoPasoActual,
  textoResultado,
  urlRecorridoProducto,
} from "../../public/js/logica-catalogo.js";
import { leerParametros } from "../../public/js/logica-recorrido.js";
import { validarNombre } from "../../src/catalogo/nombre.js";
import { arrancarAplicacion } from "../ayudas/catalogo.js";

test('el texto del paso actual es el nombre del paso, o "Completo" si lo están los 10; el catálogo vacío lo dice y ofrece crear', () => {
  assert.equal(textoPasoActual({ completo: false, id: "mapa-de-piezas", nombre: "Mapa de piezas" }), "Mapa de piezas");
  assert.equal(textoPasoActual({ completo: false, id: "hipotesis", nombre: "Hipótesis" }), "Hipótesis");
  assert.equal(textoPasoActual({ completo: true, id: null, nombre: "Completo" }), "Completo");
  assert.equal(textoPasoActual(null), "No se pudo leer su recorrido", "un recorrido que falta no rompe la lista");
  assert.match(MENSAJE_CATALOGO_VACIO, /no hay ningún producto/);
  assert.match(MENSAJE_CATALOGO_VACIO, /Crea/);
});

test("el texto de confirmación de borrado nombra el producto y avisa de que se borra su contenido (FR1.5)", () => {
  const texto = textoConfirmacionBorrado('Club "de" lectura');
  assert.match(texto, /"Club "de" lectura"/);
  assert.match(texto, /recorrido/);
  assert.match(texto, /No se puede deshacer/);
  assert.notEqual(textoConfirmacionBorrado("Uno"), textoConfirmacionBorrado("Otro"));
  assert.equal(textoResultado("borrado", "Uno"), 'Producto "Uno" borrado.');
  assert.equal(textoResultado("creado", "Uno"), 'Producto "Uno" creado.');
  assert.equal(textoResultado("otra-cosa", "Uno"), "");
});

test("el enlace al recorrido de un producto es recorrido.html?producto=<id> con el id codificado (FR1.6)", () => {
  assert.equal(urlRecorridoProducto("p-0123456789ab"), "recorrido.html?producto=p-0123456789ab");
  const raro = "p 1&paso=x/ñ";
  const url = urlRecorridoProducto(raro);
  assert.equal(url, "recorrido.html?producto=p+1%26paso%3Dx%2F%C3%B1");
  assert.equal(leerParametros(url.slice(url.indexOf("?"))).producto, raro, "la pantalla de recorrido lee el mismo id");
  assert.equal(leerParametros(url.slice(url.indexOf("?"))).paso, null, "el id no puede colar otros parámetros");
  assert.equal(rutaApiProducto("p 1/x"), "/api/productos/p%201%2Fx");
});

test("la comprobación del nombre en pantalla rechaza vacío o solo espacios y acepta lo mismo que el servidor", () => {
  assert.deepEqual(comprobarNombre("  Club de lectura "), { valido: true, nombre: "Club de lectura" });
  assert.deepEqual(comprobarNombre(""), { valido: false, mensaje: "El nombre es obligatorio." });
  assert.deepEqual(comprobarNombre(" \t\n "), { valido: false, mensaje: "El nombre es obligatorio." });
  for (const texto of ["", "   ", "\t", "Agua", ' "Ñandú" & <b> ', "x".repeat(100), "x".repeat(101), "ñ".repeat(100), "😀".repeat(100), "😀".repeat(101), undefined, 7]) {
    const enPantalla = comprobarNombre(texto);
    let enServidor;
    try {
      enServidor = { valido: true, nombre: validarNombre(texto) };
    } catch (error) {
      enServidor = { valido: false, mensaje: error.message };
    }
    assert.deepEqual(enPantalla, enServidor, `mismo resultado para ${JSON.stringify(texto)?.slice(0, 20)}`);
  }
});

test("/ se sirve en español, carga su JavaScript y su CSS desde archivos, no tiene script en línea, cada control tiene etiqueta y el borrado usa <dialog> en lugar de window.confirm", async (t) => {
  const { aplicacion } = await arrancarAplicacion(t);
  const respuesta = await fetch(`${aplicacion.direccion}/`);
  assert.equal(respuesta.status, 200);
  assert.match(respuesta.headers.get("content-security-policy"), /default-src 'self'/);
  const html = await respuesta.text();

  assert.match(html, /<html lang="es">/);
  assert.match(html, /<title>Catálogo de productos<\/title>/);
  assert.match(html, /<link rel="stylesheet" href="\/css\/estilos\.css" \/>/);
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  assert.match(scripts[0][1], /type="module" src="\/js\/catalogo\.js"/);
  assert.equal(scripts[0][2].trim(), "", "sin JavaScript en línea");
  assert.doesNotMatch(html, /<style\b|\sstyle="|\son[a-z]+="/i, "sin estilos ni manejadores en línea");

  const etiquetas = new Set([...html.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g)].map((m) => m[1]));
  const controles = [...html.matchAll(/<(input|select|textarea)\b[^>]*>/g)].map((m) => m[0]);
  assert.equal(controles.length, 2, "el nombre nuevo y el de cambiar nombre");
  for (const control of controles) {
    assert.ok(etiquetas.has(/\bid="([^"]+)"/.exec(control)?.[1]), `el control ${control} tiene una etiqueta`);
    assert.match(control, /data-testid="[a-z0-9-]+"/);
  }
  for (const [elemento] of html.matchAll(/<(a|button|dialog|form)\b[^>]*>/g)) {
    assert.match(elemento, /data-testid="[a-z0-9-]+"/, `${elemento} lleva data-testid`);
  }
  assert.match(html, /<dialog id="dialogo-borrar"[^>]*>/);
  assert.match(html, /id="borrar-cancelar"[^>]*autofocus/, "el foco empieza en Cancelar, no en Borrar");

  const js = await fetch(`${aplicacion.direccion}/js/catalogo.js`);
  assert.equal(js.status, 200);
  const codigo = await js.text();
  assert.doesNotMatch(codigo, /\bconfirm\s*\(/, "no usa window.confirm");
  assert.match(codigo, /showModal\(\)/);
  for (const archivo of ["/js/logica-catalogo.js", "/js/logica-recorrido.js", "/js/api.js", "/js/dom.js", "/css/estilos.css"]) {
    assert.equal((await fetch(`${aplicacion.direccion}${archivo}`)).status, 200, `${archivo} se sirve`);
  }
});
