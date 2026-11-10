import { ApiError, http } from '@/api/http'
import { desdeDto } from '@/api/adaptadores'
import { URL_INICIO_SESION_GOOGLE } from '@/api/config'

const RECURSO = '/autenticacion'

export const autenticacionService = {
  obtenerUsuarioActual: async () => {
    const datos = await http.get(RECURSO)
    if (!datos.length) throw new ApiError('No fue posible consultar la sesión.')
    return desdeDto.usuario(datos[0])
  },

  cerrarSesion: () => http.post(`${RECURSO}/salir`),

  iniciarSesionConGoogle: () => globalThis.location.assign(URL_INICIO_SESION_GOOGLE),
}
