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

export const USUARIO_RECHAZADO = {
  ...USUARIO_PENDIENTE,
  solicitudRechazada: true,
}

export const USUARIO_COORDINADOR = {
  ...USUARIO_ACTIVO,
  nombres: 'Juan Pablo',
  apellidos: 'Zuluaga',
  correoInstitucional: 'jzuluaga@gmail.com',
  rol: 'COORDINADOR_PROGRAMA',
}

export const USUARIO_ACADEMICO = {
  ...USUARIO_ACTIVO,
  nombres: 'Carlos',
  apellidos: 'Restrepo',
  correoInstitucional: 'crestrepo@gmail.com',
  rol: 'COORDINADOR_ACADEMICO',
}

export const USUARIO_ESTUDIANTE = {
  ...USUARIO_ACTIVO,
  nombres: 'Sofía',
  apellidos: 'Henao',
  correoInstitucional: 'sofia@gmail.com',
  rol: 'ESTUDIANTE',
}

export const ID_ORGANIZACION = {
  ingenieria: uuid(51),
  derecho: uuid(52),
  sistemas: uuid(61),
  vinculoMateo: uuid(71),
}

export const MOTIVO_RECHAZO_PREVIO = 'No perteneces al Programa que elegiste.'

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
  facultadRepetida: 'Ya existe una Facultad con ese nombre. Por favor elige otro.',
  facultadConProgramas:
    'No es posible inactivar la Facultad porque tiene Programas activos. Primero inactiva sus Programas.',
  rolNoCoincide:
    'El rol vigente de esa persona no corresponde al tipo de vínculo elegido. Un Docente solo se vincula como Docente y un Estudiante como Estudiante.',
  motivoCorto: 'El motivo del rechazo debe tener entre 10 y 250 caracteres.',
  rectorExiste: 'Ya hay un Rector vigente. Solo puede haber uno a la vez.',
  sinPermisoSolicitudes:
    'No tienes permiso para revisar solicitudes. Solo el Rector y los coordinadores aprueban o rechazan solicitudes de cuenta.',
  soloAdministrador: 'Solo un Administrador puede registrar al Rector o a otros Administradores.',
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

function estadoSolicitudDe(usuario, aprobada) {
  if (usuario.solicitudRechazada) return 'RECHAZADA'
  return aprobada ? 'APROBADA' : 'PENDIENTE'
}

const solicitudPendiente = (n, nombre, rol, programa) => ({
  id: uuid(n),
  idSolicitante: uuid(n + 100),
  nombreSolicitante: nombre,
  correoSolicitante: `${nombre.split(' ')[0].toLowerCase()}@gmail.com`,
  rolSolicitado: rol,
  nombreFacultad: '',
  nombrePrograma: programa,
  estado: 'PENDIENTE',
  fechaSolicitud: '2026-11-10T10:41:10',
  motivoRechazo: '',
})

const SOLICITUDES_INICIALES = [
  solicitudPendiente(41, 'Sofía Henao', 'ESTUDIANTE', 'Ingeniería de Sistemas'),
  solicitudPendiente(42, 'Mateo Arango', 'DOCENTE', 'Ingeniería de Sistemas'),
]

let solicitudes = []
let kudos = []

export const kudosGuardados = () => kudos

export const ID_KUDO = { primero: uuid(101), segundo: uuid(102) }

export const PERSONAS = [
  { id: uuid(111), nombre: 'Luis Gómez', correo: 'luis@gmail.com' },
  { id: uuid(112), nombre: 'Marta Ruiz', correo: 'marta@gmail.com' },
]

export const CATEGORIA_ACTIVA = uuid(11)

