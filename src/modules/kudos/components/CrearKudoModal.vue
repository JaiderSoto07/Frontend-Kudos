<script setup>
import { computed, reactive, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { kudoService } from '../services/kudoService'
import { validarKudo } from '../utils/kudoUtils'

const props = defineProps({
  abierto: { type: Boolean, required: true },
})

const emit = defineEmits(['cerrar', 'publicado'])

const formulario = reactive({ busqueda: '', idDestinatario: '', idCategoria: '', contenido: '' })
const personas = ref([])
const categorias = ref([])
const errores = ref({})
const errorServidor = ref('')
const guardando = ref(false)

const opcionesCategoria = computed(() =>
  categorias.value.map((c) => ({ value: c.id, label: c.nombre })),
)
const opcionesPersona = computed(() =>
  personas.value.map((p) => ({ value: p.id, label: `${p.nombre} · ${p.correo}` })),
)

async function buscar() {
  try {
    personas.value = await kudoService.buscarPersonas(formulario.busqueda)
  } catch (e) {
    errorServidor.value = e.message
  }
}

watch(
  () => props.abierto,
  async (abierto) => {
    if (!abierto) return
    Object.assign(formulario, { busqueda: '', idDestinatario: '', idCategoria: '', contenido: '' })
    errores.value = {}
    errorServidor.value = ''
    try {
      categorias.value = await kudoService.categoriasActivas()
      await buscar()
    } catch (e) {
      errorServidor.value = e.message
    }
  },
)

async function publicar() {
  errorServidor.value = ''
  errores.value = validarKudo(formulario)
  if (Object.keys(errores.value).length) return

  guardando.value = true
  try {
    await kudoService.crear({ ...formulario })
    emit('publicado')
  } catch (e) {
    errorServidor.value = e.message
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <BaseModal :open="abierto" title="Dar un Kudo" :persistent="guardando" @close="emit('cerrar')">
    <form id="formulario-kudo" class="kudo-form" novalidate @submit.prevent="publicar">
      <div>
        <label for="kudo-busqueda" class="field-label">Buscar persona</label>
        <div class="kudo-form__busqueda">
          <input
            id="kudo-busqueda"
            v-model="formulario.busqueda"
            class="input"
            placeholder="Nombre o correo"
            @keydown.enter.prevent="buscar"
          />
          <BaseButton variant="outline" icon="search" class="kudo-form__buscar" @click="buscar">
            Buscar
          </BaseButton>
        </div>
      </div>
      <BaseSelect
        v-model="formulario.idDestinatario"
        class="kudo-form__destinatario"
        label="¿A quién reconoces?"
        placeholder="Elige a la persona"
        :options="opcionesPersona"
        :error="errores.idDestinatario"
      />
      <BaseSelect
        v-model="formulario.idCategoria"
        class="kudo-form__categoria"
        label="Categoría"
        placeholder="Elige la categoría"
        :options="opcionesCategoria"
        :error="errores.idCategoria"
      />
      <div>
        <label for="kudo-contenido" class="field-label">Mensaje</label>
        <textarea
          id="kudo-contenido"
          v-model="formulario.contenido"
          class="input kudo-form__contenido"
          rows="6"
        />
        <p v-if="errores.contenido" class="field-error">{{ errores.contenido }}</p>
      </div>
      <p v-if="errorServidor" class="kudo-form__error" role="alert">{{ errorServidor }}</p>
    </form>
    <template #footer>
      <BaseButton variant="outline" :disabled="guardando" @click="emit('cerrar')"
        >Cancelar</BaseButton
      >
      <BaseButton type="submit" form="formulario-kudo" :loading="guardando">Publicar</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.kudo-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.kudo-form__busqueda {
  display: flex;
  gap: var(--space-2);
}

.kudo-form__busqueda .input {
  flex: 1;
}

.kudo-form__contenido {
  height: auto;
  padding: var(--space-3);
  resize: vertical;
}

.kudo-form__error {
  font-size: var(--text-sm);
  color: var(--color-danger);
}
</style>
