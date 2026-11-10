import { ApiError, http } from '@/api/http'
import { desdeDto, haciaDto } from '@/api/adaptadores'

const primero = (mensaje) => (datos) => {
  if (!datos.length) throw new ApiError(mensaje)
  return datos[0]
}

export const identidadService = {
  consultarOpcionesRegistro: () =>
    http
      .get('/registros/opciones')
      .then(primero('No fue posible consultar las opciones de registro.'))
      .then(desdeDto.opcionesRegistro),

  registrar: async (datos) => {
    await http.post('/registros', haciaDto.registro(datos))
  },

  verificarCelular: async (codigo) => {
    await http.post('/verificaciones/celular', haciaDto.codigo(codigo))
  },

  reenviarCodigo: async () => {
    await http.post('/verificaciones/celular/reenvio')
  },

  consultarCuenta: () =>
    http.get('/cuenta').then(primero('No fue posible consultar tu cuenta.')).then(desdeDto.cuenta),

  actualizarDatosPersonales: async (datos) => {
    await http.put('/cuenta/datos-personales', haciaDto.datosPersonales(datos))
  },

  cambiarCelular: async (celular) => {
    await http.put('/cuenta/celular', haciaDto.celular(celular))
  },

  cambiarCorreo: async (correo) => {
    await http.put('/cuenta/correo', haciaDto.correo(correo))
  },
}
