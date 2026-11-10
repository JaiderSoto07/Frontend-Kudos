<script setup>
import BaseTable from '@/components/ui/BaseTable.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { formatFecha } from '../utils/organizacionValidations'

defineProps({
  coordinadores: { type: Array, required: true },
})

const columnas = [
  { key: 'persona', label: 'Coordinador' },
  { key: 'periodo', label: 'Periodo', width: '220px', nowrap: true },
  { key: 'estado', label: 'Estado', width: '110px', nowrap: true },
  { key: 'motivo', label: 'Motivo de salida' },
]
</script>

<template>
  <BaseTable
    :columns="columnas"
    :rows="coordinadores"
    row-key="fechaInicio"
    caption="Historial de coordinadores"
  >
    <template #cell-persona="{ row }">
      <strong>{{ row.nombrePersona }}</strong>
      <span class="historial__correo">{{ row.correo }}</span>
    </template>
    <template #cell-periodo="{ row }">
      {{ formatFecha(row.fechaInicio) }} – {{ row.vigente ? 'hoy' : formatFecha(row.fechaFin) }}
    </template>
    <template #cell-estado="{ row }">
      <StatusBadge
        :label="row.vigente ? 'Vigente' : 'Terminado'"
        :tone="row.vigente ? 'success' : 'muted'"
      />
    </template>
    <template #cell-motivo="{ row }">{{ row.motivoFin }}</template>
    <template #empty>
      <EmptyState
        icon="users"
        title="Sin coordinadores"
        description="Este cargo aún no ha tenido titular."
      />
    </template>
  </BaseTable>
</template>

<style scoped>
.historial__correo {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
</style>
