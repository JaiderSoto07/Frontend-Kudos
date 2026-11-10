<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { kudoService } from '../services/kudoService'
import { formatFechaHora, formatPromedio } from '../utils/kudoUtils'

const props = defineProps({
  id: { type: String, required: true },
})

const kudo = ref(null)
const error = ref('')

onMounted(async () => {
  try {
    kudo.value = await kudoService.obtener(props.id)
  } catch (e) {
    error.value = e.message
  }
})
</script>

<template>
  <section class="detalle-kudo">
    <RouterLink :to="{ name: 'inicio' }" class="detalle-kudo__volver">← Volver al muro</RouterLink>
    <EmptyState
      v-if="error"
      icon="alert"
      title="No fue posible abrir el Kudo"
      :description="error"
    />

    <BaseCard v-else-if="kudo" class="detalle-kudo__tarjeta">
      <p class="detalle-kudo__categoria">{{ kudo.nombreCategoria }}</p>
      <h1 class="detalle-kudo__titulo">
        <RouterLink :to="{ name: 'historial-kudos', params: { id: kudo.idAutor } }">{{
          kudo.nombreAutor
        }}</RouterLink>
        reconoce a
        <RouterLink :to="{ name: 'historial-kudos', params: { id: kudo.idDestinatario } }">{{
          kudo.nombreDestinatario
        }}</RouterLink>
      </h1>
      <p class="detalle-kudo__fecha">{{ formatFechaHora(kudo.fechaCreacion) }}</p>
      <p class="detalle-kudo__contenido">{{ kudo.contenido }}</p>
      <dl class="detalle-kudo__datos">
        <dt>Visualizaciones</dt>
        <dd>{{ kudo.cantidadVisualizaciones }}</dd>
        <dt>Calificación</dt>
        <dd>
          {{ formatPromedio(kudo.promedioCalificacion) }} de 5 ({{
            kudo.cantidadCalificaciones
          }}
          calificaciones)
        </dd>
      </dl>
    </BaseCard>
  </section>
</template>

<style scoped>
.detalle-kudo {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.detalle-kudo__volver,
.detalle-kudo__titulo a {
  font-weight: 600;
  color: var(--color-primary);
}

.detalle-kudo__tarjeta {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.detalle-kudo__categoria {
  font-size: var(--text-sm);
  color: var(--color-label);
}

.detalle-kudo__titulo {
  font-size: var(--text-xl);
  font-weight: 700;
}

.detalle-kudo__fecha {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.detalle-kudo__contenido {
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.detalle-kudo__datos {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
}

.detalle-kudo__datos dt {
  font-weight: 600;
  color: var(--color-label);
}
</style>