const kudoFalso = (id, autor, destinatario, contenido, fecha, extra = {}) => ({
  id,
  idAutor: autor.id,
  nombreAutor: autor.nombre,
  idDestinatario: destinatario.id,
  nombreDestinatario: destinatario.nombre,
  idCategoria: CATEGORIA_ACTIVA,
  nombreCategoria: 'Liderazgo',
  contenido,
  fechaCreacion: fecha,
  estado: 'VISIBLE',
  cantidadVisualizaciones: 3,
  promedioCalificacion: 4.5,
  cantidadCalificaciones: 2,
  ...extra,
})

const kudosIniciales = () => [
  kudoFalso(
    ID_KUDO.primero,
    { id: ID.usuario, nombre: 'Andrea Ríos' },
    PERSONAS[0],
    'Gracias por liderar el semillero.',
    '2026-11-10T10:00:00',
  ),
  kudoFalso(
    ID_KUDO.segundo,
    PERSONAS[1],
    PERSONAS[0],
    'Excelente trabajo. '.repeat(30).trim(),
    '2026-11-09T09:00:00',
    {
      idCategoria: uuid(12),
      nombreCategoria: 'Trabajo en equipo',
    },
  ),
]

const KUDOS_POR_PAGINA = 10

function muro(parametros) {
  const categoria = parametros.get('categoria')
  const persona = parametros.get('persona')
  const pagina = Number(parametros.get('pagina') ?? 1)
  const filtrados = kudos.filter(
    (k) =>
      (!categoria || k.idCategoria === categoria) &&
      (!persona || k.idAutor === persona || k.idDestinatario === persona),
  )
  const desde = (pagina - 1) * KUDOS_POR_PAGINA
  return ok([
    {
      kudos: filtrados.slice(desde, desde + KUDOS_POR_PAGINA),
      pagina,
      totalPaginas: Math.ceil(filtrados.length / KUDOS_POR_PAGINA),
      totalKudos: filtrados.length,
    },
  ])
}

function crearKudo(cuerpo) {
  if (cuerpo.idDestinatario === usuarioActual.id) {
    return error('No puedes darte un Kudo a ti mismo. Elige a otra persona.')
  }
  const destinatario = PERSONAS.find((p) => p.id === cuerpo.idDestinatario)
  kudos.unshift(
    kudoFalso(
      uuid(103),
      { id: usuarioActual.id, nombre: `${usuarioActual.nombres} ${usuarioActual.apellidos}` },
      destinatario,
      cuerpo.contenido,
      '2026-11-10T12:00:00',
      {
        cantidadVisualizaciones: 0,
        promedioCalificacion: 0,
        cantidadCalificaciones: 0,
      },
    ),
  )
  return ok()
}

function verKudo(id) {
  const kudo = kudos.find((k) => k.id === id)
  if (!kudo) return error('El Kudo indicado no existe.')
  if (kudo.idAutor !== usuarioActual.id) kudo.cantidadVisualizaciones += 1
  return ok([kudo])
}

function historial(idPersona, tipo) {
  return ok(
    kudos.filter(
      (k) =>
        (tipo !== 'emitidos' && k.idDestinatario === idPersona) ||
        (tipo !== 'recibidos' && k.idAutor === idPersona),
    ),
  )
}

function atenderKudos(metodo, ruta, parametros, cuerpo) {
  if (metodo === 'GET' && ruta === '/api/kudos') return muro(parametros)
  if (metodo === 'POST' && ruta === '/api/kudos') return crearKudo(cuerpo)
  if (metodo === 'GET' && ruta === '/api/personas') {
    const texto = (parametros.get('texto') ?? '').toLowerCase()
    return ok(PERSONAS.filter((p) => p.nombre.toLowerCase().includes(texto)))
  }
  const detalle = ruta.match(/^\/api\/kudos\/([^/]+)$/)
  if (metodo === 'GET' && detalle) return verKudo(detalle[1])
  const deUsuario = ruta.match(/^\/api\/usuarios\/([^/]+)\/kudos$/)
  if (metodo === 'GET' && deUsuario) return historial(deUsuario[1], parametros.get('tipo'))
  return null
}
let facultades = []
let programas = []
let vinculos = []

