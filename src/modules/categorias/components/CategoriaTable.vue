<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { formatFecha } from '../utils/categoriaValidations'

defineProps({
  rows: { type: Array, required: true },
})

const emit = defineEmits(['editar', 'cambiar-estado'])

const columnas = [
  { key: 'nombre', label: 'Nombre', width: '22%' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'estado', label: 'Estado', width: '120px', nowrap: true },
  { key: 'fechaCreacion', label: 'Creada', width: '130px', nowrap: true },
  { key: 'acciones', label: 'Acciones', width: '170px', align: 'right', nowrap: true },
]
</script>

<template>
  <BaseTable :columns="columnas" :rows="rows" caption="Categorías de reconocimiento">
    <template #cell-nombre="{ row }">
      <strong>{{ row.nombre }}</strong>
    </template>
    <template #cell-estado="{ row }">
      <StatusBadge
        :label="row.activa ? 'Activa' : 'Inactiva'"
        :tone="row.activa ? 'success' : 'muted'"
      />
    </template>
    <template #cell-fechaCreacion="{ row }">
      {{ formatFecha(row.fechaCreacion) }}
    </template>
    <template #cell-acciones="{ row }">
      <div class="acciones">
        <BaseButton
          variant="icon"
          icon="pencil"
          :label="`Editar ${row.nombre}`"
          @click="emit('editar', row)"
        />
        <BaseButton
          variant="outline"
          :danger="row.activa"
          :aria-label="`${row.activa ? 'Desactivar' : 'Activar'} ${row.nombre}`"
          @click="emit('cambiar-estado', row)"
        >
          {{ row.activa ? 'Desactivar' : 'Activar' }}
        </BaseButton>
      </div>
    </template>
    <template #empty>
      <EmptyState
        icon="tag"
        title="No hay categorías para mostrar"
        description="Cambia los filtros o registra una nueva categoría."
      />
    </template>
  </BaseTable>
</template>

<style scoped>
.acciones {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
</style>
