<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/icons/AppIcon.vue'

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
})

const emit = defineEmits(['change'])

const paginas = computed(() => Array.from({ length: props.totalPages }, (_, i) => i + 1))
</script>

<template>
  <nav class="pagination" aria-label="Paginación">
    <button
      type="button"
      class="pagination__btn"
      :disabled="page <= 1"
      aria-label="Página anterior"
      @click="emit('change', page - 1)"
    >
      <AppIcon name="chevron-left" :size="16" />
    </button>
    <button
      v-for="n in paginas"
      :key="n"
      type="button"
      class="pagination__btn"
      :class="{ 'is-active': n === page }"
      :aria-current="n === page ? 'page' : undefined"
      @click="emit('change', n)"
    >
      {{ n }}
    </button>
    <button
      type="button"
      class="pagination__btn"
      :disabled="page >= totalPages"
      aria-label="Página siguiente"
      @click="emit('change', page + 1)"
    >
      <AppIcon name="chevron-right" :size="16" />
    </button>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  gap: var(--space-3);
}

.pagination__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  height: 38px;
  padding: 0 var(--space-2);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  color: var(--color-label);
  cursor: pointer;
}

.pagination__btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination__btn.is-active {
  color: #fff;
  font-weight: 600;
  background: var(--color-primary);
  border-color: var(--color-primary);
}
</style>
