<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { formatFechaHora, resumen } from '@/modules/kudos/utils/kudoUtils'
import { moderacionService } from '../services/moderacionService'
import { nombreEstadoReporte, nombreMotivo, nombreTipo } from '../utils/moderacionUtils'

const reportes = ref([])
const cargando = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    reportes.value = await moderacionService.misReportes()
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <section class="mis-reportes">
    <PageHeader title="Mis reportes" subtitle="Lo que reportaste y en qué quedó cada reporte." />
    <p v-if="cargando" class="mis-reportes__estado" role="status">Cargando tus reportes…</p>
    <EmptyState
      v-else-if="error"
      icon="alert"
      title="No fue posible cargar tus reportes"
      :description="error"
    />
    <EmptyState
      v-else-if="!reportes.length"
      icon="flag"
      title="No has reportado contenido"
      description="Si ves algo inapropiado en un Kudo o una réplica, usa el botón Reportar."
    />
    <template v-else>
      <BaseCard v-for="reporte in reportes" :key="reporte.id" class="mis-reportes__item">
        <header class="mis-reportes__encabezado">
          <strong
            >{{ nombreTipo(reporte.tipoContenido) }} de {{ reporte.nombreAutorContenido }}</strong
          >
          <span
            class="mis-reportes__estado-reporte"
            :class="`mis-reportes__estado-reporte--${reporte.estado}`"
          >
            {{ nombreEstadoReporte(reporte.estado) }}
          </span>
        </header>
        <p class="mis-reportes__contenido">{{ resumen(reporte.contenido) }}</p>
        <p class="mis-reportes__detalle">
          {{ nombreMotivo(reporte.motivo) }} · {{ formatFechaHora(reporte.fechaReporte) }}
        </p>
        <p v-if="reporte.descripcion" class="mis-reportes__detalle">{{ reporte.descripcion }}</p>
        <RouterLink
          :to="{ name: 'kudo-detalle', params: { id: reporte.idKudo } }"
          class="mis-reportes__ver"
        >
          Ver el Kudo
        </RouterLink>
      </BaseCard>
    </template>
  </section>
</template>

<style scoped>
.mis-reportes {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.mis-reportes__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.mis-reportes__encabezado {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
}

.mis-reportes__estado-reporte {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}

.mis-reportes__estado-reporte--ACEPTADO {
  color: var(--color-success);
}

.mis-reportes__contenido {
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.mis-reportes__estado,
.mis-reportes__detalle {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.mis-reportes__ver {
  font-weight: 600;
  color: var(--color-primary);
}
</style>
