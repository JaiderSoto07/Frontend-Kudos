<script setup>
import { computed, reactive, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import {
  LIMITES_NOMBRE,
  MENSAJES_ORGANIZACION,
  validarNombre,
} from '../utils/organizacionValidations'

const props = defineProps({
  abierto: { type: Boolean, required: true },
  tipo: { type: String, required: true, validator: (v) => ['facultad', 'programa'].includes(v) },
  elemento: { type: Object, default: null },
  existentes: { type: Array, default: () => [] },
  facultades: { type: Array, default: () => [] },
  guardar: { type: Function, required: true },
})

const emit = defineEmits(['cerrar', 'guardado'])

const formulario = reactive({ nombre: '', idFacultad: '' })
const errores = ref({})
const errorServidor = ref('')
const guardando = ref(false)

const editando = computed(() => props.elemento != null)
const etiqueta = computed(() => (props.tipo === 'facultad' ? 'Facultad' : 'Programa'))
const titulo = computed(() => {
  if (editando.value) return `Editar ${etiqueta.value}`
  return props.tipo === 'facultad' ? 'Nueva Facultad' : 'Nuevo Programa'
})
const pideFacultad = computed(() => props.tipo === 'programa' && !editando.value)
const opcionesFacultad = computed(() =>
  props.facultades
    .filter((f) => f.estado !== 'INACTIVA')
    .map((f) => ({ value: f.id, label: f.nombre })),
)

watch(
  () => props.abierto,
  (abierto) => {
    if (!abierto) return
    formulario.nombre = props.elemento?.nombre ?? ''
    formulario.idFacultad = ''
    errores.value = {}
    errorServidor.value = ''
  },
)

async function enviar() {
  errorServidor.value = ''
  const errorNombre = validarNombre(
    formulario.nombre,
    props.tipo,
    props.existentes,
    props.elemento?.id ?? null,
  )
  errores.value = errorNombre ? { nombre: errorNombre } : {}
  if (pideFacultad.value && !formulario.idFacultad) {
    errores.value.idFacultad = MENSAJES_ORGANIZACION.facultadRequerida
  }
  if (Object.keys(errores.value).length) return

  guardando.value = true
  try {
    await props.guardar({ ...formulario })
    emit('guardado')
  } catch (e) {
    errorServidor.value = e.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <BaseModal :open="abierto" :title="titulo" :persistent="guardando" @close="emit('cerrar')">
    <form id="formulario-organizacion" class="formulario" novalidate @submit.prevent="enviar">
      <div>
        <label for="organizacion-nombre" class="field-label">Nombre</label>
        <input
          id="organizacion-nombre"
          v-model="formulario.nombre"
          class="input"
          :maxlength="LIMITES_NOMBRE[tipo].maximo"
          :aria-invalid="errores.nombre ? 'true' : undefined"
        />
        <p v-if="errores.nombre" class="field-error">{{ errores.nombre }}</p>
      </div>
      <BaseSelect
        v-if="pideFacultad"
        v-model="formulario.idFacultad"
        class="formulario__facultad"
        label="Facultad"
        placeholder="Elige la Facultad"
        :options="opcionesFacultad"
        :error="errores.idFacultad"
      />
      <p v-if="errorServidor" class="formulario__error" role="alert">{{ errorServidor }}</p>
    </form>
    <template #footer>
      <BaseButton variant="outline" :disabled="guardando" @click="emit('cerrar')"
        >Cancelar</BaseButton
      >
      <BaseButton type="submit" form="formulario-organizacion" :loading="guardando"
        >Guardar</BaseButton
      >
    </template>
  </BaseModal>
</template>

<style scoped>
.formulario {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.formulario__error {
  font-size: var(--text-sm);
  color: var(--color-danger);
}
</style>
