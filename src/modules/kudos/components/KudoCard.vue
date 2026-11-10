<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/icons/AppIcon.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { esLargo, formatFechaHora, formatPromedio, resumen } from '../utils/kudoUtils'

const props = defineProps({
  kudo: { type: Object, required: true },
})

const expandido = ref(false)
const largo = computed(() => esLargo(props.kudo.contenido))
const texto = computed(() =>
  expandido.value || !largo.value ? props.kudo.contenido : resumen(props.kudo.contenido),
)
</script>

<template>
  <BaseCard class="kudo">
    <header class="kudo__encabezado">
      <p class="kudo__personas">
        <RouterLink
          :to="{ name: 'historial-kudos', params: { id: kudo.idAutor } }"
          class="kudo__persona"
        >
          {{ kudo.nombreAutor }}
        </RouterLink>
        <AppIcon name="arrows" :size="16" />
        <RouterLink
          :to="{ name: 'historial-kudos', params: { id: kudo.idDestinatario } }"
          class="kudo__persona"
        >
          {{ kudo.nombreDestinatario }}
        </RouterLink>
      </p>
      <span class="kudo__categoria">{{ kudo.nombreCategoria }}</span>
    </header>

    <p class="kudo__contenido">{{ texto }}</p>
    <button v-if="largo" type="button" class="kudo__ver-mas" @click="expandido = !expandido">
      {{ expandido ? 'Ver menos' : 'Ver más' }}
    </button>

    <footer class="kudo__pie">
      <span>{{ formatFechaHora(kudo.fechaCreacion) }}</span>
      <span
        ><AppIcon name="star" :size="14" /> {{ formatPromedio(kudo.promedioCalificacion) }} ({{
          kudo.cantidadCalificaciones
        }})</span
      >
      <span>{{ kudo.cantidadVisualizaciones }} visualizaciones</span>
      <RouterLink :to="{ name: 'kudo-detalle', params: { id: kudo.id } }" class="kudo__detalle">
        Abrir
      </RouterLink>
    </footer>
  </BaseCard>
</template>

<style scoped>
.kudo {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.kudo__encabezado {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.kudo__personas {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 600;
}

.kudo__persona,
.kudo__detalle {
  color: var(--color-primary);
}

.kudo__categoria {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
  background: var(--color-primary-soft);
  border-radius: var(--radius-sm);
}

.kudo__contenido {
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.kudo__ver-mas {
  align-self: flex-start;
  padding: 0;
  font-weight: 600;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
}

.kudo__pie {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.kudo__detalle {
  margin-left: auto;
  font-weight: 600;
}
</style>
