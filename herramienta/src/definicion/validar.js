// Validación de la definición del proceso (U2, ADR-003).
//
// `validarDefinicion` es pura: recibe los datos ya leídos del archivo y el
// conjunto de plantillas que existen, y devuelve la lista de problemas
// encontrados (vacía si la definición es válida). No lanza: quien la llama
// (cargar.js) junta los problemas en un único ErrorDefinicion.
//
// Reglas:
//   - version 1;
//   - exactamente 10 pasos con orden único del 1 al 10;
//   - ids únicos y en minúsculas con guiones en pasos, registros, tipos de
//     elemento, campos y puntos de checklist;
//   - nombre no vacío y tipo válido;
//   - orígenes que existen y son anteriores al paso;
//   - plantilla que existe en la carpeta de plantillas;
//   - pasos de texto con al menos un campo, estructurados con al menos un tipo
//     de elemento y visuales con checklist y evidencia "enlace-o-adjunto";
//   - exactamente los 2 registros transversales, cada uno con sus tipos de
//     entrada (elementos).

export const VERSION_DEFINICION = 1;
export const NUMERO_DE_PASOS = 10;
export const TIPOS_PASO = Object.freeze(["texto", "estructurado", "visual"]);
export const TIPOS_CAMPO = Object.freeze(["texto", "texto-largo", "lista"]);
export const EVIDENCIA_VISUAL = "enlace-o-adjunto";
export const IDS_REGISTROS = Object.freeze(["acuerdos", "gaps-y-supuestos"]);

const PATRON_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PATRON_PLANTILLA = /^[^/\\]+\.md$/;

/**
 * @param {unknown} datos datos leídos del archivo de definición
 * @param {{ plantillasDisponibles: Set<string> }} opciones nombres de archivo de las plantillas que existen
 * @returns {string[]} problemas encontrados, en el orden en que aparecen
 */
export function validarDefinicion(datos, { plantillasDisponibles }) {
  const problemas = [];
  if (!esObjeto(datos)) {
    return ["el contenido debe ser un objeto JSON con \"version\", \"pasos\" y \"registros\""];
  }
  if (datos.version !== VERSION_DEFINICION) {
    problemas.push(`"version" debe ser ${VERSION_DEFINICION}, y vale ${JSON.stringify(datos.version)}`);
  }
  const contexto = { problemas, plantillasDisponibles };
  validarPasos(datos.pasos, contexto);
  validarRegistros(datos.registros, contexto);
  return problemas;
}

function validarPasos(pasos, contexto) {
  const { problemas } = contexto;
  if (!Array.isArray(pasos)) {
    problemas.push("\"pasos\" debe ser una lista");
    return;
  }
  if (pasos.length !== NUMERO_DE_PASOS) {
    problemas.push(`debe haber ${NUMERO_DE_PASOS} pasos, y hay ${pasos.length}`);
  }
  const validos = pasos.filter((paso, indice) => {
    if (esObjeto(paso)) return true;
    problemas.push(`el paso en la posición ${indice + 1} debe ser un objeto`);
    return false;
  });
  comprobarIdsUnicos(validos, "paso", problemas, (paso, i) => `el paso en la posición ${i + 1}`);
  comprobarOrdenes(validos, problemas);
  const ordenPorId = new Map(validos.filter((p) => typeof p.id === "string").map((p) => [p.id, p.orden]));
  for (const paso of validos) validarPaso(paso, ordenPorId, contexto);
}

function comprobarOrdenes(pasos, problemas) {
  const vistos = new Map();
  for (const paso of pasos) {
    const { orden } = paso;
    if (!Number.isInteger(orden) || orden < 1 || orden > NUMERO_DE_PASOS) {
      problemas.push(`${describirPaso(paso)}: "orden" debe ser un número entero del 1 al ${NUMERO_DE_PASOS}, y vale ${JSON.stringify(orden)}`);
      continue;
    }
    if (vistos.has(orden)) {
      problemas.push(`el orden ${orden} está repetido en los pasos "${vistos.get(orden)}" y "${paso.id}"`);
    } else {
      vistos.set(orden, paso.id);
    }
  }
  for (let orden = 1; orden <= NUMERO_DE_PASOS; orden += 1) {
    if (!vistos.has(orden)) problemas.push(`falta el paso con orden ${orden}`);
  }
}

