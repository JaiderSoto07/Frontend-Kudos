<script setup>
import { computed } from 'vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { ESTADO_SOLICITUD, nombreEstadoSolicitud, nombreRol } from '@/shared/domain/cuenta'

const props = defineProps({
  cuenta: { type: Object, required: true },
})

const solicitud = computed(() => {
  if (!props.cuenta.estadoSolicitud) return ''
  return `${nombreRol(props.cuenta.rolSolicitado)} · ${nombreEstadoSolicitud(props.cuenta.estadoSolicitud)}`
})

const rechazada = computed(() => props.cuenta.estadoSolicitud === ESTADO_SOLICITUD.RECHAZADA)
</script>

<template>
  <ul class="validaciones" aria-label="Estado de tus validaciones">
    <li v-if="solicitud" class="validaciones__item">
      <span class="validaciones__nombre">Solicitud</span>
      <StatusBadge :label="solicitud" :tone="cuenta.aprobada ? 'success' : 'muted'" />
    </li>
    <li v-if="rechazada && cuenta.motivoRechazo" class="validaciones__motivo">
      Motivo del rechazo: {{ cuenta.motivoRechazo }}
    </li>
    <li class="validaciones__item">
      <span class="validaciones__nombre">Correo</span>
      <StatusBadge
        :label="cuenta.correoVerificado ? 'Verificado' : 'Sin verificar'"
        :tone="cuenta.correoVerificado ? 'success' : 'muted'"
      />
    </li>
    <li v-if="!cuenta.correoVerificado" class="validaciones__ayuda">
      Para verificarlo, cierra sesión y entra con Google usando {{ cuenta.correo }}.
    </li>
    <li class="validaciones__item">
      <span class="validaciones__nombre">Celular {{ cuenta.celular }}</span>
      <StatusBadge
        :label="cuenta.celularVerificado ? 'Verificado' : 'Sin verificar'"
        :tone="cuenta.celularVerificado ? 'success' : 'muted'"
      />
    </li>
  </ul>
</template>

<style scoped>
.validaciones {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: 0;
  margin: 0;
  list-style: none;
}

.validaciones__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}

.validaciones__nombre {
  font-weight: 600;
}

.validaciones__motivo,
.validaciones__ayuda {
  font-size: var(--text-sm);
  color: var(--color-label);
}

.validaciones__motivo {
  color: var(--color-danger);
}
</style>
