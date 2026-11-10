<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSearchInput from '@/components/ui/BaseSearchInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { ESTADOS } from '../stores/categoriaStore'

const props = defineProps({
  filtros: { type: Object, required: true },
})

const emit = defineEmits(['update', 'limpiar'])

const opcionesEstado = [
  { value: ESTADOS.ACTIVA, label: 'Activas' },
  { value: ESTADOS.INACTIVA, label: 'Inactivas' },
]

const texto = computed({
  get: () => props.filtros.texto,
  set: (valor) => emit('update', 'texto', valor),
})

const estado = computed({
  get: () => props.filtros.estado,
  set: (valor) => emit('update', 'estado', valor),
})
</script>

<template>
  <div class="filters">
    <div class="filters__search">
      <BaseSearchInput v-model="texto" label="Buscar categoría" placeholder="Buscar categoría…" />
    </div>
    <BaseSelect v-model="estado" label="Estado" :options="opcionesEstado" placeholder="Todas" />
    <div class="filters__actions">
      <BaseButton variant="outline" icon="refresh" @click="emit('limpiar')">
        Limpiar filtros
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.filters {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(160px, 1fr) auto;
  align-items: end;
  gap: var(--space-3);
}

@media (max-width: 768px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
