<script setup>
import { computed, watch } from 'vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { nombreRol } from '@/shared/domain/cuenta'
import { necesitaFacultad, necesitaPrograma } from '../utils/identidadValidations'

const rol = defineModel('rol', { type: String, default: '' })
const idPrograma = defineModel('idPrograma', { type: String, default: '' })
const idFacultad = defineModel('idFacultad', { type: String, default: '' })

const props = defineProps({
  opciones: { type: Object, required: true },
  errores: { type: Object, default: () => ({}) },
  disabled: { type: Boolean, default: false },
})

const opcionesRol = computed(() =>
  props.opciones.roles.map((valor) => ({ value: valor, label: nombreRol(valor) })),
)
const opcionesPrograma = computed(() =>
  props.opciones.programas.map((p) => ({
    value: p.id,
    label: `${p.nombre} · ${p.nombreFacultad}`,
  })),
)
const opcionesFacultad = computed(() =>
  props.opciones.facultades.map((f) => ({ value: f.id, label: f.nombre })),
)

watch(rol, () => {
  idPrograma.value = ''
  idFacultad.value = ''
})
</script>

<template>
  <BaseSelect
    v-model="rol"
    class="campo-rol"
    label="Rol que solicitas"
    placeholder="Elige un rol"
    :options="opcionesRol"
    :disabled="disabled"
    :error="errores.rol"
  />
  <BaseSelect
    v-if="necesitaPrograma(rol)"
    v-model="idPrograma"
    class="campo-programa"
    label="Programa académico"
    placeholder="Elige tu Programa"
    :options="opcionesPrograma"
    :error="errores.idPrograma"
  />
  <BaseSelect
    v-if="necesitaFacultad(rol)"
    v-model="idFacultad"
    class="campo-facultad"
    label="Facultad"
    placeholder="Elige la Facultad"
    :options="opcionesFacultad"
    :error="errores.idFacultad"
  />
</template>
