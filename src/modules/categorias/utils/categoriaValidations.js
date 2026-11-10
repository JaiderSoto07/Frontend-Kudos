export const LIMITES = {
  nombre: { minimo: 3, maximo: 50 },
  descripcion: { minimo: 10, maximo: 250 },
}

export const MENSAJES_FORMULARIO = {
  nombreRequerido: 'El nombre es obligatorio.',
  nombreLongitud: `El nombre debe tener entre ${LIMITES.nombre.minimo} y ${LIMITES.nombre.maximo} caracteres.`,
  descripcionRequerida: 'La descripción es obligatoria.',
  descripcionLongitud: `La descripción debe tener entre ${LIMITES.descripcion.minimo} y ${LIMITES.descripcion.maximo} caracteres.`,
  nombreRepetido: 'Ya existe otra categoría con ese nombre.',
}

const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

const fueraDeLimites = (texto, { minimo, maximo }) => texto.length < minimo || texto.length > maximo

export function validarCategoria(datos, otrasCategorias = []) {
  const errores = {}
  const nombre = String(datos.nombre ?? '').trim()
  const descripcion = String(datos.descripcion ?? '').trim()

  if (!nombre) errores.nombre = MENSAJES_FORMULARIO.nombreRequerido
  else if (fueraDeLimites(nombre, LIMITES.nombre))
    errores.nombre = MENSAJES_FORMULARIO.nombreLongitud
  else if (
    otrasCategorias.some((c) => c.id !== datos.id && normalizar(c.nombre) === normalizar(nombre))
  ) {
    errores.nombre = MENSAJES_FORMULARIO.nombreRepetido
  }

  if (!descripcion) errores.descripcion = MENSAJES_FORMULARIO.descripcionRequerida
  else if (fueraDeLimites(descripcion, LIMITES.descripcion)) {
    errores.descripcion = MENSAJES_FORMULARIO.descripcionLongitud
  }

  return errores
}

export function coincideBusqueda(categoria, texto) {
  const buscado = normalizar(texto)
  return (
    !buscado ||
    normalizar(categoria.nombre).includes(buscado) ||
    normalizar(categoria.descripcion).includes(buscado)
  )
}

export function formatFecha(fecha) {
  if (!fecha) return ''
  const valor = new Date(fecha)
  if (Number.isNaN(valor.getTime())) return ''
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(valor)
}
