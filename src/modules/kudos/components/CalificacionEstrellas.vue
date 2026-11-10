<script setup>
import AppIcon from '@/components/icons/AppIcon.vue'
import { ESTRELLAS } from '../utils/kudoUtils'

defineProps({
  valor: { type: Number, default: 0 },
  deshabilitado: { type: Boolean, default: false },
})

const emit = defineEmits(['calificar'])
</script>

<template>
  <div class="estrellas" role="group" aria-label="Tu calificación">
    <button
      v-for="estrella in ESTRELLAS"
      :key="estrella"
      type="button"
      class="estrellas__boton"
      :class="{ 'estrellas__boton--activa': estrella <= valor }"
      :aria-label="`Calificar con ${estrella} de 5 estrellas`"
      :aria-pressed="estrella === valor"
      :disabled="deshabilitado"
      @click="emit('calificar', estrella)"
    >
      <AppIcon name="star" :size="22" />
    </button>
    <span class="estrellas__texto">
      {{ valor ? `Tu calificación: ${valor} de 5` : 'Aún no calificas' }}
    </span>
  </div>
</template>

<style scoped>
.estrellas {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
}

.estrellas__boton {
  display: inline-flex;
  padding: var(--space-1);
  color: var(--color-text-muted);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.estrellas__boton--activa {
  color: var(--color-primary);
}

.estrellas__boton:disabled {
  cursor: progress;
}

.estrellas__texto {
  margin-left: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
</style>
