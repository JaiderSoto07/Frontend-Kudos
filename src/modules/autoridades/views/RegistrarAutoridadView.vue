<script setup>
import { computed, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { ROLES_DE_AUTORIDAD, nombreRol } from '@/shared/domain/cuenta'
import {
  LIMITES,
  MENSAJES_FORMULARIO,
  validarCelular,
  validarCorreo,
  validarDatosPersonales,
} from '@/modules/identidad/utils/identidadValidations'
import { autoridadService } from '../services/autoridadService'

const VACIO = { rol: '', nombres: '', apellidos: '', correo: '', celular: '' }

const formulario = reactive({ ...VACIO })
const errores = ref({})
const mensaje = ref({ texto: '', error: false })
const guardando = ref(false)

const opcionesRol = computed(() =>
  ROLES_DE_AUTORIDAD.map((rol) => ({ value: rol, label: nombreRol(rol) })),
)

function validar() {
  const resultado = validarDatosPersonales(formulario)
  if (!formulario.rol) resultado.rol = MENSAJES_FORMULARIO.rolRequerido
  const errorCorreo = validarCorreo(formulario.correo)
  if (errorCorreo) resultado.correo = errorCorreo
  const errorCelular = validarCelular(formulario.celular)
  if (errorCelular) resultado.celular = errorCelular
  return resultado
}

async function registrar() {
  mensaje.value = { texto: '', error: false }
  errores.value = validar()
  if (Object.keys(errores.value).length) return

  guardando.value = true
  try {
    await autoridadService.registrar({ ...formulario })
    mensaje.value = {
      texto: `La cuenta de ${nombreRol(formulario.rol)} quedó registrada. La persona debe entrar con Google con ese correo y verificar su celular.`,
      error: false,
    }
    Object.assign(formulario, VACIO)
  } catch (e) {
    mensaje.value = { texto: e.message, error: true }
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div class="autoridad">
    <PageHeader
      title="Registrar autoridad"
      subtitle="El Rector y los Administradores no se autorregistran: los registra un Administrador."
    />

    <BaseCard class="autoridad__card">
      <form class="autoridad__form" novalidate @submit.prevent="registrar">
        <BaseSelect
          v-model="formulario.rol"
          class="autoridad__rol"
          label="Rol"
          placeholder="Elige el rol"
          :options="opcionesRol"
          :error="errores.rol"
        />
        <div class="autoridad__fila">
          <div>
            <label for="autoridad-nombres" class="field-label">Nombres</label>
            <input
              id="autoridad-nombres"
              v-model="formulario.nombres"
              class="input"
              :maxlength="LIMITES.nombres.maximo"
            />
            <p v-if="errores.nombres" class="field-error">{{ errores.nombres }}</p>
          </div>
          <div>
            <label for="autoridad-apellidos" class="field-label">Apellidos</label>
            <input
              id="autoridad-apellidos"
              v-model="formulario.apellidos"
              class="input"
              :maxlength="LIMITES.apellidos.maximo"
            />
            <p v-if="errores.apellidos" class="field-error">{{ errores.apellidos }}</p>
          </div>
        </div>
        <div>
          <label for="autoridad-correo" class="field-label">Correo (cuenta de Google)</label>
          <input id="autoridad-correo" v-model="formulario.correo" class="input" type="email" />
          <p v-if="errores.correo" class="field-error">{{ errores.correo }}</p>
        </div>
        <div>
          <label for="autoridad-celular" class="field-label">Celular</label>
          <input
            id="autoridad-celular"
            v-model="formulario.celular"
            class="input"
            type="tel"
            inputmode="numeric"
            :maxlength="LIMITES.celular.longitud"
          />
          <p v-if="errores.celular" class="field-error">{{ errores.celular }}</p>
        </div>
        <p
          v-if="mensaje.texto"
          class="autoridad__mensaje"
          :class="{ 'autoridad__mensaje--error': mensaje.error }"
          :role="mensaje.error ? 'alert' : 'status'"
        >
          {{ mensaje.texto }}
        </p>
        <BaseButton type="submit" class="autoridad__registrar" :loading="guardando">
          Registrar
        </BaseButton>
      </form>
    </BaseCard>
  </div>
</template>

<style scoped>
.autoridad {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.autoridad__card {
  max-width: 640px;
}

.autoridad__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.autoridad__fila {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.autoridad__mensaje {
  font-size: var(--text-sm);
  color: var(--color-success);
}

.autoridad__mensaje--error {
  color: var(--color-danger);
}

@media (max-width: 560px) {
  .autoridad__fila {
    grid-template-columns: 1fr;
  }
}
</style>
