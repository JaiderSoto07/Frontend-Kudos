import { describe, it, expect, afterEach, vi } from 'vitest'
import { ApiError, http, interpretarRespuesta } from '../http'

const sobre = (estado, datos, mensajes) => ({ datos, mensajes, estado })

function responder(status, cuerpo) {
  const fetchFalso = vi.fn(async () => ({
    status,
    headers: { get: () => 'application/json' },
    json: async () => cuerpo,
  }))
  vi.stubGlobal('fetch', fetchFalso)
  return fetchFalso
}

describe('interpretarRespuesta', () => {
  it('devuelve los datos de una RespuestaOk', () => {
    const cuerpo = sobre('OK', [{ id: 'a', nombre: 'Liderazgo' }], [])
    expect(interpretarRespuesta(200, cuerpo)).toEqual([{ id: 'a', nombre: 'Liderazgo' }])
  })

  it('una operación sin datos devuelve una lista vacía', () => {
    expect(
      interpretarRespuesta(200, sobre('OK', [], ['La categoría se registró exitosamente.'])),
    ).toEqual([])
    expect(interpretarRespuesta(204, null)).toEqual([])
  })

  it('una RespuestaError lanza ApiError con el mensaje para el usuario', () => {
    const cuerpo = sobre('ERROR', [], ['Ya existe una categoría con ese nombre.'])
    let error
    try {
      interpretarRespuesta(400, cuerpo)
    } catch (e) {
      error = e
    }
    expect(error).toBeInstanceOf(ApiError)
    expect(error.message).toBe('Ya existe una categoría con ese nombre.')
    expect(error.status).toBe(400)
    expect(error.mensajes).toEqual(cuerpo.mensajes)
  })

  it('un 403 conserva el mensaje del back-end', () => {
    const cuerpo = sobre('ERROR', [], ['No tiene permiso para gestionar categorías.'])
    expect(() => interpretarRespuesta(403, cuerpo)).toThrow(
      'No tiene permiso para gestionar categorías.',
    )
  })

  it('un 401 sin cuerpo pide iniciar sesión de nuevo', () => {
    expect(() => interpretarRespuesta(401, null)).toThrow(
      'Tu sesión terminó. Inicia sesión de nuevo.',
    )
  })

  it('un 5xx sin cuerpo avisa que no hay conexión con el servidor', () => {
    expect(() => interpretarRespuesta(502, null)).toThrow(/backend esté encendido/)
  })

  it('un 4xx sin cuerpo usa el código de estado como mensaje', () => {
    expect(() => interpretarRespuesta(404, null)).toThrow('Error 404')
  })
})

describe('http', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('envía las peticiones a /api con el cuerpo en JSON', async () => {
    const fetchFalso = responder(200, sobre('OK', [], []))
    await http.post('/categorias', { nombre: 'Innovación' })
    const [ruta, opciones] = fetchFalso.mock.calls[0]
    expect(ruta).toBe('/api/categorias')
    expect(opciones.method).toBe('POST')
    expect(opciones.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(opciones.body)).toEqual({ nombre: 'Innovación' })
  })

  it('un GET no envía cuerpo', async () => {
    const fetchFalso = responder(200, sobre('OK', [], []))
    await http.get('/categorias')
    const [, opciones] = fetchFalso.mock.calls[0]
    expect(opciones.method).toBe('GET')
    expect(opciones.body).toBeUndefined()
  })

  it('con el servidor apagado lanza ApiError con un mensaje claro', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))),
    )
    const error = await http.get('/categorias').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.message).toMatch(/backend esté encendido/)
  })
})
