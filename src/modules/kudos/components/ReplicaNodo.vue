<script setup>
import { computed, ref } from 'vue'
import AppIcon from '@/components/icons/AppIcon.vue'
import { conversacionService } from '../services/conversacionService'
import { conSangria, formatFechaHora, formatPromedio } from '../utils/kudoUtils'
import CalificacionEstrellas from './CalificacionEstrellas.vue'
import ReplicaNodo from './ReplicaNodo.vue'
import ResponderForm from './ResponderForm.vue'

const props = defineProps({
  replica: { type: Object, required: true },
  nivel: { type: Number, default: 0 },
  nombrePadre: { type: String, default: '' },
  idUsuario: { type: String, default: '' },
  abierta: { type: Boolean, default: true },
  moderador: { type: Boolean, default: false },
})

const emit = defineEmits(['actualizado', 'reportar', 'vetar'])

const expandido = ref(true)
const respondiendo = ref(false)
const calificando = ref(false)
const miCalificacion = ref(0)
const guardando = ref(false)
const error = ref('')

const admiteInteraccion = computed(() => props.abierta && !props.replica.vetada)
const esPropia = computed(() => props.replica.idAutor === props.idUsuario)
const mostrarRespuestaA = computed(() => props.nivel > 0 && !conSangria(props.nivel - 1))
const cantidadRespuestas = computed(() => props.replica.respuestas.length)

const responder = (texto) => conversacionService.responderReplica(props.replica.id, texto)

function publicado() {
  respondiendo.value = false
  expandido.value = true
  emit('actualizado')
}

async function abrirCalificacion() {
  calificando.value = !calificando.value
  if (!calificando.value) return
  error.value = ''
  try {
    miCalificacion.value = (
      await conversacionService.valoracionesReplica(props.replica.id)
    ).miCalificacion
  } catch (e) {
    error.value = e.message
  }
}

async function calificar(estrellas) {
  guardando.value = true
  error.value = ''
  try {
    await conversacionService.calificarReplica(props.replica.id, estrellas)
    miCalificacion.value = estrellas
    emit('actualizado')
  } catch (e) {
    error.value = e.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <article class="replica" :class="{ 'replica--vetada': replica.vetada }">
    <header class="replica__encabezado">
      <strong>{{ replica.nombreAutor }}</strong>
      <span class="replica__fecha">{{ formatFechaHora(replica.fechaCreacion) }}</span>
      <span v-if="mostrarRespuestaA && nombrePadre" class="replica__respuesta-a">
        en respuesta a {{ nombrePadre }}
      </span>
    </header>

    <p class="replica__contenido">{{ replica.contenido }}</p>

    <footer class="replica__pie">
      <span v-if="!replica.vetada">
        <AppIcon name="star" :size="14" /> {{ formatPromedio(replica.promedioCalificacion) }} ({{
          replica.cantidadCalificaciones
        }})
      </span>
      <button
        v-if="admiteInteraccion"
        type="button"
        class="replica__accion replica__responder"
        @click="respondiendo = !respondiendo"
      >
        Responder
      </button>
      <button
        v-if="admiteInteraccion && !esPropia"
        type="button"
        class="replica__accion replica__calificar"
        @click="abrirCalificacion"
      >
        Calificar
      </button>
      <button
        v-if="admiteInteraccion && !esPropia"
        type="button"
        class="replica__accion replica__reportar"
        @click="emit('reportar', replica)"
      >
        Reportar
      </button>
      <button
        v-if="moderador && !replica.vetada"
        type="button"
        class="replica__accion replica__accion--peligro replica__vetar"
        @click="emit('vetar', replica)"
      >
        Vetar
      </button>
      <button
        v-if="cantidadRespuestas"
        type="button"
        class="replica__accion replica__alternar"
        :aria-expanded="expandido"
        @click="expandido = !expandido"
      >
        {{
          expandido
            ? 'Ocultar respuestas'
            : `Ver ${cantidadRespuestas} ${cantidadRespuestas === 1 ? 'respuesta' : 'respuestas'}`
        }}
      </button>
    </footer>

    <CalificacionEstrellas
      v-if="calificando"
      :valor="miCalificacion"
      :deshabilitado="guardando"
      @calificar="calificar"
    />
    <p v-if="error" class="replica__error" role="alert">{{ error }}</p>

    <ResponderForm
      v-if="respondiendo"
      :publicar="responder"
      :etiqueta="`Responder a ${replica.nombreAutor}`"
      cancelable
      @cancelar="respondiendo = false"
      @publicado="publicado"
    />

    <div
      v-if="cantidadRespuestas && expandido"
      class="replica__hijas"
      :class="{ 'replica__hijas--sangria': conSangria(nivel) }"
    >
      <ReplicaNodo
        v-for="hija in replica.respuestas"
        :key="hija.id"
        :replica="hija"
        :nivel="nivel + 1"
        :nombre-padre="replica.nombreAutor"
        :id-usuario="idUsuario"
        :abierta="abierta"
        :moderador="moderador"
        @actualizado="emit('actualizado')"
        @reportar="emit('reportar', $event)"
        @vetar="emit('vetar', $event)"
      />
    </div>
  </article>
</template>

<style scoped>
.replica {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3) 0 0;
}

.replica__encabezado {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-2);
}

.replica__fecha,
.replica__respuesta-a {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.replica__contenido {
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.replica--vetada > .replica__contenido {
  font-style: italic;
  color: var(--color-text-muted);
}

.replica__pie {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.replica__accion {
  padding: 0;
  font-weight: 600;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
}

.replica__accion--peligro {
  color: var(--color-danger);
}

.replica__error {
  font-size: var(--text-sm);
  color: var(--color-danger);
}

.replica__hijas--sangria {
  padding-left: var(--space-4);
  border-left: 2px solid var(--color-border);
}
</style>
