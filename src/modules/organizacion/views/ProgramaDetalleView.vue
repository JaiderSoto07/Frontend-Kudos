<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { ROL, TIPO_VINCULO, nombreRol } from '@/shared/domain/cuenta'
import { useSesionStore } from '@/stores/sesionStore'
import HistorialCoordinadores from '../components/HistorialCoordinadores.vue'
import MotivoModal from '../components/MotivoModal.vue'
import { organizacionService } from '../services/organizacionService'
import { formatFecha, validarVinculo } from '../utils/organizacionValidations'

const props = defineProps({
  id: { type: String, required: true },
})

const sesion = useSesionStore()
const programa = ref(null)
const coordinadores = ref([])
const vinculos = ref([])
const error = ref('')
const aviso = ref('')
const nuevoVinculo = reactive({ correo: '', tipoVinculo: '' })
const erroresVinculo = ref({})
const errorVinculo = ref('')
const vinculando = ref(false)
const porDesvincular = ref(null)

const esSuCoordinador = computed(() => sesion.rol === ROL.COORDINADOR_PROGRAMA)
const vigentes = computed(() => vinculos.value.filter((v) => v.vigente))
const historicos = computed(() => vinculos.value.filter((v) => !v.vigente))
const opcionesTipo = [TIPO_VINCULO.ESTUDIANTE, TIPO_VINCULO.DOCENTE].map((tipo) => ({
  value: tipo,
  label: nombreRol(tipo),
}))

const columnasVigentes = [
  { key: 'persona', label: 'Persona' },
  { key: 'tipo', label: 'Vínculo', width: '130px', nowrap: true },
  { key: 'desde', label: 'Desde', width: '140px', nowrap: true },
  { key: 'acciones', label: '', width: '150px', align: 'right', nowrap: true },
]
const columnasHistoricas = [
  { key: 'persona', label: 'Persona' },
  { key: 'tipo', label: 'Vínculo', width: '130px', nowrap: true },
  { key: 'periodo', label: 'Periodo', width: '230px', nowrap: true },
  { key: 'motivo', label: 'Motivo' },
]

async function cargar() {
  error.value = ''
  try {
    programa.value = await organizacionService.obtenerPrograma(props.id)
    coordinadores.value = await organizacionService.coordinadoresDePrograma(props.id)
    vinculos.value = await organizacionService.vinculosDePrograma(props.id)
  } catch (e) {
    error.value = e.message
  }
}

onMounted(cargar)

async function vincular() {
  aviso.value = ''
  errorVinculo.value = ''
  erroresVinculo.value = validarVinculo(nuevoVinculo)
  if (Object.keys(erroresVinculo.value).length) return

  vinculando.value = true
  try {
    await organizacionService.vincular(props.id, { ...nuevoVinculo })
    aviso.value = 'La persona quedó vinculada al Programa.'
    Object.assign(nuevoVinculo, { correo: '', tipoVinculo: '' })
    vinculos.value = await organizacionService.vinculosDePrograma(props.id)
  } catch (e) {
    errorVinculo.value = e.message
  } finally {
    vinculando.value = false
  }
}

function desvincular(motivo) {
  return organizacionService.desvincular(porDesvincular.value.id, motivo)
}

async function desvinculado() {
  aviso.value = `${porDesvincular.value.nombrePersona} quedó desvinculado del Programa.`
  porDesvincular.value = null
  vinculos.value = await organizacionService.vinculosDePrograma(props.id)
}
</script>

