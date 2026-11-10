import { ROLES_CON_FACULTAD, ROLES_CON_PROGRAMA } from '@/shared/domain/cuenta'

export const LIMITES = {
  nombres: { maximo: 60 },
  apellidos: { maximo: 60 },
  celular: { longitud: 10 },
  codigo: { longitud: 6 },
}

export const MENSAJES_FORMULARIO = {
  nombresRequeridos: 'Los nombres son obligatorios.',
  nombresLongitud: `Los nombres pueden tener máximo ${LIMITES.nombres.maximo} caracteres.`,
  apellidosRequeridos: 'Los apellidos son obligatorios.',
  apellidosLongitud: `Los apellidos pueden tener máximo ${LIMITES.apellidos.maximo} caracteres.`,
  celularRequerido: 'El número celular es obligatorio.',
  celularFormato: 'Debe ser un celular colombiano: 10 dígitos que empiezan por 3.',
  celularIgual: 'El número nuevo es igual al que ya tienes.',
  correoRequerido: 'El correo es obligatorio.',
  correoFormato: 'El correo no tiene un formato válido.',
  correoIgual: 'El correo nuevo es igual al que ya tienes.',
  rolRequerido: 'Elige el rol que solicitas.',
  programaRequerido: 'Elige el Programa académico.',
  facultadRequerida: 'Elige la Facultad.',
  codigoFormato: 'El código tiene 6 dígitos.',
}

export const MENSAJE_CORREO_CAMBIADO =
  'Tu correo cambió. Entra con Google usando el correo nuevo para verificarlo.'

const PATRON_CELULAR = /^3\d{9}$/
const PATRON_CORREO = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/
const PATRON_CODIGO = /^\d{6}$/

const limpio = (valor) => String(valor ?? '').trim()

export const necesitaPrograma = (rol) => ROLES_CON_PROGRAMA.includes(rol)

export const necesitaFacultad = (rol) => ROLES_CON_FACULTAD.includes(rol)

export function validarDatosPersonales(datos) {
  const errores = {}
  const nombres = limpio(datos.nombres)
  const apellidos = limpio(datos.apellidos)

  if (!nombres) errores.nombres = MENSAJES_FORMULARIO.nombresRequeridos
  else if (nombres.length > LIMITES.nombres.maximo)
    errores.nombres = MENSAJES_FORMULARIO.nombresLongitud

  if (!apellidos) errores.apellidos = MENSAJES_FORMULARIO.apellidosRequeridos
  else if (apellidos.length > LIMITES.apellidos.maximo) {
    errores.apellidos = MENSAJES_FORMULARIO.apellidosLongitud
  }
  return errores
}

export function validarCelular(celular, celularActual = '') {
  const valor = limpio(celular)
  if (!valor) return MENSAJES_FORMULARIO.celularRequerido
  if (!PATRON_CELULAR.test(valor)) return MENSAJES_FORMULARIO.celularFormato
  if (valor === limpio(celularActual)) return MENSAJES_FORMULARIO.celularIgual
  return ''
}

export function validarCorreo(correo, correoActual = '') {
  const valor = limpio(correo).toLowerCase()
  if (!valor) return MENSAJES_FORMULARIO.correoRequerido
  if (!PATRON_CORREO.test(valor)) return MENSAJES_FORMULARIO.correoFormato
  if (valor === limpio(correoActual).toLowerCase()) return MENSAJES_FORMULARIO.correoIgual
  return ''
}

export function validarAmbito(datos) {
  const errores = {}
  if (!datos.rol) errores.rol = MENSAJES_FORMULARIO.rolRequerido
  else if (necesitaPrograma(datos.rol) && !datos.idPrograma) {
    errores.idPrograma = MENSAJES_FORMULARIO.programaRequerido
  } else if (necesitaFacultad(datos.rol) && !datos.idFacultad) {
    errores.idFacultad = MENSAJES_FORMULARIO.facultadRequerida
  }
  return errores
}

export function validarRegistro(datos) {
  const errores = { ...validarDatosPersonales(datos), ...validarAmbito(datos) }
  const errorCelular = validarCelular(datos.celular)
  if (errorCelular) errores.celular = errorCelular
  return errores
}

export const codigoValido = (codigo) => PATRON_CODIGO.test(limpio(codigo))
