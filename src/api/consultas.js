import { ApiError } from './http'

export const primero = (mensaje) => (datos) => {
  if (!datos.length) throw new ApiError(mensaje)
  return datos[0]
}

export function consulta(parametros) {
  const busqueda = new URLSearchParams()
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor) busqueda.set(clave, valor)
  }
  const texto = busqueda.toString()
  return texto ? `?${texto}` : ''
}
