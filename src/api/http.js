import { API_BASE_URL } from './config'

export class ApiError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.mensajes = Array.isArray(data?.mensajes) ? data.mensajes : []
    this.correlationId = data?.correlationId ?? null
  }
}

export function interpretarRespuesta(status, cuerpo) {
  const exitoso = status >= 200 && status < 300 && cuerpo?.estado !== 'ERROR'
  if (exitoso) return Array.isArray(cuerpo?.datos) ? cuerpo.datos : []

  const mensaje = cuerpo?.mensajes?.find((m) => m) ?? mensajeSegunEstado(status)
  throw new ApiError(mensaje, { status, data: cuerpo ?? null })
}

const MENSAJE_BACKEND_APAGADO =
  'No fue posible conectar con el servidor. Verifica que el backend esté encendido.'

export const ESTADO_SIN_SESION = 401
const MENSAJE_SESION_TERMINADA = 'Tu sesión terminó. Inicia sesión de nuevo.'

function mensajeSegunEstado(status) {
  if (status === ESTADO_SIN_SESION) return MENSAJE_SESION_TERMINADA
  return status >= 500 ? MENSAJE_BACKEND_APAGADO : `Error ${status}`
}

let manejarSesionVencida = null

export function alSesionVencida(funcion) {
  manejarSesionVencida = funcion
}

async function request(method, path, body) {
  let response
  try {
    const options = { method, headers: { Accept: 'application/json' } }
    if (body !== undefined) {
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(body)
    }
    response = await fetch(`${API_BASE_URL}${path}`, options)
  } catch {
    throw new ApiError(MENSAJE_BACKEND_APAGADO)
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const cuerpo = isJson ? await response.json() : null
  try {
    return interpretarRespuesta(response.status, cuerpo)
  } catch (e) {
    if (e.status === ESTADO_SIN_SESION) manejarSesionVencida?.(e)
    throw e
  }
}

export const http = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  del: (path) => request('DELETE', path),
}
