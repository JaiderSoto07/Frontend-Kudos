import { vi } from 'vitest'

const uuid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

export const ID = {
  usuario: uuid(1),
  categoria: { liderazgo: uuid(11), trabajoEquipo: uuid(12), servicio: uuid(13) },
}

export const USUARIO_ACTIVO = {
  id: ID.usuario,
  nombres: 'Andrea',
  apellidos: 'Ríos',
  correoInstitucional: 'andrea.rios@uco.net.co',
  estadoCuenta: 'ACTIVA',
  rol: 'ADMINISTRADOR',
  registrado: true,
  mensajeEstado: '',
}

export const USUARIO_NO_REGISTRADO = {
  id: '00000000-0000-0000-0000-000000000000',
  nombres: '',
  apellidos: '',
  correoInstitucional: 'nuevo@gmail.com',
  estadoCuenta: '',
  rol: '',
  registrado: false,
  mensajeEstado:
    'Aún no tienes una cuenta en UCO Kudos con este correo. Regístrate para solicitar tu cuenta.',
}

export const USUARIO_PENDIENTE = {
  ...USUARIO_ACTIVO,
  estadoCuenta: 'PENDIENTE_APROBACION',
  rol: '',
  mensajeEstado:
    'Tu cuenta está esperando la aprobación de la autoridad que te corresponde. Podrás ingresar cuando sea aprobada.',
}

export const USUARIO_DOCENTE = {
  ...USUARIO_ACTIVO,
  nombres: 'Mateo',
  apellidos: 'Cardona',
  correoInstitucional: 'mateo.cardona@uco.net.co',
  rol: 'DOCENTE',
}

export const USUARIO_PENDIENTE_VERIFICACION = {
  ...USUARIO_ACTIVO,
  estadoCuenta: 'PENDIENTE_VERIFICACION',
  rol: 'ESTUDIANTE',
  mensajeEstado:
    'Tu cuenta ya fue aprobada, pero aún debes verificar tu celular con el código que te enviamos.',
}

export const OPCIONES_REGISTRO = {
  roles: [
    'COORDINADOR_ACADEMICO',
    'COORDINADOR_FACULTAD',
    'COORDINADOR_PROGRAMA',
    'DOCENTE',
    'ESTUDIANTE',
  ],
  facultades: [{ id: uuid(21), nombre: 'Ingeniería', estado: 'ACTIVA' }],
  programas: [
    {
      id: uuid(31),
      nombre: 'Ingeniería de Sistemas',
      idFacultad: uuid(21),
      nombreFacultad: 'Ingeniería',
      activo: true,
    },
  ],
}

export const MENSAJES = {
  codigoIncorrecto:
    'El código no es correcto. Revisa el último código que te enviamos e intenta de nuevo.',
  celularRepetido:
    'Ya existe una cuenta registrada con ese número celular. Por favor usa otro número.',
  sinPermiso:
    'No tiene permiso para gestionar categorías. Solo el Administrador, el Rector y el Coordinador Académico pueden crear, modificar, activar, desactivar o ver las categorías inactivas.',
  nombreRepetido:
    'Ya existe una categoría con ese nombre. Por favor elija un nombre diferente e intente de nuevo.',
}

const GESTORES = ['ADMINISTRADOR', 'RECTOR', 'COORDINADOR_ACADEMICO']

const categoria = (id, nombre, descripcion, activa = true) => ({
  id,
  nombre,
  descripcion,
  activa,
  fechaCreacion: '2026-11-09T11:03:20',
})

const CATEGORIAS_INICIALES = [
  categoria(
    ID.categoria.liderazgo,
    'Liderazgo',
    'Reconoce a quien inspira y guía a otros con el ejemplo.',
  ),
  categoria(
    ID.categoria.trabajoEquipo,
    'Trabajo en equipo',
    'Reconoce la colaboración y el apoyo a compañeros para alcanzar metas comunes.',
  ),
  categoria(
    ID.categoria.servicio,
    'Servicio a la comunidad',
    'Reconoce aportes a la comunidad universitaria o a la región.',
    false,
  ),
]

let sesionActiva = true
let usuarioActual = USUARIO_ACTIVO
let categorias = []
let siguienteCategoria = 100
let cuenta = null
let codigoPendiente = '123456'

