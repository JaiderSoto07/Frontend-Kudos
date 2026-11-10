import { vi } from 'vitest'

const uuid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

export const ID = {
  usuario: uuid(1),
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

let sesionActiva = true
let usuarioActual = USUARIO_ACTIVO

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

export const peticiones = []

function atender(metodo, ruta) {
  if (!sesionActiva) return sinCuerpo(401)

  if (metodo === 'GET' && ruta === '/api/autenticacion') {
    return responder(200, sobre('OK', [usuarioActual], []))
  }
  if (metodo === 'POST' && ruta === '/api/autenticacion/salir') {
    sesionActiva = false
    return sinCuerpo(200)
  }
  return responder(404, sobre('ERROR', [], [`Este recurso no existe: ${ruta}`]))
}

export function iniciarServidorFalso({ conSesion = true, usuario = USUARIO_ACTIVO } = {}) {
  sesionActiva = conSesion
  usuarioActual = usuario
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
