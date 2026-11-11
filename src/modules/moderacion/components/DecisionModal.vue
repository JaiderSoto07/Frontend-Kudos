<script setup>
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { moderacionService } from '../services/moderacionService'
import { LIMITES_DECISION, nombreTipoEnFrase, validarDecision } from '../utils/moderacionUtils'

const props = defineProps({
  decision: { type: Object, default: null },
})

const emit = defineEmits(['cerrar', 'decidido'])

const motivo = ref('')
const errorCampo = ref('')
const errorServidor = ref('')
const guardando = ref(false)

const esVeto = computed(() => props.decision?.accion === 'vetar')
const titulo = computed(
  () => `${esVeto.value ? 'Vetar' : 'Liberar'} ${nombreTipoEnFrase(props.decision?.tipo)}`,
)

watch(
  () => props.decision,
  () => {
    motivo.value = ''
    errorCampo.value = ''
    errorServidor.value = ''
  },
)

async function decidir() {
  errorServidor.value = ''
  errorCampo.value = validarDecision(motivo.value)
  if (errorCampo.value) return

  guardando.value = true
  try {
    const operacion = esVeto.value ? moderacionService.vetar : moderacionService.liberar
    await operacion(props.decision.tipo, props.decision.id, motivo.value)
    emit('decidido', esVeto.value)
  } catch (e) {
    errorServidor.value = e.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <BaseModal
    :open="decision != null"
    :title="titulo"
    :persistent="guardando"
    @close="emit('cerrar')"
  >
    <form id="formulario-decision" class="decision" novalidate @submit.prevent="decidir">
      <p v-if="esVeto">
        El contenido de <strong>{{ decision?.nombreAutor }}</strong> dejará de mostrarse, ya no
        admitirá réplicas, calificaciones ni reportes, y su autor recibirá un aviso con el motivo.
        Esta decisión no se puede deshacer.
      </p>
      <p v-else>
        El contenido de <strong>{{ decision?.nombreAutor }}</strong> vuelve a quedar visible y se
        avisa a quienes lo reportaron.
      </p>
      <div>
        <label for="motivo-decision" class="field-label">Motivo</label>
        <textarea
          id="motivo-decision"
          v-model="motivo"
          class="input decision__motivo"
          rows="4"
          :maxlength="LIMITES_DECISION.maximo"
        />
        <p class="decision__contador">{{ motivo.trim().length }} / {{ LIMITES_DECISION.maximo }}</p>
        <p v-if="errorCampo" class="field-error">{{ errorCampo }}</p>
      </div>
      <p v-if="errorServidor" class="decision__error" role="alert">{{ errorServidor }}</p>
    </form>

    <template #footer>
      <BaseButton variant="outline" :disabled="guardando" @click="emit('cerrar')">
        Cancelar
      </BaseButton>
      <BaseButton type="submit" form="formulario-decision" :danger="esVeto" :loading="guardando">
        {{ esVeto ? 'Vetar' : 'Liberar' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.decision {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.decision__motivo {
  height: auto;
  padding: var(--space-3);
  resize: vertical;
}

.decision__contador {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-align: right;
}

.decision__error {
  font-size: var(--text-sm);
  color: var(--color-danger);
}
</style>
