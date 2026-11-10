export const LIMITES_NOMBRE = {
  facultad: { minimo: 3, maximo: 80 },
  programa: { minimo: 3, maximo: 100 },
}

export const LIMITES_MOTIVO = { minimo: 10, maximo: 250 }

export const MENSAJES_ORGANIZACION = {
  nombreRequerido: 'El nombre es obligatorio.',
  nombreLongitud: ({ minimo, maximo }) =>
    `El nombre debe tener entre ${minimo} y ${maximo} caracteres.`,
  nombreRepetido: 'Ya existe otro elemento con ese nombre.',
  facultadRequerida: 'Elige la Facultad del Programa.',
  correoRequerido: 'Escribe el correo de la persona.',
  tipoRequerido: 'Elige si es Estudiante o Docente.',
  motivoRequerido: 'El motivo es obligatorio.',
  motivoLongitud: `El motivo debe tener entre ${LIMITES_MOTIVO.minimo} y ${LIMITES_MOTIVO.maximo} caracteres.`,
}

const limpio = (valor) => String(valor ?? '').trim()

export function validarNombre(nombre, tipo, otros = [], idPropio = null) {
  const valor = limpio(nombre)
  const limites = LIMITES_NOMBRE[tipo]
  if (!valor) return MENSAJES_ORGANIZACION.nombreRequerido
  if (valor.length < limites.minimo || valor.length > limites.maximo) {
    return MENSAJES_ORGANIZACION.nombreLongitud(limites)
  }
  if (otros.some((o) => o.id !== idPropio && o.nombre.toLowerCase() === valor.toLowerCase())) {
    return MENSAJES_ORGANIZACION.nombreRepetido
  }
  return ''
}

export function validarVinculo(datos) {
  const errores = {}
  if (!limpio(datos.correo)) errores.correo = MENSAJES_ORGANIZACION.correoRequerido
  if (!datos.tipoVinculo) errores.tipoVinculo = MENSAJES_ORGANIZACION.tipoRequerido
  return errores
}

export function validarMotivo(motivo) {
  const valor = limpio(motivo)
  if (!valor) return MENSAJES_ORGANIZACION.motivoRequerido
  if (valor.length < LIMITES_MOTIVO.minimo || valor.length > LIMITES_MOTIVO.maximo) {
    return MENSAJES_ORGANIZACION.motivoLongitud
  }
  return ''
}

export function formatFecha(fecha) {
  if (!fecha || String(fecha).startsWith('1000-')) return ''
  const valor = new Date(fecha)
  if (Number.isNaN(valor.getTime())) return ''
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(valor)
}
