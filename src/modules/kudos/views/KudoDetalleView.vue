<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import DecisionModal from '@/modules/moderacion/components/DecisionModal.vue'
import ReportarModal from '@/modules/moderacion/components/ReportarModal.vue'
import { TIPO_CONTENIDO } from '@/modules/moderacion/utils/moderacionUtils'
import { ROLES_MODERADORES } from '@/shared/domain/cuenta'
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
const reportando = ref(null)
const decision = ref(null)
const aviso = ref('')

const idUsuario = computed(() => sesion.usuario?.id ?? '')
const esModerador = computed(() => sesion.tieneRol(ROLES_MODERADORES))
const abierto = computed(() => kudo.value?.estado !== 'VETADO')
const esPropio = computed(() => kudo.value?.idAutor === idUsuario.value)
const puedeCalificar = computed(() => abierto.value && !esPropio.value)

const contenidoKudo = () => ({
  tipo: TIPO_CONTENIDO.KUDO,
  id: props.id,
  nombreAutor: kudo.value.nombreAutor,
})

function reportado() {
  reportando.value = null
  aviso.value = 'Tu reporte quedó registrado. Un moderador lo revisará.'
}

async function vetado() {
  decision.value = null
  aviso.value = 'El Kudo quedó vetado y se avisó a su autor.'
  kudo.value = await kudoService.obtener(props.id)
}

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
        <p v-if="kudo.vetado" class="detalle-kudo__vetado" role="status">
          Este Kudo fue vetado por moderación. Su conversación se conserva, pero ya no admite
          réplicas, calificaciones ni reportes.
        </p>
        <p
          class="detalle-kudo__contenido"
          :class="{ 'detalle-kudo__contenido--vetado': kudo.vetado }"
        >
          {{ kudo.contenido }}
        </p>
        <dl class="detalle-kudo__datos">
          <dt>Visualizaciones</dt>
          <dd>{{ kudo.cantidadVisualizaciones }}</dd>
        </dl>
        <div v-if="abierto && (!esPropio || esModerador)" class="detalle-kudo__acciones">
          <BaseButton
            v-if="!esPropio"
            variant="outline"
            icon="flag"
            class="detalle-kudo__reportar"
            @click="reportando = contenidoKudo()"
          >
            Reportar
          </BaseButton>
          <BaseButton
            v-if="esModerador"
            danger
            class="detalle-kudo__vetar"
            @click="decision = { accion: 'vetar', ...contenidoKudo() }"
          >
            Vetar
          </BaseButton>
        </div>
        <p v-if="aviso" class="detalle-kudo__aviso" role="status">{{ aviso }}</p>
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

      <ConversacionArbol
        :id-kudo="id"
        :id-usuario="idUsuario"
        :abierta="abierto"
        :moderador="esModerador"
      />
    </template>

    <ReportarModal :contenido="reportando" @cerrar="reportando = null" @reportado="reportado" />
    <DecisionModal :decision="decision" @cerrar="decision = null" @decidido="vetado" />
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

.detalle-kudo__vetado {
  padding: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
}

.detalle-kudo__contenido--vetado {
  font-style: italic;
  color: var(--color-text-muted);
}

.detalle-kudo__acciones {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.detalle-kudo__aviso {
  font-size: var(--text-sm);
  color: var(--color-success);
}
</style>
