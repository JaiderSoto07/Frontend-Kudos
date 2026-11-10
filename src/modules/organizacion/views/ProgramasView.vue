<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { ROLES_GESTIONAN_ORGANIZACION } from '@/shared/domain/cuenta'
import { useSesionStore } from '@/stores/sesionStore'
import NombreFormModal from '../components/NombreFormModal.vue'
import { organizacionService } from '../services/organizacionService'

const sesion = useSesionStore()
const programas = ref([])
const facultades = ref([])
const cargando = ref(true)
const error = ref('')
const aviso = ref('')
const formulario = reactive({ abierto: false, elemento: null })
const inactivacion = reactive({ abierto: false, programa: null, loading: false, error: '' })

const gestiona = computed(() => sesion.tieneRol(ROLES_GESTIONAN_ORGANIZACION))

const columnas = [
  { key: 'nombre', label: 'Programa' },
  { key: 'facultad', label: 'Facultad' },
  { key: 'estado', label: 'Estado', width: '110px', nowrap: true },
  { key: 'coordinador', label: 'Coordinador vigente' },
  { key: 'acciones', label: 'Acciones', width: '260px', align: 'right', nowrap: true },
]

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    programas.value = await organizacionService.listarProgramas()
    if (gestiona.value) facultades.value = await organizacionService.listarFacultades()
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)

function abrirFormulario(elemento = null) {
  aviso.value = ''
  Object.assign(formulario, { abierto: true, elemento })
}

function guardar(datos) {
  return formulario.elemento
    ? organizacionService.modificarPrograma(formulario.elemento.id, datos)
    : organizacionService.registrarPrograma(datos)
}

async function guardado() {
  aviso.value = formulario.elemento
    ? 'El nombre del Programa quedó actualizado.'
    : 'El Programa quedó registrado.'
  formulario.abierto = false
  await cargar()
}

function pedirInactivacion(programa) {
  aviso.value = ''
  Object.assign(inactivacion, { abierto: true, programa, loading: false, error: '' })
}

async function confirmarInactivacion() {
  inactivacion.loading = true
  inactivacion.error = ''
  try {
    await organizacionService.inactivarPrograma(inactivacion.programa.id)
    aviso.value = `El Programa ${inactivacion.programa.nombre} quedó inactivo.`
    inactivacion.abierto = false
    await cargar()
  } catch (e) {
    inactivacion.error = e.message
  } finally {
    inactivacion.loading = false
  }
}
</script>

<template>
  <div class="programas">
    <PageHeader
      title="Programas académicos"
      subtitle="Programas de tu ámbito, su Facultad y su coordinador."
    >
      <template #actions>
        <BaseButton v-if="gestiona" icon="plus" @click="abrirFormulario()"
          >Nuevo Programa</BaseButton
        >
      </template>
    </PageHeader>

    <p v-if="aviso" class="programas__aviso" role="status">{{ aviso }}</p>

    <BaseCard>
      <p v-if="cargando" class="programas__estado" role="status">Cargando Programas…</p>
      <EmptyState
        v-else-if="error"
        icon="alert"
        title="No fue posible cargar los Programas"
        :description="error"
      />
      <BaseTable v-else :columns="columnas" :rows="programas" caption="Programas académicos">
        <template #cell-nombre="{ row }"
          ><strong>{{ row.nombre }}</strong></template
        >
        <template #cell-facultad="{ row }">{{ row.nombreFacultad }}</template>
        <template #cell-estado="{ row }">
          <StatusBadge
            :label="row.activo ? 'Activo' : 'Inactivo'"
            :tone="row.activo ? 'success' : 'muted'"
          />
        </template>
        <template #cell-coordinador="{ row }">{{
          row.nombreCoordinador || 'Sin coordinador'
        }}</template>
        <template #cell-acciones="{ row }">
          <div class="acciones">
            <RouterLink
              :to="{ name: 'programa-detalle', params: { id: row.id } }"
              class="acciones__detalle"
            >
              Ver detalle
            </RouterLink>
            <template v-if="gestiona && row.activo">
              <BaseButton
                variant="icon"
                icon="pencil"
                :label="`Editar ${row.nombre}`"
                @click="abrirFormulario(row)"
              />
              <BaseButton
                variant="outline"
                danger
                class="acciones__inactivar"
                @click="pedirInactivacion(row)"
              >
                Inactivar
              </BaseButton>
            </template>
          </div>
        </template>
        <template #empty>
          <EmptyState icon="list" title="No hay Programas para mostrar" />
        </template>
      </BaseTable>
    </BaseCard>

    <NombreFormModal
      :abierto="formulario.abierto"
      tipo="programa"
      :elemento="formulario.elemento"
      :existentes="programas"
      :facultades="facultades"
      :guardar="guardar"
      @cerrar="formulario.abierto = false"
      @guardado="guardado"
    />

    <ConfirmDialog
      :open="inactivacion.abierto"
      title="Inactivar Programa"
      :message="`¿Inactivar ${inactivacion.programa?.nombre ?? ''}? Solo es posible si no tiene estudiantes ni docentes vinculados; si tiene coordinador, su cargo terminará.`"
      confirm-label="Inactivar"
      :loading="inactivacion.loading"
      :error="inactivacion.error"
      @confirm="confirmarInactivacion"
      @cancel="inactivacion.abierto = false"
    />
  </div>
</template>

<style scoped>
.programas {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.programas__estado {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-text-muted);
}

.programas__aviso {
  padding: var(--space-3);
  color: var(--color-success);
  background: var(--color-success-soft);
  border-radius: var(--radius-sm);
}

.acciones {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.acciones__detalle {
  font-weight: 600;
  color: var(--color-primary);
}
</style>
