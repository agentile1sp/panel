// Pantalla de recorrido (U3): los 10 pasos en orden con su nombre, su estado
// en texto y, si no están habilitados, qué pasos faltan; un enlace a cada paso
// y a los dos registros, y otro para volver al catálogo (FR2.1, FR2.3, FR2.4,
// FR2.5, NFR3). Dirección: recorrido.html?producto=<id>.

import { pedir } from "./api.js";
import { crear, mostrarMensaje } from "./dom.js";
import {
  claseEstado,
  leerParametros,
  rutaApiRecorrido,
  textoEstado,
  textoFaltan,
  textoPasoActual,
  tituloProducto,
  urlPaso,
  urlRegistros,
} from "./logica-recorrido.js";

const zonaMensaje = document.getElementById("mensaje");

async function iniciar() {
  const { producto } = leerParametros(window.location.search);
  if (producto === null) {
    mostrarMensaje(zonaMensaje, "Falta indicar el producto. Abre el recorrido desde el catálogo.", "error");
    return;
  }
  try {
    const [proceso, vista] = await Promise.all([pedir("GET", "/api/proceso"), pedir("GET", rutaApiRecorrido(producto))]);
    pintar(producto, proceso, vista);
  } catch (error) {
    mostrarMensaje(zonaMensaje, error.message, "error");
  }
}

function pintar(producto, proceso, vista) {
  const titulo = `Recorrido de ${tituloProducto(vista)}`;
  document.title = titulo;
  document.getElementById("titulo").textContent = titulo;
  document.getElementById("paso-actual").textContent = textoPasoActual(vista.pasoActual);

  const listaPasos = document.getElementById("lista-pasos");
  listaPasos.replaceChildren(...vista.pasos.map((paso) => elementoPaso(producto, paso)));

  const listaRegistros = document.getElementById("lista-registros");
  listaRegistros.replaceChildren(
    ...proceso.registros.map((registro) =>
      crear("li", {}, [crear("a", { href: urlRegistros(producto, registro.id), "data-testid": `recorrido-registro-${registro.id}`, texto: registro.nombre })]),
    ),
  );
}

function elementoPaso(producto, paso) {
  const faltan = textoFaltan(paso.faltan);
  return crear("li", { "data-testid": `recorrido-paso-${paso.id}` }, [
    crear("a", { class: "nombre-paso", href: urlPaso(producto, paso.id), "data-testid": `recorrido-paso-${paso.id}-abrir`, texto: paso.nombre }),
    crear("span", { class: claseEstado(paso.estado), texto: textoEstado(paso.estado) }),
    paso.habilitado ? null : crear("p", { class: "faltan", texto: `No habilitado. ${faltan}.` }),
  ]);
}

iniciar();