<template>
  <div class="detalle">
    <RouterLink :to="{ name: 'programas' }" class="detalle__volver"
      >← Volver a Programas</RouterLink
    >

    <EmptyState
      v-if="error"
      icon="alert"
      title="No fue posible cargar el Programa"
      :description="error"
    />

    <template v-else-if="programa">
      <PageHeader
        :title="programa.nombre"
        :subtitle="`${programa.nombreFacultad} · ${programa.activo ? 'Activo' : 'Inactivo'}`"
      />
      <p v-if="aviso" class="detalle__aviso" role="status">{{ aviso }}</p>

      <BaseCard>
        <h2 class="detalle__titulo">Coordinadores</h2>
        <HistorialCoordinadores :coordinadores="coordinadores" />
      </BaseCard>

      <BaseCard>
        <h2 class="detalle__titulo">Estudiantes y docentes vinculados</h2>
        <form
          v-if="esSuCoordinador && programa.activo"
          class="vincular"
          novalidate
          @submit.prevent="vincular"
        >
          <div class="vincular__correo">
            <label for="vincular-correo" class="field-label">Correo de la persona</label>
            <input id="vincular-correo" v-model="nuevoVinculo.correo" class="input" type="email" />
            <p v-if="erroresVinculo.correo" class="field-error">{{ erroresVinculo.correo }}</p>
          </div>
          <BaseSelect
            v-model="nuevoVinculo.tipoVinculo"
            class="vincular__tipo"
            label="Vínculo"
            placeholder="Elige"
            :options="opcionesTipo"
            :error="erroresVinculo.tipoVinculo"
          />
          <BaseButton type="submit" class="vincular__boton" :loading="vinculando"
            >Vincular</BaseButton
          >
          <p v-if="errorVinculo" class="vincular__error" role="alert">{{ errorVinculo }}</p>
        </form>

        <BaseTable :columns="columnasVigentes" :rows="vigentes" caption="Vínculos vigentes">
          <template #cell-persona="{ row }">
            <strong>{{ row.nombrePersona }}</strong>
            <span class="detalle__correo">{{ row.correo }}</span>
          </template>
          <template #cell-tipo="{ row }">{{ nombreRol(row.tipoVinculo) }}</template>
          <template #cell-desde="{ row }">{{ formatFecha(row.fechaInicio) }}</template>
          <template #cell-acciones="{ row }">
            <BaseButton
              v-if="esSuCoordinador"
              variant="outline"
              danger
              class="detalle__desvincular"
              @click="porDesvincular = row"
            >
              Desvincular
            </BaseButton>
          </template>
          <template #empty>
            <EmptyState icon="users" title="Nadie vinculado todavía" />
          </template>
        </BaseTable>
      </BaseCard>

      <BaseCard v-if="historicos.length">
        <h2 class="detalle__titulo">Historial de vínculos</h2>
        <BaseTable :columns="columnasHistoricas" :rows="historicos" caption="Vínculos cerrados">
          <template #cell-persona="{ row }">{{ row.nombrePersona }}</template>
          <template #cell-tipo="{ row }">{{ nombreRol(row.tipoVinculo) }}</template>
          <template #cell-periodo="{ row }">
            {{ formatFecha(row.fechaInicio) }} – {{ formatFecha(row.fechaFin) }}
          </template>
          <template #cell-motivo="{ row }">{{ row.motivoDesvinculacion }}</template>
        </BaseTable>
      </BaseCard>
    </template>

    <MotivoModal
      :abierto="porDesvincular != null"
      :titulo="`Desvincular a ${porDesvincular?.nombrePersona ?? ''}`"
      mensaje="El vínculo se cierra con fecha y motivo; no se borra. Si la persona queda sin Programas, su cuenta se suspende."
      :confirmar="desvincular"
      @cerrar="porDesvincular = null"
      @hecho="desvinculado"
    />
  </div>
</template>

<style scoped>
.detalle {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.detalle__volver {
  font-weight: 600;
  color: var(--color-primary);
}

.detalle__titulo {
  margin-bottom: var(--space-3);
  font-size: var(--text-lg);
  font-weight: 700;
}

.detalle__correo {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.detalle__aviso {
  padding: var(--space-3);
  color: var(--color-success);
  background: var(--color-success-soft);
  border-radius: var(--radius-sm);
}

.vincular {
  display: grid;
  grid-template-columns: 1fr 180px auto;
  gap: var(--space-3);
  align-items: end;
  margin-bottom: var(--space-4);
}

.vincular__error {
  grid-column: 1 / -1;
  font-size: var(--text-sm);
  color: var(--color-danger);
}

@media (max-width: 720px) {
  .vincular {
    grid-template-columns: 1fr;
  }
}
</style>
