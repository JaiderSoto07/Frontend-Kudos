<script setup>
import { reactive, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { moderacionService } from '../services/moderacionService'
import {
  LIMITE_DESCRIPCION,
  MOTIVOS_REPORTE,
  nombreTipoEnFrase,
  validarReporte,
} from '../utils/moderacionUtils'

const props = defineProps({
  contenido: { type: Object, default: null },
})

const emit = defineEmits(['cerrar', 'reportado'])

const formulario = reactive({ motivo: '', descripcion: '' })
const errores = ref({})
const errorServidor = ref('')
const guardando = ref(false)

watch(
  () => props.contenido,
  () => {
    Object.assign(formulario, { motivo: '', descripcion: '' })
    errores.value = {}
    errorServidor.value = ''
  },
)

async function reportar() {
  errorServidor.value = ''
  errores.value = validarReporte(formulario)
  if (Object.keys(errores.value).length) return

  guardando.value = true
  try {
    await moderacionService.reportar(props.contenido.tipo, props.contenido.id, { ...formulario })
    emit('reportado')
  } catch (e) {
    errorServidor.value = e.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <BaseModal
    :open="contenido != null"
    :title="`Reportar ${nombreTipoEnFrase(contenido?.tipo)}`"
    :persistent="guardando"
    @close="emit('cerrar')"
  >
    <form id="formulario-reporte" class="reporte" novalidate @submit.prevent="reportar">
      <p>
        Vas a reportar el contenido de <strong>{{ contenido?.nombreAutor }}</strong
        >. Un moderador lo revisará; mientras tanto sigue visible.
      </p>
      <BaseSelect
        v-model="formulario.motivo"
        class="reporte__motivo"
        label="Motivo"
        placeholder="Elige el motivo"
        :options="MOTIVOS_REPORTE"
        :error="errores.motivo"
      />
      <div>
        <label for="reporte-descripcion" class="field-label">
          Descripción {{ formulario.motivo === 'OTRO' ? '' : '(opcional)' }}
        </label>
        <textarea
          id="reporte-descripcion"
          v-model="formulario.descripcion"
          class="input reporte__descripcion"
          rows="4"
          :maxlength="LIMITE_DESCRIPCION"
        />
        <p class="reporte__contador">
          {{ formulario.descripcion.trim().length }} / {{ LIMITE_DESCRIPCION }}
        </p>
        <p v-if="errores.descripcion" class="field-error">{{ errores.descripcion }}</p>
      </div>
      <p v-if="errorServidor" class="reporte__error" role="alert">{{ errorServidor }}</p>
    </form>

    <template #footer>
      <BaseButton variant="outline" :disabled="guardando" @click="emit('cerrar')">
        Cancelar
      </BaseButton>
      <BaseButton type="submit" form="formulario-reporte" danger :loading="guardando">
        Reportar
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.reporte {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.reporte__descripcion {
  height: auto;
  padding: var(--space-3);
  resize: vertical;
}

.reporte__contador {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-align: right;
}

.reporte__error {
  font-size: var(--text-sm);
  color: var(--color-danger);
}
</style>
