import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { notificacionService } from '../services/notificacionService'

export const useNotificacionStore = defineStore('notificacion', () => {
  const notificaciones = ref([])
  const error = ref('')

  const noLeidas = computed(() => notificaciones.value.filter((n) => !n.leida).length)

  async function cargar() {
    error.value = ''
    try {
      notificaciones.value = await notificacionService.mias()
    } catch (e) {
      error.value = e.message
    }
  }

  async function marcarLeida(notificacion) {
    if (notificacion.leida) return
    await notificacionService.marcarLeida(notificacion.id)
    notificacion.leida = true
  }

  async function marcarTodas() {
    await notificacionService.marcarTodas()
    for (const notificacion of notificaciones.value) {
      notificacion.leida = true
    }
  }

  return { notificaciones, error, noLeidas, cargar, marcarLeida, marcarTodas }
})