function validarPaso(paso, ordenPorId, contexto) {
  const { problemas } = contexto;
  const donde = describirPaso(paso);
  comprobarNombre(paso, donde, problemas);
  comprobarPlantilla(paso.plantilla, donde, contexto);
  validarOrigenes(paso, ordenPorId, donde, problemas);
  validarCampos(paso.campos, donde, problemas);

  if (!TIPOS_PASO.includes(paso.tipo)) {
    problemas.push(`${donde}: el tipo ${JSON.stringify(paso.tipo)} no es válido (debe ser ${listar(TIPOS_PASO)})`);
    return;
  }
  if (paso.tipo === "texto" && Array.isArray(paso.campos) && paso.campos.length === 0) {
    problemas.push(`${donde}: un paso de texto debe tener al menos un campo`);
  }
  validarElementosSegunTipo(paso, donde, contexto);
  validarVisualSegunTipo(paso, donde, problemas);
}

function validarOrigenes(paso, ordenPorId, donde, problemas) {
  if (!Array.isArray(paso.origenes)) {
    problemas.push(`${donde}: "origenes" debe ser una lista de ids de pasos (vacía si no toma datos de ningún paso)`);
    return;
  }
  const vistos = new Set();
  for (const origen of paso.origenes) {
    if (vistos.has(origen)) {
      problemas.push(`${donde}: el origen "${origen}" está repetido`);
      continue;
    }
    vistos.add(origen);
    if (!ordenPorId.has(origen)) {
      problemas.push(`${donde}: el origen ${JSON.stringify(origen)} no es ningún paso de la definición`);
    } else if (Number.isInteger(paso.orden) && !(ordenPorId.get(origen) < paso.orden)) {
      problemas.push(`${donde}: el origen "${origen}" (orden ${ordenPorId.get(origen)}) no es anterior al propio paso`);
    }
  }
}

function validarElementosSegunTipo(paso, donde, contexto) {
  const { problemas } = contexto;
  if (paso.tipo !== "estructurado") {
    if (paso.elementos !== undefined) problemas.push(`${donde}: solo los pasos estructurados tienen "elementos"`);
    return;
  }
  validarElementos(paso.elementos, donde, contexto, "un paso estructurado debe tener al menos un tipo de elemento");
}

function validarVisualSegunTipo(paso, donde, problemas) {
  if (paso.tipo !== "visual") {
    if (paso.checklist !== undefined || paso.evidencia !== undefined) {
      problemas.push(`${donde}: solo los pasos visuales tienen "checklist" y "evidencia"`);
    }
    return;
  }
  if (!Array.isArray(paso.checklist) || paso.checklist.length === 0) {
    problemas.push(`${donde}: un paso visual debe tener una "checklist" con al menos un punto`);
  } else {
    const puntos = paso.checklist.filter((punto, i) => {
      if (esObjeto(punto) && esTextoNoVacio(punto.texto)) return true;
      problemas.push(`${donde}: el punto ${i + 1} de la checklist debe tener "id" y "texto"`);
      return false;
    });
    comprobarIdsUnicos(puntos, "punto de checklist", problemas, (_p, i) => `${donde}: el punto ${i + 1} de la checklist`, `${donde}: `);
  }
  if (paso.evidencia !== EVIDENCIA_VISUAL) {
    problemas.push(`${donde}: "evidencia" debe ser "${EVIDENCIA_VISUAL}", y vale ${JSON.stringify(paso.evidencia)}`);
  }
}

function validarRegistros(registros, contexto) {
  const { problemas } = contexto;
  if (!Array.isArray(registros)) {
    problemas.push("\"registros\" debe ser una lista");
    return;
  }
  const validos = registros.filter((registro, indice) => {
    if (esObjeto(registro)) return true;
    problemas.push(`el registro en la posición ${indice + 1} debe ser un objeto`);
    return false;
  });
  comprobarIdsUnicos(validos, "registro", problemas, (_r, i) => `el registro en la posición ${i + 1}`);
  const ids = validos.map((r) => r.id);
  for (const id of IDS_REGISTROS) {
    if (!ids.includes(id)) problemas.push(`falta el registro transversal "${id}"`);
  }
  for (const id of ids) {
    if (typeof id === "string" && !IDS_REGISTROS.includes(id)) {
      problemas.push(`el registro "${id}" no es uno de los registros transversales (${listar(IDS_REGISTROS)})`);
    }
  }
  for (const registro of validos) {
    const donde = `registro "${registro.id}"`;
    comprobarNombre(registro, donde, problemas);
    comprobarPlantilla(registro.plantilla, donde, contexto);
    validarCampos(registro.campos, donde, problemas);
    validarElementos(registro.elementos, donde, contexto, "un registro debe tener al menos un tipo de entrada en \"elementos\"");
  }
}