export const organizacionGuardada = () => ({ facultades, programas, vinculos })

const FACULTADES_INICIALES = [
  {
    id: ID_ORGANIZACION.ingenieria,
    nombre: 'Ingeniería',
    estado: 'ACTIVA',
    cantidadProgramas: 1,
    nombreCoordinador: 'Luisa Ospina',
  },
  {
    id: ID_ORGANIZACION.derecho,
    nombre: 'Derecho',
    estado: 'EN_CONFORMACION',
    cantidadProgramas: 0,
    nombreCoordinador: '',
  },
]

const PROGRAMAS_INICIALES = [
  {
    id: ID_ORGANIZACION.sistemas,
    nombre: 'Ingeniería de Sistemas',
    idFacultad: ID_ORGANIZACION.ingenieria,
    nombreFacultad: 'Ingeniería',
    activo: true,
    nombreCoordinador: 'Juan Pablo Zuluaga',
  },
]

const vinculo = (id, nombre, correo, tipo, vigente = true) => ({
  id,
  idUsuario: uuid(80),
  nombrePersona: nombre,
  correo,
  tipoVinculo: tipo,
  idPrograma: ID_ORGANIZACION.sistemas,
  nombrePrograma: 'Ingeniería de Sistemas',
  fechaInicio: '2026-02-01T08:00:00',
  fechaFin: vigente ? '1000-01-01T00:00:00' : '2026-06-30T08:00:00',
  motivoDesvinculacion: vigente ? '' : 'Terminó el semestre.',
  vigente,
})

const VINCULOS_INICIALES = [
  vinculo(ID_ORGANIZACION.vinculoMateo, 'Mateo Cardona', 'mateo@gmail.com', 'DOCENTE'),
  vinculo(uuid(72), 'Laura Gil', 'laura@gmail.com', 'ESTUDIANTE', false),
]

const cargo = (rol, nombre, extra = {}) => ({
  idUsuario: uuid(90),
  nombrePersona: nombre,
  correo: '',
  rol,
  nombreFacultad: '',
  nombrePrograma: '',
  fechaInicio: '2026-01-15T08:00:00',
  fechaFin: '1000-01-01T00:00:00',
  motivoFin: '',
  vigente: true,
  ...extra,
})

const ESTRUCTURA = [
  cargo('RECTOR', 'María Fernanda Gómez'),
  cargo('COORDINADOR_ACADEMICO', 'Carlos Restrepo'),
  cargo('COORDINADOR_FACULTAD', 'Luisa Ospina', { nombreFacultad: 'Ingeniería' }),
  cargo('COORDINADOR_PROGRAMA', 'Juan Pablo Zuluaga', { nombrePrograma: 'Ingeniería de Sistemas' }),
]

const CONSULTAN_ORGANIZACION = [
  'ADMINISTRADOR',
  'RECTOR',
  'COORDINADOR_ACADEMICO',
  'COORDINADOR_FACULTAD',
  'COORDINADOR_PROGRAMA',
]

function registrarFacultad(cuerpo) {
  if (facultades.some((f) => f.nombre.toLowerCase() === cuerpo.nombre.toLowerCase())) {
    return error(MENSAJES.facultadRepetida)
  }
  facultades.push({
    id: uuid(53),
    nombre: cuerpo.nombre,
    estado: 'EN_CONFORMACION',
    cantidadProgramas: 0,
    nombreCoordinador: '',
  })
  return ok()
}

