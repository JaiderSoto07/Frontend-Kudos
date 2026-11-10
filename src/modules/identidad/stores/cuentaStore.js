import { ref } from 'vue'
import { defineStore } from 'pinia'
import { identidadService } from '../services/identidadService'

export const useCuentaStore = defineStore('cuenta', () => {
  const cuenta = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function cargar() {
    loading.value = true
    error.value = null
    try {
      cuenta.value = await identidadService.consultarCuenta()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function recargar() {
    cuenta.value = await identidadService.consultarCuenta()
  }

  async function verificarCelular(codigo) {
    await identidadService.verificarCelular(codigo)
  }

  async function reenviarCodigo() {
    await identidadService.reenviarCodigo()
    await recargar()
  }

  async function actualizarDatosPersonales(datos) {
    await identidadService.actualizarDatosPersonales(datos)
    await recargar()
  }

  async function cambiarCelular(celular) {
    await identidadService.cambiarCelular(celular)
    await recargar()
  }

  async function cambiarCorreo(correo) {
    await identidadService.cambiarCorreo(correo)
  }

  return {
    cuenta,
    loading,
    error,
    cargar,
    recargar,
    verificarCelular,
    reenviarCodigo,
    actualizarDatosPersonales,
    cambiarCelular,
    cambiarCorreo,
  }
})
