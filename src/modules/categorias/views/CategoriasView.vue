<script setup>
import { computed, onMounted, reactive } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useCategoriaStore } from '../stores/categoriaStore'
import CategoriaFilters from '../components/CategoriaFilters.vue'
import CategoriaFormModal from '../components/CategoriaFormModal.vue'
import CategoriaTable from '../components/CategoriaTable.vue'

const store = useCategoriaStore()

const cambio = reactive({ abierto: false, categoria: null, loading: false, error: '' })

const accion = computed(() => (cambio.categoria?.activa ? 'Desactivar' : 'Activar'))
const mensajeCambio = computed(() => {
  if (!cambio.categoria) return ''
  const nombre = cambio.categoria.nombre
  return cambio.categoria.activa
    ? `¿Desactivar la categoría «${nombre}»? Ya no se podrá elegir al crear nuevos Kudos; los Kudos existentes la conservan.`
    : `¿Activar la categoría «${nombre}»? Volverá a estar disponible al crear Kudos.`
})

const plural = (cantidad, singular, varios) => `${cantidad} ${cantidad === 1 ? singular : varios}`

const resumen = computed(
  () =>
    `${plural(store.categorias.length, 'categoría', 'categorías')} · ${plural(store.totalActivas, 'activa', 'activas')}`,
)

onMounted(() => store.cargar())

function pedirCambioEstado(categoria) {
  Object.assign(cambio, { abierto: true, categoria, loading: false, error: '' })
}

async function confirmarCambioEstado() {
  cambio.loading = true
  cambio.error = ''
  try {
    await store.cambiarEstado(cambio.categoria)
    cambio.abierto = false
  } catch (e) {
    cambio.error = e.message
  } finally {
    cambio.loading = false
  }
}
</script>

<template>
  <div class="categorias">
    <PageHeader
      title="Categorías"
      subtitle="Gestiona las categorías con las que se reconocen los Kudos."
    >
      <template #actions>
        <BaseButton icon="plus" :disabled="store.loading" @click="store.abrirCrear()">
          Nueva categoría
        </BaseButton>
      </template>
    </PageHeader>

    <BaseCard v-if="store.error">
      <EmptyState
        icon="alert"
        title="No fue posible cargar las categorías"
        :description="store.error"
      >
        <BaseButton variant="outline" icon="refresh" @click="store.cargar()">Reintentar</BaseButton>
      </EmptyState>
    </BaseCard>

    <BaseCard v-else class="categorias__lista">
      <CategoriaFilters
        :filtros="store.filtros"
        @update="store.setFiltro"
        @limpiar="store.limpiarFiltros()"
      />
      <p v-if="store.loading" class="categorias__estado" role="status">Cargando categorías…</p>
      <template v-else>
        <CategoriaTable
          :rows="store.filasFiltradas"
          @editar="store.abrirEditar"
          @cambiar-estado="pedirCambioEstado"
        />
        <p class="categorias__resumen">
          {{ resumen }}
        </p>
      </template>
    </BaseCard>

    <CategoriaFormModal />

    <ConfirmDialog
      :open="cambio.abierto"
      :title="`${accion} categoría`"
      :message="mensajeCambio"
      :confirm-label="accion"
      :loading="cambio.loading"
      :error="cambio.error"
      @confirm="confirmarCambioEstado"
      @cancel="cambio.abierto = false"
    />
  </div>
</template>

<style scoped>
.categorias {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.categorias__lista {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.categorias__estado {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-text-muted);
}

.categorias__resumen {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
</style>