function validarElementos(elementos, donde, contexto, mensajeVacio) {
  const { problemas } = contexto;
  if (!Array.isArray(elementos) || elementos.length === 0) {
    problemas.push(`${donde}: ${mensajeVacio}`);
    return;
  }
  const validos = elementos.filter((elemento, i) => {
    if (esObjeto(elemento)) return true;
    problemas.push(`${donde}: el tipo de elemento en la posición ${i + 1} debe ser un objeto`);
    return false;
  });
  comprobarIdsUnicos(validos, "tipo de elemento", problemas, (_e, i) => `${donde}: el tipo de elemento en la posición ${i + 1}`, `${donde}: `);
  for (const elemento of validos) {
    const dondeElemento = `${donde}, tipo de elemento "${elemento.id}"`;
    comprobarNombre(elemento, dondeElemento, problemas);
    comprobarPlantilla(elemento.plantilla, dondeElemento, contexto);
    validarCampos(elemento.campos, dondeElemento, problemas);
    if (Array.isArray(elemento.campos) && elemento.campos.length === 0) {
      problemas.push(`${dondeElemento}: debe tener al menos un campo`);
    }
  }
}

function validarCampos(campos, donde, problemas) {
  if (!Array.isArray(campos)) {
    problemas.push(`${donde}: "campos" debe ser una lista (vacía si no tiene campos)`);
    return;
  }
  const validos = campos.filter((campo, i) => {
    if (esObjeto(campo)) return true;
    problemas.push(`${donde}: el campo en la posición ${i + 1} debe ser un objeto`);
    return false;
  });
  comprobarIdsUnicos(validos, "campo", problemas, (_c, i) => `${donde}: el campo en la posición ${i + 1}`, `${donde}: `);
  for (const campo of validos) {
    const dondeCampo = `${donde}, campo "${campo.id}"`;
    comprobarNombre(campo, dondeCampo, problemas);
    if (!TIPOS_CAMPO.includes(campo.tipo)) {
      problemas.push(`${dondeCampo}: el tipo ${JSON.stringify(campo.tipo)} no es válido (debe ser ${listar(TIPOS_CAMPO)})`);
    }
    if (campo.ayuda !== undefined && typeof campo.ayuda !== "string") {
      problemas.push(`${dondeCampo}: "ayuda" debe ser un texto`);
    }
  }
}

/** Comprueba que cada id existe, tiene el formato correcto y no se repite. */
function comprobarIdsUnicos(lista, queEs, problemas, describirSinId, prefijo = "") {
  const vistos = new Set();
  lista.forEach((objeto, indice) => {
    const { id } = objeto;
    if (typeof id !== "string" || !PATRON_ID.test(id)) {
      problemas.push(`${describirSinId(objeto, indice)}: "id" debe ser un texto en minúsculas con guiones (por ejemplo "mapa-de-piezas"), y vale ${JSON.stringify(id)}`);
      return;
    }
    if (vistos.has(id)) problemas.push(`${prefijo}el id de ${queEs} "${id}" está repetido`);
    vistos.add(id);
  });
}

function comprobarNombre(objeto, donde, problemas) {
  if (!esTextoNoVacio(objeto.nombre)) problemas.push(`${donde}: "nombre" no puede estar vacío`);
}

function comprobarPlantilla(plantilla, donde, { problemas, plantillasDisponibles }) {
  if (typeof plantilla !== "string" || !PATRON_PLANTILLA.test(plantilla)) {
    problemas.push(`${donde}: "plantilla" debe ser el nombre de un archivo .md de la carpeta de plantillas, sin carpetas, y vale ${JSON.stringify(plantilla)}`);
    return;
  }
  if (!plantillasDisponibles.has(plantilla)) {
    problemas.push(`${donde}: la plantilla "${plantilla}" no existe en la carpeta de plantillas`);
  }
}

function describirPaso(paso) {
  return typeof paso.id === "string" ? `paso "${paso.id}"` : `paso con orden ${JSON.stringify(paso.orden)}`;
}

function esObjeto(valor) {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function esTextoNoVacio(valor) {
  return typeof valor === "string" && valor.trim() !== "";
}

function listar(valores) {
  return valores.map((v) => `"${v}"`).join(", ");
}
