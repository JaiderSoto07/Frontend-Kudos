import { ref } from 'vue'
import { defineStore } from 'pinia'
import { solicitudService } from '../services/solicitudService'

export const useSolicitudStore = defineStore('solicitud', () => {
  const solicitudes = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function cargar() {
    loading.value = true
    error.value = null
    try {
      solicitudes.value = await solicitudService.listarPendientes()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function recargar() {
    solicitudes.value = await solicitudService.listarPendientes()
  }

  async function aprobar(solicitud) {
    await solicitudService.aprobar(solicitud.id)
    await recargar()
  }

  async function rechazar(solicitud, motivo) {
    await solicitudService.rechazar(solicitud.id, motivo)
    await recargar()
  }

  return { solicitudes, loading, error, cargar, aprobar, rechazar }
})
