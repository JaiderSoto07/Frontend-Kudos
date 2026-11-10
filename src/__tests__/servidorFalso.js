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

export const MENSAJES = {
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
  return responder(404, sobre('ERROR', [], [`Este recurso no existe: ${ruta}`]))
}

export function iniciarServidorFalso({ conSesion = true, usuario = USUARIO_ACTIVO } = {}) {
  sesionActiva = conSesion
  usuarioActual = usuario
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
