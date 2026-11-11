const PALABRAS_CON_TILDE = {
  kudo: 'Kudo',
  replica: 'réplica',
  revision: 'revisión',
  calificacion: 'calificación',
  categoria: 'categoría',
}

export const ACCIONES = [
  'KudoPublicado',
  'ReplicaPublicada',
  'CalificacionRegistrada',
  'CalificacionActualizada',
  'KudoReportado',
  'ReplicaReportada',
  'RevisionIniciada',
  'KudoVetado',
  'ReplicaVetada',
  'ContenidoLiberado',
  'SolicitudRegistroCreada',
  'SolicitudAprobada',
  'SolicitudRechazada',
  'AutoridadRegistrada',
  'CargoCerrado',
  'CelularVerificado',
  'CelularCambiado',
  'CorreoVerificado',
  'CorreoCambiado',
  'DatosPersonalesActualizados',
  'CuentaSuspendida',
  'CuentaReactivada',
  'PersonaVinculada',
  'PersonaDesvinculada',
  'FacultadCreada',
  'FacultadModificada',
  'FacultadActivada',
  'FacultadInactivada',
  'ProgramaCreado',
  'ProgramaModificado',
  'ProgramaInactivado',
  'CategoriaCreada',
  'CategoriaModificada',
  'CategoriaActivada',
  'CategoriaDesactivada',
]

export const TIPOS_OBJETO = [
  { value: 'Kudo', label: 'Kudo' },
  { value: 'Replica', label: 'Réplica' },
  { value: 'Calificacion', label: 'Calificación' },
  { value: 'Usuario', label: 'Usuario' },
  { value: 'SolicitudRegistro', label: 'Solicitud de registro' },
  { value: 'AsignacionRol', label: 'Rol asignado' },
  { value: 'Facultad', label: 'Facultad' },
  { value: 'ProgramaAcademico', label: 'Programa académico' },
  { value: 'VinculacionPrograma', label: 'Vínculo con un Programa' },
  { value: 'Categoria', label: 'Categoría' },
]

export const MENSAJE_RANGO_FECHAS = 'La fecha inicial no puede ser posterior a la fecha final.'

export function nombreAccion(accion) {
  const palabras = String(accion ?? '')
    .split(/(?=[A-Z])/)
    .filter(Boolean)
    .map((palabra) => palabra.toLowerCase())
    .map((palabra) => PALABRAS_CON_TILDE[palabra] ?? palabra)
  const frase = palabras.join(' ')
  return frase.charAt(0).toUpperCase() + frase.slice(1)
}

export const OPCIONES_ACCION = ACCIONES.map((accion) => ({
  value: accion,
  label: nombreAccion(accion),
}))

export const nombreTipoObjeto = (tipo) =>
  TIPOS_OBJETO.find((opcion) => opcion.value === tipo)?.label ?? tipo

export const cambioDeEstado = (registro) =>
  registro.estadoAnterior || registro.estadoNuevo
    ? `${registro.estadoAnterior || '—'} → ${registro.estadoNuevo || '—'}`
    : ''

export const validarRangoFechas = (desde, hasta) =>
  desde && hasta && desde > hasta ? MENSAJE_RANGO_FECHAS : ''
