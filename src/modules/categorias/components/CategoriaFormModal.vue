<script setup>
import { computed, reactive, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { useCategoriaStore } from '../stores/categoriaStore'
import { LIMITES, validarCategoria } from '../utils/categoriaValidations'

const store = useCategoriaStore()

const formulario = reactive({ id: null, nombre: '', descripcion: '' })
const errores = ref({})
const errorServidor = ref('')
const guardando = ref(false)

const editando = computed(() => store.modal.categoria != null)
const titulo = computed(() => (editando.value ? 'Editar categoría' : 'Nueva categoría'))

watch(
  () => store.modal.abierto,
  (abierto) => {
    if (!abierto) return
    const categoria = store.modal.categoria
    Object.assign(formulario, {
      id: categoria?.id ?? null,
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    })
    errores.value = {}
    errorServidor.value = ''
  },
)

async function guardar() {
  errorServidor.value = ''
  errores.value = validarCategoria(formulario, store.categorias)
  if (Object.keys(errores.value).length) return

  guardando.value = true
  try {
    await store.guardar({ ...formulario })
    store.cerrarModal()
  } catch (e) {
    errorServidor.value = e.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <BaseModal
    :open="store.modal.abierto"
    :title="titulo"
    :persistent="guardando"
    @close="store.cerrarModal()"
  >
    <form id="formulario-categoria" class="formulario" novalidate @submit.prevent="guardar">
      <div>
        <label for="categoria-nombre" class="field-label">Nombre</label>
        <input
          id="categoria-nombre"
          v-model="formulario.nombre"
          class="input"
          :maxlength="LIMITES.nombre.maximo"
          :aria-invalid="errores.nombre ? 'true' : undefined"
        />
        <p v-if="errores.nombre" class="field-error">{{ errores.nombre }}</p>
      </div>

      <div>
        <label for="categoria-descripcion" class="field-label">Descripción</label>
        <textarea
          id="categoria-descripcion"
          v-model="formulario.descripcion"
          class="input formulario__descripcion"
          rows="4"
          :maxlength="LIMITES.descripcion.maximo"
          :aria-invalid="errores.descripcion ? 'true' : undefined"
        />
        <p class="formulario__contador">
          {{ formulario.descripcion.trim().length }} / {{ LIMITES.descripcion.maximo }}
        </p>
        <p v-if="errores.descripcion" class="field-error">{{ errores.descripcion }}</p>
      </div>

      <p v-if="errorServidor" class="formulario__error" role="alert">{{ errorServidor }}</p>
    </form>

    <template #footer>
      <BaseButton variant="outline" :disabled="guardando" @click="store.cerrarModal()">
        Cancelar
      </BaseButton>
      <BaseButton type="submit" form="formulario-categoria" :loading="guardando">
        Guardar
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.formulario {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.formulario__descripcion {
  height: auto;
  padding: var(--space-3);
  resize: vertical;
}

.formulario__contador {
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  text-align: right;
  color: var(--color-text-muted);
}

.formulario__error {
  padding: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-danger);
  background: var(--color-primary-soft);
  border-radius: var(--radius-sm);
}
</style>
