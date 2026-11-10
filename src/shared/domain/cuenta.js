export const ROL = Object.freeze({
  ADMINISTRADOR: 'ADMINISTRADOR',
  RECTOR: 'RECTOR',
  COORDINADOR_ACADEMICO: 'COORDINADOR_ACADEMICO',
  COORDINADOR_FACULTAD: 'COORDINADOR_FACULTAD',
  COORDINADOR_PROGRAMA: 'COORDINADOR_PROGRAMA',
  DOCENTE: 'DOCENTE',
  ESTUDIANTE: 'ESTUDIANTE',
})

const NOMBRES_ROL = {
  [ROL.ADMINISTRADOR]: 'Administrador',
  [ROL.RECTOR]: 'Rector',
  [ROL.COORDINADOR_ACADEMICO]: 'Coordinador Académico',
  [ROL.COORDINADOR_FACULTAD]: 'Coordinador de Facultad',
  [ROL.COORDINADOR_PROGRAMA]: 'Coordinador de Programa',
  [ROL.DOCENTE]: 'Docente',
  [ROL.ESTUDIANTE]: 'Estudiante',
}

export const ESTADO_CUENTA = Object.freeze({
  PENDIENTE_APROBACION: 'PENDIENTE_APROBACION',
  PENDIENTE_VERIFICACION: 'PENDIENTE_VERIFICACION',
  ACTIVA: 'ACTIVA',
  SUSPENDIDA: 'SUSPENDIDA',
  DESACTIVADA: 'DESACTIVADA',
})

const NOMBRES_ESTADO = {
  [ESTADO_CUENTA.PENDIENTE_APROBACION]: 'Pendiente de aprobación',
  [ESTADO_CUENTA.PENDIENTE_VERIFICACION]: 'Pendiente de verificación',
  [ESTADO_CUENTA.ACTIVA]: 'Activa',
  [ESTADO_CUENTA.SUSPENDIDA]: 'Suspendida',
  [ESTADO_CUENTA.DESACTIVADA]: 'Desactivada',
}

export const nombreRol = (rol) => NOMBRES_ROL[rol] ?? ''

export const nombreEstadoCuenta = (estado) => NOMBRES_ESTADO[estado] ?? ''

export const tieneAlgunRol = (rol, rolesPermitidos) =>
  !rolesPermitidos?.length || rolesPermitidos.includes(rol)
