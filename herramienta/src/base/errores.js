// Tipos de error de la base común (U1).
//
// Todos llevan un `codigo` estable (para que el código que los recibe pueda
// distinguirlos), un mensaje en español pensado para la persona usuaria y,
// cuando la hay, la `causa` original (también disponible como `error.cause`).

class ErrorBase extends Error {
  constructor(codigo, mensaje, causa) {
    super(mensaje, causa === undefined ? undefined : { cause: causa });
    this.name = new.target.name;
    this.codigo = codigo;
    this.causa = causa ?? null;
  }
}

/** Fallo al leer, escribir, borrar o apartar archivos de la carpeta de datos. */
export class ErrorAlmacen extends ErrorBase {}

/** Adjunto no válido: demasiado grande, contenido no binario o ruta no válida. */
export class ErrorAdjunto extends ErrorBase {}

/** Petición HTTP no válida. Lleva el código de estado HTTP que se responde. */
export class ErrorPeticion extends ErrorBase {
  constructor(codigo, mensaje, estado = 400, causa) {
    super(codigo, mensaje, causa);
    this.estado = estado;
  }
}

/** Fallo al arrancar la herramienta: configuración, carpeta de datos o puerto. */
export class ErrorArranque extends ErrorBase {}

/**
 * Definición del proceso (U2) que falta, está dañada o no es válida, o consulta
 * de un paso o registro que no existe. El mensaje nombra el archivo y el
 * problema; `archivo` guarda la ruta y `problemas` la lista de problemas de
 * validación (vacía si el fallo no es de validación).
 */
export class ErrorDefinicion extends ErrorBase {
  /**
   * @param {string} codigo
   * @param {string} mensaje
   * @param {{ archivo?: string | null, problemas?: string[], causa?: unknown }} [detalle]
   */
  constructor(codigo, mensaje, { archivo = null, problemas = [], causa } = {}) {
    super(codigo, mensaje, causa);
    this.archivo = archivo;
    this.problemas = problemas;
  }
}

/**
 * Operación del recorrido de un producto (U3) que no se puede hacer: el
 * recorrido no existe, el paso no está habilitado, el contenido no encaja con
 * la definición del proceso, etc. Lleva el código de estado HTTP sugerido para
 * responder (`estado`), los pasos que faltan por completar (`faltan`, con id y
 * nombre) y los problemas de validación (`problemas`), vacíos si no aplican.
 */
export class ErrorRecorrido extends ErrorBase {
  /**
   * @param {string} codigo
   * @param {string} mensaje
   * @param {{ estado?: number, faltan?: { id: string, nombre: string }[], problemas?: string[], causa?: unknown }} [detalle]
   */
  constructor(codigo, mensaje, { estado = 400, faltan = [], problemas = [], causa } = {}) {
    super(codigo, mensaje, causa);
    this.estado = estado;
    this.faltan = faltan;
    this.problemas = problemas;
  }
}

/**
 * Operación del catálogo de productos (U4) que no se puede hacer: el nombre no
 * es válido, el producto no existe, el archivo del catálogo está dañado o los
 * datos de ejemplo no son válidos. Lleva el código de estado HTTP sugerido para
 * responder (`estado`) y los problemas encontrados (`problemas`), vacíos si no
 * aplican.
 */
export class ErrorCatalogo extends ErrorBase {
  /**
   * @param {string} codigo
   * @param {string} mensaje
   * @param {{ estado?: number, problemas?: string[], causa?: unknown }} [detalle]
   */
  constructor(codigo, mensaje, { estado = 400, problemas = [], causa } = {}) {
    super(codigo, mensaje, causa);
    this.estado = estado;
    this.problemas = problemas;
  }
}