function atenderFacultades(metodo, ruta, cuerpo) {
  if (metodo === 'GET' && ruta === '/api/facultades') return ok(facultades)
  if (metodo === 'POST' && ruta === '/api/facultades') return registrarFacultad(cuerpo)
  const [, id, accion] =
    ruta.match(/^\/api\/facultades\/([^/]+)(?:\/(inactivacion|coordinadores))?$/) ?? []
  const facultad = facultades.find((f) => f.id === id)
  if (!facultad) return null
  if (metodo === 'GET' && accion === 'coordinadores') {
    return ok([cargo('COORDINADOR_FACULTAD', facultad.nombreCoordinador || 'Luisa Ospina')])
  }
  if (metodo === 'POST' && accion === 'inactivacion') {
    if (facultad.cantidadProgramas > 0) return error(MENSAJES.facultadConProgramas)
    facultad.estado = 'INACTIVA'
    return ok()
  }
  if (metodo === 'PUT' && !accion) {
    facultad.nombre = cuerpo.nombre
    return ok()
  }
  return null
}

function registrarPrograma(cuerpo) {
  const facultad = facultades.find((f) => f.id === cuerpo.idFacultad)
  programas.push({
    id: uuid(62),
    nombre: cuerpo.nombre,
    idFacultad: cuerpo.idFacultad,
    nombreFacultad: facultad?.nombre ?? '',
    activo: true,
    nombreCoordinador: '',
  })
  if (facultad) {
    Object.assign(facultad, { estado: 'ACTIVA', cantidadProgramas: facultad.cantidadProgramas + 1 })
  }
  return ok()
}

function vincularPersona(programa, cuerpo) {
  if (cuerpo.correo === 'mateo@gmail.com' && cuerpo.tipoVinculo === 'ESTUDIANTE') {
    return error(MENSAJES.rolNoCoincide)
  }
  vinculos.push({
    ...vinculo(uuid(73), 'Sofía Henao', cuerpo.correo, cuerpo.tipoVinculo),
    idPrograma: programa.id,
  })
  return ok()
}

const HISTORIAL_PROGRAMA = [
  cargo('COORDINADOR_PROGRAMA', 'Juan Pablo Zuluaga'),
  cargo('COORDINADOR_PROGRAMA', 'Ana Ruiz', {
    vigente: false,
    fechaFin: '2025-12-01T08:00:00',
    motivoFin: 'Terminó su periodo.',
  }),
]

function atenderPrograma(metodo, accion, programa, cuerpo) {
  switch (`${metodo} ${accion ?? ''}`) {
    case 'GET ':
      return ok([programa])
    case 'GET coordinadores':
      return ok(HISTORIAL_PROGRAMA)
    case 'GET vinculos':
      return ok(vinculos.filter((v) => v.idPrograma === programa.id))
    case 'POST vinculos':
      return vincularPersona(programa, cuerpo)
    case 'POST inactivacion':
      programa.activo = false
      return ok()
    case 'PUT ':
      programa.nombre = cuerpo.nombre
      return ok()
    default:
      return null
  }
}

function atenderProgramas(metodo, ruta, cuerpo) {
  if (metodo === 'GET' && ruta === '/api/programas') return ok(programas)
  if (metodo === 'POST' && ruta === '/api/programas') return registrarPrograma(cuerpo)
  const [, id, accion] =
    ruta.match(/^\/api\/programas\/([^/]+)(?:\/(inactivacion|coordinadores|vinculos))?$/) ?? []
  const programa = programas.find((p) => p.id === id)
  return programa ? atenderPrograma(metodo, accion, programa, cuerpo) : null
}

function desvincular(idVinculo, cuerpo) {
  const encontrado = vinculos.find((v) => v.id === idVinculo)
  if (!encontrado) return null
  Object.assign(encontrado, {
    vigente: false,
    fechaFin: '2026-11-10T11:00:00',
    motivoDesvinculacion: cuerpo.motivo,
  })
  return ok()
}

function misVinculos() {
  if (usuarioActual.rol !== 'ESTUDIANTE') return ok([])
  return ok([vinculo(uuid(74), usuarioActual.nombres, '', 'ESTUDIANTE')])
}