export const CELULAR_OCUPADO = '3209998877'

export const cuentaGuardada = () => cuenta

export const codigoEnviado = () => codigoPendiente

const avisoCodigo = (codigo) =>
  `Tu código de verificación de UCO Kudos es ${codigo}. Vence en 15 minutos.`

function cuentaDe(usuario) {
  if (!usuario.registrado) return null
  const celularVerificado = usuario.estadoCuenta === 'ACTIVA'
  const aprobada = usuario.estadoCuenta !== 'PENDIENTE_APROBACION'
  return {
    id: usuario.id,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    correoInstitucional: usuario.correoInstitucional,
    correoVerificado: true,
    numeroCelular: '3001234567',
    celularVerificado,
    aprobada,
    estadoCuenta: usuario.estadoCuenta,
    mensajeEstado: usuario.mensajeEstado,
    rol: usuario.rol,
    rolSolicitado: usuario.rol || 'ESTUDIANTE',
    estadoSolicitud: aprobada ? 'APROBADA' : 'PENDIENTE',
    motivoRechazo: '',
    ultimoCodigoEnviado: celularVerificado ? '' : avisoCodigo(codigoPendiente),
  }
}

function cambiarEstadoCuenta(estado, mensajeEstado = '') {
  cuenta.estadoCuenta = estado
  cuenta.mensajeEstado = mensajeEstado
  usuarioActual = { ...usuarioActual, estadoCuenta: estado, mensajeEstado }
}

function enviarCodigo(codigo) {
  codigoPendiente = codigo
  cuenta.ultimoCodigoEnviado = avisoCodigo(codigo)
}

function registrar(cuerpo) {
  if (cuerpo.numeroCelular === CELULAR_OCUPADO) return error(MENSAJES.celularRepetido)
  usuarioActual = {
    ...usuarioActual,
    id: uuid(2),
    nombres: cuerpo.nombres,
    apellidos: cuerpo.apellidos,
    estadoCuenta: 'PENDIENTE_APROBACION',
    rol: '',
    registrado: true,
    mensajeEstado: USUARIO_PENDIENTE.mensajeEstado,
  }
  cuenta = {
    ...cuentaDe(usuarioActual),
    rolSolicitado: cuerpo.rolSolicitado,
    numeroCelular: cuerpo.numeroCelular,
  }
  enviarCodigo('123456')
  return ok()
}

function verificar(cuerpo) {
  if (cuerpo.codigo !== codigoPendiente) return error(MENSAJES.codigoIncorrecto)
  Object.assign(cuenta, { celularVerificado: true, ultimoCodigoEnviado: '' })
  if (cuenta.aprobada && cuenta.correoVerificado) cambiarEstadoCuenta('ACTIVA')
  return ok()
}

function cambiarCelular(cuerpo) {
  if (cuerpo.numeroCelular === CELULAR_OCUPADO) return error(MENSAJES.celularRepetido)
  Object.assign(cuenta, { numeroCelular: cuerpo.numeroCelular, celularVerificado: false })
  if (cuenta.estadoCuenta === 'ACTIVA') {
    cambiarEstadoCuenta('PENDIENTE_VERIFICACION', USUARIO_PENDIENTE_VERIFICACION.mensajeEstado)
  }
  enviarCodigo('777777')
  return ok()
}

function atenderIdentidad(metodo, ruta, cuerpo) {
  const peticion = `${metodo} ${ruta}`
  if (peticion === 'GET /api/registros/opciones') return ok([OPCIONES_REGISTRO])
  if (peticion === 'POST /api/registros') return registrar(cuerpo)
  if (!cuenta) return error('Aún no tienes una cuenta en UCO Kudos con este correo.', 403)

  switch (peticion) {
    case 'GET /api/cuenta':
      return ok([cuenta])
    case 'POST /api/verificaciones/celular':
      return verificar(cuerpo)
    case 'POST /api/verificaciones/celular/reenvio':
      enviarCodigo('654321')
      return ok()
    case 'PUT /api/cuenta/datos-personales':
      Object.assign(cuenta, { nombres: cuerpo.nombres, apellidos: cuerpo.apellidos })
      usuarioActual = { ...usuarioActual, nombres: cuerpo.nombres, apellidos: cuerpo.apellidos }
      return ok()
    case 'PUT /api/cuenta/celular':
      return cambiarCelular(cuerpo)
    case 'PUT /api/cuenta/correo':
      Object.assign(cuenta, {
        correoInstitucional: cuerpo.correoInstitucional,
        correoVerificado: false,
      })
      return ok()
    default:
      return null
  }
}

