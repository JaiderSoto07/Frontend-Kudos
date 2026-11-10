<script setup>
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useSesionStore } from '@/stores/sesionStore'
import KudoCard from '../components/KudoCard.vue'
import { kudoService } from '../services/kudoService'

const props = defineProps({
  id: { type: String, default: '' },
})

const TIPOS = [
  { valor: 'recibidos', etiqueta: 'Recibidos' },
  { valor: 'emitidos', etiqueta: 'Emitidos' },
]

const sesion = useSesionStore()
const tipo = ref('recibidos')
const kudos = ref([])
const error = ref('')

const idPersona = computed(() => props.id || sesion.usuario?.id)
const propio = computed(() => idPersona.value === sesion.usuario?.id)
const nombre = computed(() => {
  if (propio.value) return 'Mis Kudos'
  const kudo = kudos.value[0]
  if (!kudo) return 'Kudos de la persona'
  return `Kudos de ${kudo.idDestinatario === idPersona.value ? kudo.nombreDestinatario : kudo.nombreAutor}`
})

async function cargar() {
  error.value = ''
  try {
    kudos.value = await kudoService.historial(idPersona.value, tipo.value)
  } catch (e) {
    error.value = e.message
  }
}

watch(tipo, cargar)

watch(
  idPersona,
  () => {
    if (tipo.value === 'recibidos') cargar()
    else tipo.value = 'recibidos'
  },
  { immediate: true },
)
</script>

<template>
  <section class="historial">
    <PageHeader :title="nombre" subtitle="Reconocimientos recibidos y emitidos." />
    <div class="historial__pestanas" role="tablist">
      <BaseButton
        v-for="opcion in TIPOS"
        :key="opcion.valor"
        :variant="tipo === opcion.valor ? 'primary' : 'outline'"
        role="tab"
        :aria-selected="tipo === opcion.valor"
        :class="`historial__pestana-${opcion.valor}`"
        @click="tipo = opcion.valor"
      >
        {{ opcion.etiqueta }}
      </BaseButton>
    </div>
    <EmptyState
      v-if="error"
      icon="alert"
      title="No fue posible cargar el historial"
      :description="error"
    />
    <EmptyState v-else-if="!kudos.length" icon="star" :title="`Sin Kudos ${tipo}`" />
    <template v-else>
      <KudoCard v-for="kudo in kudos" :key="kudo.id" :kudo="kudo" />
    </template>
  </section>
</template>

<style scoped>
.historial {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.historial__pestanas {
  display: flex;
  gap: var(--space-2);
}
</style>
