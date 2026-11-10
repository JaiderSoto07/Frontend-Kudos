<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useSesionStore } from '@/stores/sesionStore'
import CalificacionEstrellas from '../components/CalificacionEstrellas.vue'
import ConversacionArbol from '../components/ConversacionArbol.vue'
import ValoracionesResumen from '../components/ValoracionesResumen.vue'
import { conversacionService } from '../services/conversacionService'
import { kudoService } from '../services/kudoService'
import { formatFechaHora } from '../utils/kudoUtils'

const props = defineProps({
  id: { type: String, required: true },
})

const sesion = useSesionStore()
const kudo = ref(null)
const valoraciones = ref(null)
const error = ref('')
const errorCalificacion = ref('')
const calificando = ref(false)

const idUsuario = computed(() => sesion.usuario?.id ?? '')
const abierto = computed(() => kudo.value?.estado !== 'VETADO')
const puedeCalificar = computed(() => abierto.value && kudo.value?.idAutor !== idUsuario.value)

async function cargarValoraciones() {
  valoraciones.value = await conversacionService.valoracionesKudo(props.id)
}

async function calificar(estrellas) {
  calificando.value = true
  errorCalificacion.value = ''
  try {
    await conversacionService.calificarKudo(props.id, estrellas)
    await cargarValoraciones()
  } catch (e) {
    errorCalificacion.value = e.message
  } finally {
    calificando.value = false
  }
}

onMounted(async () => {
  try {
    kudo.value = await kudoService.obtener(props.id)
    await cargarValoraciones()
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

    <template v-else-if="kudo">
      <BaseCard class="detalle-kudo__tarjeta">
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
        </dl>
      </BaseCard>

      <BaseCard v-if="valoraciones" class="detalle-kudo__valoraciones">
        <h2 class="detalle-kudo__subtitulo">Valoraciones</h2>
        <ValoracionesResumen :valoraciones="valoraciones" />
        <CalificacionEstrellas
          v-if="puedeCalificar"
          :valor="valoraciones.miCalificacion"
          :deshabilitado="calificando"
          @calificar="calificar"
        />
        <p v-else-if="abierto" class="detalle-kudo__nota">
          No puedes calificar un Kudo que tú escribiste.
        </p>
        <p v-if="errorCalificacion" class="detalle-kudo__error" role="alert">
          {{ errorCalificacion }}
        </p>
      </BaseCard>

      <ConversacionArbol :id-kudo="id" :id-usuario="idUsuario" :abierta="abierto" />
    </template>
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

.detalle-kudo__tarjeta,
.detalle-kudo__valoraciones {
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

.detalle-kudo__subtitulo {
  font-size: var(--text-lg);
  font-weight: 700;
}

.detalle-kudo__fecha,
.detalle-kudo__nota {
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

.detalle-kudo__error {
  font-size: var(--text-sm);
  color: var(--color-danger);
}
</style>
