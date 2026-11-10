<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { ROL } from '@/shared/domain/cuenta'
import { organizacionService } from '../services/organizacionService'

const cargos = ref([])
const error = ref('')

const delRol = (rol) => cargos.value.filter((c) => c.rol === rol)
const rector = computed(() => delRol(ROL.RECTOR)[0])
const coordinadorAcademico = computed(() => delRol(ROL.COORDINADOR_ACADEMICO)[0])
const deFacultad = computed(() => delRol(ROL.COORDINADOR_FACULTAD))
const dePrograma = computed(() => delRol(ROL.COORDINADOR_PROGRAMA))

const columnasFacultad = [
  { key: 'ambito', label: 'Facultad' },
  { key: 'persona', label: 'Coordinador' },
]
const columnasPrograma = [
  { key: 'ambito', label: 'Programa' },
  { key: 'persona', label: 'Coordinador' },
]

onMounted(async () => {
  try {
    cargos.value = await organizacionService.estructura()
  } catch (e) {
    error.value = e.message
  }
})
</script>

<template>
  <div class="estructura">
    <PageHeader title="Estructura de la universidad" subtitle="Quién ocupa hoy cada cargo." />
    <EmptyState
      v-if="error"
      icon="alert"
      title="No fue posible cargar la estructura"
      :description="error"
    />

    <template v-else>
      <div class="estructura__cargos">
        <BaseCard class="estructura__cargo">
          <p class="estructura__rol">Rector</p>
          <p class="estructura__persona">{{ rector?.nombrePersona ?? 'Sin titular' }}</p>
        </BaseCard>
        <BaseCard class="estructura__cargo">
          <p class="estructura__rol">Coordinador Académico</p>
          <p class="estructura__persona">
            {{ coordinadorAcademico?.nombrePersona ?? 'Sin titular' }}
          </p>
        </BaseCard>
      </div>

      <BaseCard>
        <h2 class="estructura__titulo">Coordinadores de Facultad</h2>
        <BaseTable
          :columns="columnasFacultad"
          :rows="deFacultad"
          row-key="idUsuario"
          caption="Coordinadores de Facultad"
        >
          <template #cell-ambito="{ row }">{{ row.nombreFacultad }}</template>
          <template #cell-persona="{ row }">{{ row.nombrePersona }}</template>
          <template #empty
            ><EmptyState icon="building" title="Sin coordinadores de Facultad"
          /></template>
        </BaseTable>
      </BaseCard>

      <BaseCard>
        <h2 class="estructura__titulo">Coordinadores de Programa</h2>
        <BaseTable
          :columns="columnasPrograma"
          :rows="dePrograma"
          row-key="idUsuario"
          caption="Coordinadores de Programa"
        >
          <template #cell-ambito="{ row }">{{ row.nombrePrograma }}</template>
          <template #cell-persona="{ row }">{{ row.nombrePersona }}</template>
          <template #empty
            ><EmptyState icon="list" title="Sin coordinadores de Programa"
          /></template>
        </BaseTable>
      </BaseCard>
    </template>
  </div>
</template>

<style scoped>
.estructura {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.estructura__cargos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-4);
}

.estructura__rol {
  font-size: var(--text-sm);
  color: var(--color-label);
}

.estructura__persona {
  font-size: var(--text-lg);
  font-weight: 700;
}

.estructura__titulo {
  margin-bottom: var(--space-3);
  font-size: var(--text-lg);
  font-weight: 700;
}
</style>