export const categoriasGuardadas = () => categorias

export function cerrarSesionFalsa() {
  sesionActiva = false
}

const sobre = (estado, datos, mensajes) => ({ datos, mensajes, estado })

const responder = (status, cuerpo) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'content-type': 'application/json' },
  })

const sinCuerpo = (status) => new Response(null, { status })

const ok = (datos = [], mensajes = []) => responder(200, sobre('OK', datos, mensajes))

const error = (mensaje, status = 400) => responder(status, sobre('ERROR', [], [mensaje]))

const mismoNombre = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase()

function atenderCategorias(metodo, ruta, cuerpo) {
  if (metodo === 'GET' && ruta === '/api/categorias') return ok(categorias.filter((c) => c.activa))
  if (!GESTORES.includes(usuarioActual.rol)) return error(MENSAJES.sinPermiso, 403)
  if (metodo === 'GET' && ruta === '/api/categorias/todas') return ok(categorias)

  if (metodo === 'POST' && ruta === '/api/categorias') {
    if (categorias.some((c) => mismoNombre(c.nombre, cuerpo.nombre))) {
      return error(MENSAJES.nombreRepetido)
    }
    categorias.push(categoria(uuid(++siguienteCategoria), cuerpo.nombre, cuerpo.descripcion))
    return ok([], ['La categoría se registró exitosamente.'])
  }

  const [, id, accion] =
    ruta.match(/^\/api\/categorias\/([^/]+)(?:\/(activacion|desactivacion))?$/) ?? []
  const encontrada = categorias.find((c) => c.id === id)
  if (!encontrada) return null

  if (metodo === 'PUT' && !accion) {
    if (categorias.some((c) => c.id !== id && mismoNombre(c.nombre, cuerpo.nombre))) {
      return error(MENSAJES.nombreRepetido)
    }
    Object.assign(encontrada, { nombre: cuerpo.nombre, descripcion: cuerpo.descripcion })
    return ok([], ['La categoría se modificó exitosamente.'])
  }
  if (metodo === 'POST' && accion) {
    encontrada.activa = accion === 'activacion'
    return ok()
  }
  return null
}

export const peticiones = []

function atender(metodo, ruta, cuerpo) {
  if (!sesionActiva) return sinCuerpo(401)

  if (metodo === 'GET' && ruta === '/api/autenticacion') {
    return responder(200, sobre('OK', [usuarioActual], []))
  }
  if (metodo === 'POST' && ruta === '/api/autenticacion/salir') {
    sesionActiva = false
    return sinCuerpo(200)
  }
  if (ruta.startsWith('/api/categorias')) {
    const respuesta = atenderCategorias(metodo, ruta, cuerpo)
    if (respuesta) return respuesta
  }
  if (/^\/api\/(registros|cuenta|verificaciones)/.test(ruta)) {
    const respuesta = atenderIdentidad(metodo, ruta, cuerpo)
    if (respuesta) return respuesta
  }
  return responder(404, sobre('ERROR', [], [`Este recurso no existe: ${ruta}`]))
}

export function iniciarServidorFalso({ conSesion = true, usuario = USUARIO_ACTIVO } = {}) {
  sesionActiva = conSesion
  usuarioActual = usuario
  codigoPendiente = '123456'
  cuenta = cuentaDe(usuario)
  categorias = CATEGORIAS_INICIALES.map((c) => ({ ...c }))
  peticiones.length = 0

  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, opciones = {}) => {
      const metodo = opciones.method ?? 'GET'
      const cuerpo = opciones.body ? JSON.parse(opciones.body) : undefined
      peticiones.push({ metodo, ruta: url, cuerpo })
      return atender(metodo, url, cuerpo)
    }),
  )
}

export function apagarServidor() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(null, { status: 502 })),
  )
}
