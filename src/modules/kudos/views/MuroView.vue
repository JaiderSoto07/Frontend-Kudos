<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useSesionStore } from '@/stores/sesionStore'
import CrearKudoModal from '../components/CrearKudoModal.vue'
import KudoCard from '../components/KudoCard.vue'
import { kudoService } from '../services/kudoService'

const sesion = useSesionStore()
const pagina = ref({ kudos: [], pagina: 1, totalPaginas: 0, totalKudos: 0 })
const filtros = reactive({ categoria: '', persona: '' })
const categorias = ref([])
const personas = ref([])
const cargando = ref(true)
const error = ref('')
const aviso = ref('')
const creando = ref(false)

const opcionesCategoria = computed(() =>
  categorias.value.map((c) => ({ value: c.id, label: c.nombre })),
)
const opcionesPersona = computed(() =>
  personas.value.map((p) => ({ value: p.id, label: p.nombre })),
)

async function cargar(numero = 1) {
  cargando.value = true
  error.value = ''
  try {
    pagina.value = await kudoService.muro({ ...filtros, pagina: numero })
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

onMounted(async () => {
  await cargar()
  categorias.value = await kudoService.categoriasActivas().catch(() => [])
  personas.value = await kudoService.buscarPersonas().catch(() => [])
})

async function filtrar() {
  aviso.value = ''
  await cargar(1)
}

async function limpiar() {
  Object.assign(filtros, { categoria: '', persona: '' })
  await filtrar()
}

async function publicado() {
  creando.value = false
  Object.assign(filtros, { categoria: '', persona: '' })
  await cargar(1)
  aviso.value = 'Tu Kudo quedó publicado en el muro.'
}
</script>

<template>
  <section class="muro">
    <PageHeader :title="`Hola, ${sesion.usuario?.nombres}`" :subtitle="sesion.nombreDelRol">
      <template #actions>
        <BaseButton icon="star" class="muro__dar" @click="creando = true">Dar un Kudo</BaseButton>
      </template>
    </PageHeader>

    <p v-if="aviso" class="muro__aviso" role="status">{{ aviso }}</p>

    <BaseCard class="muro__filtros">
      <BaseSelect
        v-model="filtros.categoria"
        class="muro__filtro-categoria"
        label="Categoría"
        placeholder="Todas"
        :options="opcionesCategoria"
        @update:model-value="filtrar"
      />
      <BaseSelect
        v-model="filtros.persona"
        class="muro__filtro-persona"
        label="Persona"
        placeholder="Todas"
        :options="opcionesPersona"
        @update:model-value="filtrar"
      />
      <BaseButton variant="outline" class="muro__limpiar" @click="limpiar">Limpiar</BaseButton>
    </BaseCard>

    <p v-if="cargando" class="muro__estado" role="status">Cargando el muro…</p>
    <EmptyState
      v-else-if="error"
      icon="alert"
      title="No fue posible cargar el muro"
      :description="error"
    />
    <EmptyState
      v-else-if="!pagina.kudos.length"
      icon="star"
      title="Aún no hay Kudos para mostrar"
      description="Sé el primero en reconocer a alguien de la comunidad."
    />
    <template v-else>
      <KudoCard v-for="kudo in pagina.kudos" :key="kudo.id" :kudo="kudo" />
      <div class="muro__paginacion">
        <span>{{ pagina.totalKudos }} Kudos</span>
        <BasePagination
          v-if="pagina.totalPaginas > 1"
          :page="pagina.pagina"
          :total-pages="pagina.totalPaginas"
          @change="cargar"
        />
      </div>
    </template>

    <CrearKudoModal :abierto="creando" @cerrar="creando = false" @publicado="publicado" />
  </section>
</template>

<style scoped>
.muro {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.muro__filtros {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: var(--space-3);
  align-items: end;
}

.muro__estado {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-text-muted);
}

.muro__aviso {
  padding: var(--space-3);
  color: var(--color-success);
  background: var(--color-success-soft);
  border-radius: var(--radius-sm);
}

.muro__paginacion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

@media (max-width: 720px) {
  .muro__filtros {
    grid-template-columns: 1fr;
  }
}
</style>
