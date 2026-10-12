// Pantalla del catálogo (U4), en "/": todos los productos con su nombre y su
// paso actual en texto, y un enlace a su recorrido (FR1.1, FR1.6, NFR3: desde
// aquí se llega al contenido de un paso en dos acciones). Crear con el nombre
// (FR1.3), cambiar el nombre (FR1.4) y borrar con un diálogo que nombra el
// producto y permite cancelar (FR1.5, AC1.4). Con el catálogo vacío, un mensaje
// y un botón para crear (FR1.7). Si el nombre no es válido, el formulario
// conserva lo escrito y explica el problema (AC1.3).
//
// Todo el texto que viene de los datos se pone con textContent (dom.js).

import { pedir } from "./api.js";
import { crear, mostrarMensaje } from "./dom.js";
import {
  MENSAJE_CATALOGO_VACIO,
  comprobarNombre,
  rutaApiProducto,
  textoConfirmacionBorrado,
  textoPasoActual,
  textoResultado,
  urlRecorridoProducto,
} from "./logica-catalogo.js";

const $ = (id) => document.getElementById(id);
const zonaMensaje = $("mensaje");
const dialogoRenombrar = $("dialogo-renombrar");
const dialogoBorrar = $("dialogo-borrar");
let productoSeleccionado = null;

function iniciar() {
  $("vacio-texto").textContent = MENSAJE_CATALOGO_VACIO;
  $("form-nuevo").addEventListener("submit", alCrear);
  $("vacio-crear").addEventListener("click", () => $("nuevo-nombre").focus());
  $("form-renombrar").addEventListener("submit", alRenombrar);
  $("renombrar-cancelar").addEventListener("click", () => dialogoRenombrar.close());
  $("borrar-confirmar").addEventListener("click", alConfirmarBorrado);
  $("borrar-cancelar").addEventListener("click", () => dialogoBorrar.close());
  return cargar();
}

// --- Lista -----------------------------------------------------------------

async function cargar() {
  try {
    pintar(await pedir("GET", "/api/productos"));
  } catch (error) {
    mostrarMensaje(zonaMensaje, error.message, "error");
  }
}

function pintar(productos) {
  $("vacio").hidden = productos.length > 0;
  $("lista-productos").replaceChildren(...productos.map(elementoProducto));
}

function elementoProducto(producto) {
  const prefijo = `catalogo-producto-${producto.idProducto}`;
  const renombrar = crear("button", { type: "button", "aria-label": `Cambiar nombre de ${producto.nombre}`, "data-testid": `${prefijo}-renombrar`, texto: "Cambiar nombre" });
  const borrar = crear("button", { type: "button", "aria-label": `Borrar ${producto.nombre}`, "data-testid": `${prefijo}-borrar`, texto: "Borrar" });
  renombrar.addEventListener("click", () => abrirRenombrar(producto));
  borrar.addEventListener("click", () => abrirBorrar(producto));
  return crear("li", { "data-testid": prefijo }, [
    crear("a", { class: "nombre-producto", href: urlRecorridoProducto(producto.idProducto), "data-testid": `${prefijo}-abrir`, texto: producto.nombre }),
    crear("p", { class: "paso-actual", "data-testid": `${prefijo}-paso-actual` }, [
      "Paso actual: ",
      crear("span", { class: producto.pasoActual?.completo ? "estado estado-completo" : "estado", texto: textoPasoActual(producto.pasoActual) }),
    ]),
    producto.problema ? crear("p", { class: "faltan", texto: producto.problema }) : null,
    crear("div", { class: "acciones-producto" }, [renombrar, borrar]),
  ]);
}

// --- Crear -----------------------------------------------------------------

async function alCrear(evento) {
  evento.preventDefault();
  const campo = $("nuevo-nombre");
  const comprobado = comprobarNombre(campo.value);
  if (!comprobado.valido) {
    marcarError(campo, comprobado.mensaje);
    return;
  }
  quitarError(campo);
  await conBotonOcupado($("crear"), async () => {
    try {
      const producto = await pedir("POST", "/api/productos", { nombre: comprobado.nombre });
      campo.value = "";
      mostrarMensaje(zonaMensaje, textoResultado("creado", producto.nombre), "exito");
      await cargar();
    } catch (error) {
      // Lo escrito se conserva en el campo para poder corregirlo y reintentar.
      marcarError(campo, error.message);
    }
  });
}

// --- Cambiar el nombre -----------------------------------------------------

function abrirRenombrar(producto) {
  productoSeleccionado = producto;
  const campo = $("renombrar-nombre");
  $("titulo-renombrar").textContent = `Cambiar el nombre de "${producto.nombre}"`;
  campo.value = producto.nombre;
  quitarError(campo);
  dialogoRenombrar.showModal();
  campo.select();
}

async function alRenombrar(evento) {
  evento.preventDefault();
  const campo = $("renombrar-nombre");
  const comprobado = comprobarNombre(campo.value);
  if (!comprobado.valido) {
    marcarError(campo, comprobado.mensaje);
    return;
  }
  await conBotonOcupado($("renombrar-guardar"), async () => {
    try {
      const producto = await pedir("PUT", rutaApiProducto(productoSeleccionado.idProducto), { nombre: comprobado.nombre });
      dialogoRenombrar.close();
      mostrarMensaje(zonaMensaje, textoResultado("renombrado", producto.nombre), "exito");
      await cargar();
    } catch (error) {
      marcarError(campo, error.message);
    }
  });
}

// --- Borrar ----------------------------------------------------------------

function abrirBorrar(producto) {
  productoSeleccionado = producto;
  $("texto-borrar").textContent = textoConfirmacionBorrado(producto.nombre);
  dialogoBorrar.showModal();
}

async function alConfirmarBorrado() {
  const producto = productoSeleccionado;
  await conBotonOcupado($("borrar-confirmar"), async () => {
    try {
      await pedir("DELETE", rutaApiProducto(producto.idProducto));
      mostrarMensaje(zonaMensaje, textoResultado("borrado", producto.nombre), "exito");
    } catch (error) {
      mostrarMensaje(zonaMensaje, error.message, "error");
    } finally {
      dialogoBorrar.close();
      await cargar();
    }
  });
}

// --- Ayudas ----------------------------------------------------------------

function marcarError(campo, mensaje) {
  const zona = $(`${campo.id}-error`);
  zona.textContent = mensaje;
  zona.hidden = false;
  campo.setAttribute("aria-invalid", "true");
  campo.focus();
}

function quitarError(campo) {
  const zona = $(`${campo.id}-error`);
  zona.textContent = "";
  zona.hidden = true;
  campo.removeAttribute("aria-invalid");
}

/** Desactiva el botón mientras dura la petición, para no enviarla dos veces. */
async function conBotonOcupado(boton, tarea) {
  if (boton.disabled) return;
  boton.disabled = true;
  try {
    await tarea();
  } finally {
    boton.disabled = false;
  }
}

iniciar();
