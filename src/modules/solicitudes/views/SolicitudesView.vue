<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { nombreRol } from '@/shared/domain/cuenta'
import { useSolicitudStore } from '../stores/solicitudStore'
import RechazoModal from '../components/RechazoModal.vue'
import SolicitudTable from '../components/SolicitudTable.vue'

const store = useSolicitudStore()

const aprobacion = reactive({ abierto: false, solicitud: null, loading: false, error: '' })
const porRechazar = ref(null)
const aviso = ref('')

const mensajeAprobacion = computed(() => {
  const solicitud = aprobacion.solicitud
  if (!solicitud) return ''
  return `¿Aprobar a ${solicitud.nombreSolicitante} como ${nombreRol(solicitud.rolSolicitado)}? Si el cargo ya tiene titular, este será sustituido y su cuenta quedará desactivada.`
})

onMounted(() => store.cargar())

function pedirAprobacion(solicitud) {
  aviso.value = ''
  Object.assign(aprobacion, { abierto: true, solicitud, loading: false, error: '' })
}

async function confirmarAprobacion() {
  aprobacion.loading = true
  aprobacion.error = ''
  try {
    await store.aprobar(aprobacion.solicitud)
    aviso.value = `La solicitud de ${aprobacion.solicitud.nombreSolicitante} quedó aprobada.`
    aprobacion.abierto = false
  } catch (e) {
    aprobacion.error = e.message
  } finally {
    aprobacion.loading = false
  }
}

function pedirRechazo(solicitud) {
  aviso.value = ''
  porRechazar.value = solicitud
}

function rechazada(solicitud) {
  aviso.value = `La solicitud de ${solicitud.nombreSolicitante} quedó rechazada.`
  porRechazar.value = null
}
</script>

<template>
  <div class="solicitudes">
    <PageHeader
      title="Solicitudes de cuenta"
      subtitle="Aprueba o rechaza las solicitudes de las personas de tu ámbito."
    >
      <template #actions>
        <BaseButton
          variant="outline"
          icon="refresh"
          :disabled="store.loading"
          @click="store.cargar()"
        >
          Actualizar
        </BaseButton>
      </template>
    </PageHeader>

    <p v-if="aviso" class="solicitudes__aviso" role="status">{{ aviso }}</p>

    <BaseCard v-if="store.error">
      <EmptyState
        icon="alert"
        title="No fue posible cargar las solicitudes"
        :description="store.error"
      >
        <BaseButton variant="outline" icon="refresh" @click="store.cargar()">Reintentar</BaseButton>
      </EmptyState>
    </BaseCard>

    <BaseCard v-else>
      <p v-if="store.loading" class="solicitudes__estado" role="status">Cargando solicitudes…</p>
      <SolicitudTable
        v-else
        :rows="store.solicitudes"
        @aprobar="pedirAprobacion"
        @rechazar="pedirRechazo"
      />
    </BaseCard>

    <ConfirmDialog
      :open="aprobacion.abierto"
      title="Aprobar solicitud"
      :message="mensajeAprobacion"
      confirm-label="Aprobar"
      :loading="aprobacion.loading"
      :error="aprobacion.error"
      @confirm="confirmarAprobacion"
      @cancel="aprobacion.abierto = false"
    />

    <RechazoModal :solicitud="porRechazar" @cerrar="porRechazar = null" @rechazada="rechazada" />
  </div>
</template>

<style scoped>
.solicitudes {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.solicitudes__estado {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-text-muted);
}

.solicitudes__aviso {
  padding: var(--space-3);
  color: var(--color-success);
  background: var(--color-success-soft);
  border-radius: var(--radius-sm);
}
</style>
