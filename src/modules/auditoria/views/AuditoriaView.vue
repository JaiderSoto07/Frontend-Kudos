<script setup>
import { onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { formatFechaHora } from '@/modules/kudos/utils/kudoUtils'
import { auditoriaService } from '../services/auditoriaService'
import {
  OPCIONES_ACCION,
  TIPOS_OBJETO,
  cambioDeEstado,
  nombreAccion,
  nombreTipoObjeto,
  validarRangoFechas,
} from '../utils/auditoriaUtils'

const COLUMNAS = [
  { key: 'fechaHora', label: 'Fecha', nowrap: true },
  { key: 'nombreActor', label: 'Actor' },
  { key: 'accion', label: 'Acción' },
  { key: 'tipoObjeto', label: 'Objeto' },
  { key: 'cambio', label: 'Estado' },
  { key: 'motivo', label: 'Motivo' },
]

const FILTROS_VACIOS = { desde: '', hasta: '', actor: '', accion: '', tipoObjeto: '' }

const filtros = reactive({ ...FILTROS_VACIOS })
const pagina = ref({ registros: [], pagina: 1, totalPaginas: 0, totalRegistros: 0 })
const cargando = ref(true)
const error = ref('')
const errorFechas = ref('')

async function cargar(numero = 1) {
  errorFechas.value = validarRangoFechas(filtros.desde, filtros.hasta)
  if (errorFechas.value) return

  cargando.value = true
  error.value = ''
  try {
    pagina.value = await auditoriaService.consultar({ ...filtros, pagina: numero })
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

async function limpiar() {
  Object.assign(filtros, FILTROS_VACIOS)
  await cargar(1)
}

onMounted(cargar)
</script>

<template>
  <section class="auditoria">
    <PageHeader title="Auditoría" subtitle="Quién hizo qué y cuándo, según el ámbito de tu rol." />

    <form class="auditoria__filtros" novalidate @submit.prevent="cargar(1)">
      <label class="field-label">
        Desde
        <input v-model="filtros.desde" type="date" class="input auditoria__desde" />
      </label>
      <label class="field-label">
        Hasta
        <input v-model="filtros.hasta" type="date" class="input auditoria__hasta" />
      </label>
      <label class="field-label">
        Actor
        <input v-model="filtros.actor" class="input auditoria__actor" placeholder="Nombre" />
      </label>
      <BaseSelect
        v-model="filtros.accion"
        class="auditoria__accion"
        label="Acción"
        placeholder="Todas"
        :options="OPCIONES_ACCION"
      />
      <BaseSelect
        v-model="filtros.tipoObjeto"
        class="auditoria__tipo"
        label="Objeto"
        placeholder="Todos"
        :options="TIPOS_OBJETO"
      />
      <div class="auditoria__botones">
        <BaseButton type="submit" icon="search" class="auditoria__buscar">Buscar</BaseButton>
        <BaseButton variant="outline" class="auditoria__limpiar" @click="limpiar"
          >Limpiar</BaseButton
        >
      </div>
    </form>
    <p v-if="errorFechas" class="field-error" role="alert">{{ errorFechas }}</p>

    <p v-if="cargando" class="auditoria__estado" role="status">Cargando la auditoría…</p>
    <EmptyState
      v-else-if="error"
      icon="alert"
      title="No fue posible cargar la auditoría"
      :description="error"
    />
    <EmptyState
      v-else-if="!pagina.registros.length"
      icon="list"
      title="No hay registros con esos filtros"
    />
    <template v-else>
      <p class="auditoria__total">
        {{ pagina.totalRegistros }} {{ pagina.totalRegistros === 1 ? 'registro' : 'registros' }}
      </p>
      <BaseTable :columns="COLUMNAS" :rows="pagina.registros" caption="Registros de auditoría">
        <template #cell-fechaHora="{ row }">{{ formatFechaHora(row.fechaHora) }}</template>
        <template #cell-accion="{ row }">{{ nombreAccion(row.accion) }}</template>
        <template #cell-tipoObjeto="{ row }">{{ nombreTipoObjeto(row.tipoObjeto) }}</template>
        <template #cell-cambio="{ row }">{{ cambioDeEstado(row) }}</template>
      </BaseTable>
      <BasePagination
        v-if="pagina.totalPaginas > 1"
        :page="pagina.pagina"
        :total-pages="pagina.totalPaginas"
        @change="cargar"
      />
    </template>
  </section>
</template>

<style scoped>
.auditoria {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.auditoria__filtros {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  align-items: end;
  gap: var(--space-3);
}

.auditoria__filtros .input {
  display: block;
  width: 100%;
  margin-top: var(--space-1);
}

.auditoria__botones {
  display: flex;
  gap: var(--space-2);
}

.auditoria__estado,
.auditoria__total {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
</style>
