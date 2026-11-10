<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { nombreRol } from '@/shared/domain/cuenta'
import { ambitoDe, formatFecha } from '../utils/solicitudValidations'

defineProps({
  rows: { type: Array, required: true },
})

const emit = defineEmits(['aprobar', 'rechazar'])

const columnas = [
  { key: 'solicitante', label: 'Solicitante' },
  { key: 'rol', label: 'Rol solicitado', width: '200px', nowrap: true },
  { key: 'ambito', label: 'Programa o Facultad', width: '24%' },
  { key: 'fecha', label: 'Fecha', width: '170px', nowrap: true },
  { key: 'acciones', label: 'Acciones', width: '200px', align: 'right', nowrap: true },
]
</script>

<template>
  <BaseTable :columns="columnas" :rows="rows" caption="Solicitudes de cuenta pendientes">
    <template #cell-solicitante="{ row }">
      <strong>{{ row.nombreSolicitante }}</strong>
      <span class="solicitante__correo">{{ row.correoSolicitante }}</span>
    </template>
    <template #cell-rol="{ row }">{{ nombreRol(row.rolSolicitado) }}</template>
    <template #cell-ambito="{ row }">{{ ambitoDe(row) }}</template>
    <template #cell-fecha="{ row }">{{ formatFecha(row.fechaSolicitud) }}</template>
    <template #cell-acciones="{ row }">
      <div class="acciones">
        <BaseButton
          :aria-label="`Aprobar a ${row.nombreSolicitante}`"
          class="acciones__aprobar"
          @click="emit('aprobar', row)"
        >
          Aprobar
        </BaseButton>
        <BaseButton
          variant="outline"
          danger
          :aria-label="`Rechazar a ${row.nombreSolicitante}`"
          class="acciones__rechazar"
          @click="emit('rechazar', row)"
        >
          Rechazar
        </BaseButton>
      </div>
    </template>
    <template #empty>
      <EmptyState
        icon="users"
        title="No tienes solicitudes pendientes"
        description="Cuando alguien de tu ámbito solicite una cuenta, aparecerá aquí."
      />
    </template>
  </BaseTable>
</template>

<style scoped>
.solicitante__correo {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.acciones {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
</style>
