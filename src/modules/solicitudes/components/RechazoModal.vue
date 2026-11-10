<script setup>
import { ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { useSolicitudStore } from '../stores/solicitudStore'
import { LIMITES_MOTIVO, validarMotivo } from '../utils/solicitudValidations'

const props = defineProps({
  solicitud: { type: Object, default: null },
})

const emit = defineEmits(['cerrar', 'rechazada'])

const store = useSolicitudStore()
const motivo = ref('')
const errorCampo = ref('')
const errorServidor = ref('')
const guardando = ref(false)

watch(
  () => props.solicitud,
  () => {
    motivo.value = ''
    errorCampo.value = ''
    errorServidor.value = ''
  },
)

async function rechazar() {
  errorServidor.value = ''
  errorCampo.value = validarMotivo(motivo.value)
  if (errorCampo.value) return

  guardando.value = true
  try {
    await store.rechazar(props.solicitud, motivo.value)
    emit('rechazada', props.solicitud)
  } catch (e) {
    errorServidor.value = e.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <BaseModal
    :open="solicitud != null"
    title="Rechazar solicitud"
    :persistent="guardando"
    @close="emit('cerrar')"
  >
    <form id="formulario-rechazo" class="rechazo" novalidate @submit.prevent="rechazar">
      <p>
        Vas a rechazar la solicitud de <strong>{{ solicitud?.nombreSolicitante }}</strong
        >. La persona verá el motivo y podrá enviar una nueva solicitud.
      </p>
      <div>
        <label for="motivo-rechazo" class="field-label">Motivo</label>
        <textarea
          id="motivo-rechazo"
          v-model="motivo"
          class="input rechazo__motivo"
          rows="4"
          :maxlength="LIMITES_MOTIVO.maximo"
          :aria-invalid="errorCampo ? 'true' : undefined"
        />
        <p class="rechazo__contador">{{ motivo.trim().length }} / {{ LIMITES_MOTIVO.maximo }}</p>
        <p v-if="errorCampo" class="field-error">{{ errorCampo }}</p>
      </div>
      <p v-if="errorServidor" class="rechazo__error" role="alert">{{ errorServidor }}</p>
    </form>

    <template #footer>
      <BaseButton variant="outline" :disabled="guardando" @click="emit('cerrar')">
        Cancelar
      </BaseButton>
      <BaseButton type="submit" form="formulario-rechazo" danger :loading="guardando">
        Rechazar
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.rechazo {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.rechazo__motivo {
  height: auto;
  padding: var(--space-3);
  resize: vertical;
}

.rechazo__contador {
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  text-align: right;
  color: var(--color-text-muted);
}

.rechazo__error {
  font-size: var(--text-sm);
  color: var(--color-danger);
}
</style>
