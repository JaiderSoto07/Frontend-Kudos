<script setup>
import { computed } from 'vue'
import { ESTRELLAS, formatPromedio, porcentaje } from '../utils/kudoUtils'

const props = defineProps({
  valoraciones: { type: Object, required: true },
})

const filas = computed(() =>
  [...ESTRELLAS].reverse().map((estrella) => {
    const cantidad = props.valoraciones.distribucion[estrella - 1] ?? 0
    return { estrella, cantidad, ancho: porcentaje(cantidad, props.valoraciones.cantidad) }
  }),
)
</script>

<template>
  <div class="valoraciones">
    <p class="valoraciones__promedio">
      <strong>{{ formatPromedio(valoraciones.promedio) }}</strong> de 5
      <span>
        ({{ valoraciones.cantidad }}
        {{ valoraciones.cantidad === 1 ? 'calificación' : 'calificaciones' }})
      </span>
    </p>
    <ul class="valoraciones__distribucion">
      <li v-for="fila in filas" :key="fila.estrella" class="valoraciones__fila">
        <span>{{ fila.estrella }} ★</span>
        <span class="valoraciones__barra">
          <span class="valoraciones__relleno" :style="{ width: `${fila.ancho}%` }" />
        </span>
        <span class="valoraciones__cantidad">{{ fila.cantidad }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.valoraciones {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.valoraciones__promedio strong {
  font-size: var(--text-xl);
}

.valoraciones__promedio span {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.valoraciones__distribucion {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  max-width: 320px;
  padding: 0;
  list-style: none;
}

.valoraciones__fila {
  display: grid;
  grid-template-columns: 2.5rem 1fr 2rem;
  gap: var(--space-2);
  align-items: center;
  font-size: var(--text-sm);
}

.valoraciones__barra {
  height: 8px;
  overflow: hidden;
  background: var(--color-primary-soft);
  border-radius: var(--radius-sm);
}

.valoraciones__relleno {
  display: block;
  height: 100%;
  background: var(--color-primary);
}

.valoraciones__cantidad {
  text-align: right;
  color: var(--color-text-muted);
}
</style>
