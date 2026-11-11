<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import DecisionModal from '@/modules/moderacion/components/DecisionModal.vue'
import ReportarModal from '@/modules/moderacion/components/ReportarModal.vue'
import { TIPO_CONTENIDO } from '@/modules/moderacion/utils/moderacionUtils'
import { conversacionService } from '../services/conversacionService'
import ReplicaNodo from './ReplicaNodo.vue'
import ResponderForm from './ResponderForm.vue'

const props = defineProps({
  idKudo: { type: String, required: true },
  idUsuario: { type: String, default: '' },
  abierta: { type: Boolean, default: true },
  moderador: { type: Boolean, default: false },
})

const replicas = ref([])
const cargando = ref(true)
const error = ref('')
const aviso = ref('')
const reportando = ref(null)
const decision = ref(null)

const contenidoReplica = (replica) => ({
  tipo: TIPO_CONTENIDO.REPLICA,
  id: replica.id,
  nombreAutor: replica.nombreAutor,
})

function contar(lista) {
  let total = 0
  for (const replica of lista) total += 1 + contar(replica.respuestas)
  return total
}

const total = computed(() => contar(replicas.value))

async function cargar() {
  error.value = ''
  try {
    replicas.value = await conversacionService.conversacion(props.idKudo)
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

const responderKudo = (texto) => conversacionService.responderKudo(props.idKudo, texto)

async function publicado() {
  await cargar()
  aviso.value = 'Tu réplica quedó publicada en la conversación.'
}

function reportado() {
  reportando.value = null
  aviso.value = 'Tu reporte quedó registrado. Un moderador lo revisará.'
}

async function vetada() {
  decision.value = null
  await cargar()
  aviso.value = 'La réplica quedó vetada y se avisó a su autor.'
}

onMounted(cargar)
</script>

<template>
  <BaseCard class="conversacion">
    <h2 class="conversacion__titulo">Conversación ({{ total }})</h2>

    <ResponderForm
      v-if="abierta"
      class="conversacion__responder"
      :publicar="responderKudo"
      etiqueta="Responder al Kudo"
      @publicado="publicado"
    />
    <p v-else class="conversacion__cerrada" role="status">
      La conversación está cerrada porque el Kudo fue vetado por moderación.
    </p>
    <p v-if="aviso" class="conversacion__aviso" role="status">{{ aviso }}</p>

    <p v-if="cargando" class="conversacion__estado" role="status">Cargando la conversación…</p>
    <p v-else-if="error" class="conversacion__error" role="alert">{{ error }}</p>
    <p v-else-if="!replicas.length" class="conversacion__estado">
      Aún no hay réplicas. Sé el primero en responder.
    </p>
    <ReplicaNodo
      v-for="replica in replicas"
      v-else
      :key="replica.id"
      :replica="replica"
      :id-usuario="idUsuario"
      :abierta="abierta"
      :moderador="moderador"
      @actualizado="cargar"
      @reportar="reportando = contenidoReplica($event)"
      @vetar="decision = { accion: 'vetar', ...contenidoReplica($event) }"
    />

    <ReportarModal :contenido="reportando" @cerrar="reportando = null" @reportado="reportado" />
    <DecisionModal :decision="decision" @cerrar="decision = null" @decidido="vetada" />
  </BaseCard>
</template>

<style scoped>
.conversacion {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.conversacion__titulo {
  font-size: var(--text-lg);
  font-weight: 700;
}

.conversacion__estado,
.conversacion__cerrada {
  color: var(--color-text-muted);
}

.conversacion__aviso {
  padding: var(--space-2) var(--space-3);
  color: var(--color-success);
  background: var(--color-success-soft);
  border-radius: var(--radius-sm);
}

.conversacion__error {
  color: var(--color-danger);
}
</style>
