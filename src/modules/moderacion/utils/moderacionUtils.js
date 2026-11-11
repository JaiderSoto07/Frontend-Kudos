export const TIPO_CONTENIDO = Object.freeze({ KUDO: 'KUDO', REPLICA: 'REPLICA' })

export const MOTIVOS_REPORTE = [
  { value: 'LENGUAJE_OFENSIVO', label: 'Lenguaje ofensivo' },
  { value: 'ACOSO', label: 'Acoso' },
  { value: 'DISCRIMINACION', label: 'Discriminación' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'INFORMACION_FALSA', label: 'Información falsa' },
  { value: 'OTRO', label: 'Otro' },
]

const NOMBRES_ESTADO_REPORTE = {
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En revisión',
  ACEPTADO: 'Aceptado: el contenido fue vetado',
  RECHAZADO: 'Rechazado: el contenido sigue visible',
}

const NOMBRES_ESTADO_CONTENIDO = {
  REPORTADO: 'Reportado',
  EN_REVISION: 'En revisión',
}

export const LIMITE_DESCRIPCION = 500

export const LIMITES_DECISION = { minimo: 10, maximo: 500 }

export const MENSAJES_MODERACION = {
  motivoRequerido: 'Elige el motivo del reporte.',
  descripcionRequerida: 'Cuando el motivo es "Otro", describe qué problema tiene el contenido.',
  descripcionLarga: `La descripción admite máximo ${LIMITE_DESCRIPCION} caracteres.`,
  decisionRequerida: 'Escribe el motivo de la decisión.',
  decisionLongitud: `El motivo debe tener entre ${LIMITES_DECISION.minimo} y ${LIMITES_DECISION.maximo} caracteres.`,
}

export const nombreMotivo = (motivo) =>
  MOTIVOS_REPORTE.find((opcion) => opcion.value === motivo)?.label ?? motivo

export const nombreEstadoReporte = (estado) => NOMBRES_ESTADO_REPORTE[estado] ?? estado

export const nombreEstadoContenido = (estado) => NOMBRES_ESTADO_CONTENIDO[estado] ?? estado

export const nombreTipo = (tipo) => (tipo === TIPO_CONTENIDO.KUDO ? 'Kudo' : 'Réplica')

export const nombreTipoEnFrase = (tipo) => (tipo === TIPO_CONTENIDO.KUDO ? 'Kudo' : 'réplica')

export function validarReporte(datos) {
  const errores = {}
  const descripcion = String(datos.descripcion ?? '').trim()
  if (!datos.motivo) errores.motivo = MENSAJES_MODERACION.motivoRequerido
  if (datos.motivo === 'OTRO' && !descripcion) {
    errores.descripcion = MENSAJES_MODERACION.descripcionRequerida
  }
  if (descripcion.length > LIMITE_DESCRIPCION) {
    errores.descripcion = MENSAJES_MODERACION.descripcionLarga
  }
  return errores
}

export function validarDecision(motivo) {
  const valor = String(motivo ?? '').trim()
  if (!valor) return MENSAJES_MODERACION.decisionRequerida
  if (valor.length < LIMITES_DECISION.minimo || valor.length > LIMITES_DECISION.maximo) {
    return MENSAJES_MODERACION.decisionLongitud
  }
  return ''
}