function atenderOrganizacion(metodo, ruta, cuerpo) {
  if (ruta === '/api/estructura') return ok(ESTRUCTURA)
  if (ruta === '/api/cuenta/vinculos') return misVinculos()
  if (!CONSULTAN_ORGANIZACION.includes(usuarioActual.rol)) return error('No tienes permiso.', 403)
  const desvinculacion = ruta.match(/^\/api\/vinculos\/([^/]+)\/desvinculacion$/)
  if (metodo === 'POST' && desvinculacion) return desvincular(desvinculacion[1], cuerpo)
  if (ruta.startsWith('/api/facultades')) return atenderFacultades(metodo, ruta, cuerpo)
  if (ruta.startsWith('/api/programas')) return atenderProgramas(metodo, ruta, cuerpo)
  return null
}

export const solicitudesPendientes = () => solicitudes

export const ID_SOLICITUD = { sofia: uuid(41), mateo: uuid(42) }

const APROBADORES = [
  'RECTOR',
  'COORDINADOR_ACADEMICO',
  'COORDINADOR_FACULTAD',
  'COORDINADOR_PROGRAMA',
]

function atenderSolicitudes(metodo, ruta, cuerpo) {
  if (!APROBADORES.includes(usuarioActual.rol)) return error(MENSAJES.sinPermisoSolicitudes, 403)
  if (metodo === 'GET' && ruta === '/api/solicitudes/pendientes') return ok(solicitudes)

  const [, id, accion] = ruta.match(/^\/api\/solicitudes\/([^/]+)\/(aprobacion|rechazo)$/) ?? []
  if (!solicitudes.some((s) => s.id === id) || metodo !== 'POST') return null
  if (accion === 'rechazo' && String(cuerpo?.motivo ?? '').trim().length < 10) {
    return error(MENSAJES.motivoCorto)
  }
  solicitudes = solicitudes.filter((s) => s.id !== id)
  return ok()
}

function atenderAutoridades(cuerpo) {
  if (usuarioActual.rol !== 'ADMINISTRADOR') return error(MENSAJES.soloAdministrador, 403)
  if (cuerpo.rol === 'RECTOR') return error(MENSAJES.rectorExiste)
  return ok()
}

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
    estadoSolicitud: estadoSolicitudDe(usuario, aprobada),
    motivoRechazo: usuario.solicitudRechazada ? MOTIVO_RECHAZO_PREVIO : '',
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
  if (peticion === 'POST /api/registros/nueva-solicitud') {
    Object.assign(cuenta, {
      rolSolicitado: cuerpo.rolSolicitado,
      estadoSolicitud: 'PENDIENTE',
      motivoRechazo: '',
    })
    return ok()
  }
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

function atender(metodo, url, cuerpo) {
  const [ruta, textoConsulta = ''] = url.split('?')
  const parametros = new URLSearchParams(textoConsulta)
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
  if (/^\/api\/(kudos|personas|usuarios\/[^/]+\/kudos)/.test(ruta)) {
    const respuesta = atenderKudos(metodo, ruta, parametros, cuerpo)
    if (respuesta) return respuesta
  }
  if (/^\/api\/(facultades|programas|vinculos|estructura|cuenta\/vinculos)/.test(ruta)) {
    const respuesta = atenderOrganizacion(metodo, ruta, cuerpo)
    if (respuesta) return respuesta
  }
  if (ruta.startsWith('/api/solicitudes')) {
    const respuesta = atenderSolicitudes(metodo, ruta, cuerpo)
    if (respuesta) return respuesta
  }
  if (metodo === 'POST' && ruta === '/api/autoridades') return atenderAutoridades(cuerpo)
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
  solicitudes = SOLICITUDES_INICIALES.map((s) => ({ ...s }))
  kudos = kudosIniciales()
  facultades = FACULTADES_INICIALES.map((f) => ({ ...f }))
  programas = PROGRAMAS_INICIALES.map((p) => ({ ...p }))
  vinculos = VINCULOS_INICIALES.map((v) => ({ ...v }))
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
