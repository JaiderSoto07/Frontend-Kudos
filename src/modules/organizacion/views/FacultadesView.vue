<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import {
  ESTADO_FACULTAD,
  ROLES_GESTIONAN_ORGANIZACION,
  nombreEstadoFacultad,
} from '@/shared/domain/cuenta'
import { useSesionStore } from '@/stores/sesionStore'
import CoordinadoresModal from '../components/CoordinadoresModal.vue'
import NombreFormModal from '../components/NombreFormModal.vue'
import { organizacionService } from '../services/organizacionService'

const sesion = useSesionStore()
const facultades = ref([])
const cargando = ref(true)
const error = ref('')
const aviso = ref('')
const formulario = reactive({ abierto: false, elemento: null })
const inactivacion = reactive({ abierto: false, facultad: null, loading: false, error: '' })
const historial = reactive({ titulo: '', cargar: null })

const gestiona = computed(() => sesion.tieneRol(ROLES_GESTIONAN_ORGANIZACION))

const columnas = [
  { key: 'nombre', label: 'Facultad' },
  { key: 'estado', label: 'Estado', width: '150px', nowrap: true },
  { key: 'programas', label: 'Programas activos', width: '150px', nowrap: true },
  { key: 'coordinador', label: 'Coordinador vigente' },
  { key: 'acciones', label: 'Acciones', width: '280px', align: 'right', nowrap: true },
]

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    facultades.value = await organizacionService.listarFacultades()
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
    ? organizacionService.modificarFacultad(formulario.elemento.id, datos)
    : organizacionService.registrarFacultad(datos)
}

async function guardado() {
  aviso.value = formulario.elemento
    ? 'El nombre de la Facultad quedó actualizado.'
    : 'La Facultad quedó registrada en conformación. Pasará a activa con su primer Programa.'
  formulario.abierto = false
  await cargar()
}

function pedirInactivacion(facultad) {
  aviso.value = ''
  Object.assign(inactivacion, { abierto: true, facultad, loading: false, error: '' })
}

async function confirmarInactivacion() {
  inactivacion.loading = true
  inactivacion.error = ''
  try {
    await organizacionService.inactivarFacultad(inactivacion.facultad.id)
    aviso.value = `La Facultad ${inactivacion.facultad.nombre} quedó inactiva.`
    inactivacion.abierto = false
    await cargar()
  } catch (e) {
    inactivacion.error = e.message
  } finally {
    inactivacion.loading = false
  }
}

function verCoordinadores(facultad) {
  Object.assign(historial, {
    titulo: `Coordinadores de ${facultad.nombre}`,
    cargar: () => organizacionService.coordinadoresDeFacultad(facultad.id),
  })
}
</script>

<template>
  <div class="facultades">
    <PageHeader
      title="Facultades"
      subtitle="Facultades de la universidad, su estado y su coordinador."
    >
      <template #actions>
        <BaseButton v-if="gestiona" icon="plus" @click="abrirFormulario()"
          >Nueva Facultad</BaseButton
        >
      </template>
    </PageHeader>

    <p v-if="aviso" class="facultades__aviso" role="status">{{ aviso }}</p>

    <BaseCard>
      <p v-if="cargando" class="facultades__estado" role="status">Cargando Facultades…</p>
      <EmptyState
        v-else-if="error"
        icon="alert"
        title="No fue posible cargar las Facultades"
        :description="error"
      />
      <BaseTable v-else :columns="columnas" :rows="facultades" caption="Facultades">
        <template #cell-nombre="{ row }"
          ><strong>{{ row.nombre }}</strong></template
        >
        <template #cell-estado="{ row }">
          <StatusBadge
            :label="nombreEstadoFacultad(row.estado)"
            :tone="row.estado === ESTADO_FACULTAD.ACTIVA ? 'success' : 'muted'"
          />
        </template>
        <template #cell-programas="{ row }">{{ row.cantidadProgramas }}</template>
        <template #cell-coordinador="{ row }">{{
          row.nombreCoordinador || 'Sin coordinador'
        }}</template>
        <template #cell-acciones="{ row }">
          <div class="acciones">
            <BaseButton
              variant="outline"
              class="acciones__coordinadores"
              @click="verCoordinadores(row)"
            >
              Coordinadores
            </BaseButton>
            <template v-if="gestiona && row.estado !== ESTADO_FACULTAD.INACTIVA">
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
          <EmptyState icon="building" title="No hay Facultades para mostrar" />
        </template>
      </BaseTable>
    </BaseCard>

    <NombreFormModal
      :abierto="formulario.abierto"
      tipo="facultad"
      :elemento="formulario.elemento"
      :existentes="facultades"
      :guardar="guardar"
      @cerrar="formulario.abierto = false"
      @guardado="guardado"
    />

    <ConfirmDialog
      :open="inactivacion.abierto"
      title="Inactivar Facultad"
      :message="`¿Inactivar ${inactivacion.facultad?.nombre ?? ''}? Solo es posible si no tiene Programas activos; si tiene coordinador, su cargo terminará.`"
      confirm-label="Inactivar"
      :loading="inactivacion.loading"
      :error="inactivacion.error"
      @confirm="confirmarInactivacion"
      @cancel="inactivacion.abierto = false"
    />

    <CoordinadoresModal
      :titulo="historial.titulo"
      :cargar="historial.cargar"
      @cerrar="historial.cargar = null"
    />
  </div>
</template>

<style scoped>
.facultades {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.facultades__estado {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-text-muted);
}

.facultades__aviso {
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
</style>
