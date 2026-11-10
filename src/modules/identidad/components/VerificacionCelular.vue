<script setup>
import { ref } from 'vue'
import AppIcon from '@/components/icons/AppIcon.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useCuentaStore } from '../stores/cuentaStore'
import CambiarCelularForm from './CambiarCelularForm.vue'
import { LIMITES, MENSAJES_FORMULARIO, codigoValido } from '../utils/identidadValidations'

const emit = defineEmits(['verificado'])

const store = useCuentaStore()
const codigo = ref('')
const errorCampo = ref('')
const mensaje = ref({ texto: '', error: false })
const verificando = ref(false)
const reenviando = ref(false)
const cambiandoCelular = ref(false)

const avisar = (texto, error = false) => {
  mensaje.value = { texto, error }
}

async function verificar() {
  avisar('')
  errorCampo.value = codigoValido(codigo.value) ? '' : MENSAJES_FORMULARIO.codigoFormato
  if (errorCampo.value) return

  verificando.value = true
  try {
    await store.verificarCelular(codigo.value)
    avisar('Tu celular quedó verificado.')
    emit('verificado')
  } catch (e) {
    avisar(e.message, true)
  } finally {
    verificando.value = false
  }
}

async function reenviar() {
  avisar('')
  reenviando.value = true
  try {
    await store.reenviarCodigo()
    codigo.value = ''
    avisar('Te enviamos un código nuevo. Los anteriores ya no sirven.')
  } catch (e) {
    avisar(e.message, true)
  } finally {
    reenviando.value = false
  }
}

function celularCambiado() {
  cambiandoCelular.value = false
  avisar('Actualizamos tu celular y te enviamos un código para verificarlo.')
}
</script>

<template>
  <section class="verificacion" aria-labelledby="titulo-verificacion">
    <h2 id="titulo-verificacion" class="verificacion__titulo">Verifica tu celular</h2>

    <p v-if="store.cuenta?.ultimoCodigoEnviado" class="verificacion__demo">
      <AppIcon name="bell" :size="18" />
      <span>
        <strong>Modo demostración:</strong> no se envían SMS reales.
        {{ store.cuenta.ultimoCodigoEnviado }}
      </span>
    </p>

    <form class="verificacion__form" novalidate @submit.prevent="verificar">
      <label for="codigo-verificacion" class="field-label">Código de 6 dígitos</label>
      <div class="verificacion__fila">
        <input
          id="codigo-verificacion"
          v-model="codigo"
          class="input verificacion__codigo"
          inputmode="numeric"
          autocomplete="one-time-code"
          :maxlength="LIMITES.codigo.longitud"
          :aria-invalid="errorCampo ? 'true' : undefined"
        />
        <BaseButton type="submit" class="verificacion__verificar" :loading="verificando">
          Verificar
        </BaseButton>
      </div>
      <p v-if="errorCampo" class="field-error">{{ errorCampo }}</p>
    </form>

    <p
      v-if="mensaje.texto"
      class="verificacion__mensaje"
      :class="{ 'verificacion__mensaje--error': mensaje.error }"
      :role="mensaje.error ? 'alert' : 'status'"
    >
      {{ mensaje.texto }}
    </p>

    <div class="verificacion__acciones">
      <BaseButton
        variant="outline"
        class="verificacion__reenviar"
        :loading="reenviando"
        @click="reenviar"
      >
        <AppIcon name="refresh" :size="18" /> Enviar un código nuevo
      </BaseButton>
      <BaseButton
        variant="outline"
        class="verificacion__otro-celular"
        @click="cambiandoCelular = !cambiandoCelular"
      >
        <AppIcon name="pencil" :size="18" /> ¿Número equivocado?
      </BaseButton>
    </div>

    <CambiarCelularForm v-if="cambiandoCelular" @cambiado="celularCambiado" />
  </section>
</template>

<style scoped>
.verificacion {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.verificacion__titulo {
  font-size: var(--text-lg);
  font-weight: 700;
}

.verificacion__demo {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3);
  font-size: var(--text-sm);
  line-height: 1.5;
  background: var(--color-primary-soft);
  border-radius: var(--radius-sm);
}

.verificacion__fila {
  display: flex;
  gap: var(--space-2);
}

.verificacion__codigo {
  flex: 1;
  letter-spacing: 0.3em;
}

.verificacion__mensaje {
  font-size: var(--text-sm);
  color: var(--color-success);
}

.verificacion__mensaje--error {
  color: var(--color-danger);
}

.verificacion__acciones {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
