<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { formatFechaHora } from '@/modules/kudos/utils/kudoUtils'
import DecisionModal from '../components/DecisionModal.vue'
import { moderacionService } from '../services/moderacionService'
import {
  nombreEstadoContenido,
  nombreMotivo,
  nombreTipo,
  TIPO_CONTENIDO,
} from '../utils/moderacionUtils'

const PESTANAS = [
  { valor: 'reportes', etiqueta: 'Reportes' },
  { valor: 'vetos', etiqueta: 'Histórico de vetos' },
]

const FILTROS_TIPO = [
  { valor: '', etiqueta: 'Todo' },
  { valor: TIPO_CONTENIDO.KUDO, etiqueta: 'Kudos' },
  { valor: TIPO_CONTENIDO.REPLICA, etiqueta: 'Réplicas' },
]

const pestana = ref('reportes')
const filtroTipo = ref('')
const contenidos = ref([])
const vetos = ref([])
const cargando = ref(true)
const error = ref('')
const aviso = ref('')
const decision = ref(null)
const iniciando = ref('')

const contenidosFiltrados = computed(() =>
  contenidos.value.filter((c) => !filtroTipo.value || c.tipoContenido === filtroTipo.value),
)
const vetosFiltrados = computed(() =>
  vetos.value.filter((v) => !filtroTipo.value || v.tipoContenido === filtroTipo.value),
)

async function cargar() {
  error.value = ''
  try {
    const [bandeja, historico] = await Promise.all([
      moderacionService.bandeja(),
      moderacionService.vetos(),
    ])
    contenidos.value = bandeja
    vetos.value = historico
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

async function iniciarRevision(contenido) {
  aviso.value = ''
  error.value = ''
  iniciando.value = contenido.idContenido
  try {
    await moderacionService.iniciarRevision(contenido.tipoContenido, contenido.idContenido)
    aviso.value = 'La revisión quedó iniciada.'
    await cargar()
  } catch (e) {
    error.value = e.message
  } finally {
    iniciando.value = ''
  }
}

function abrirDecision(accion, contenido) {
  decision.value = {
    accion,
    tipo: contenido.tipoContenido,
    id: contenido.idContenido,
    nombreAutor: contenido.nombreAutor,
  }
}

async function decidido(vetado) {
  decision.value = null
  aviso.value = vetado
    ? 'El contenido quedó vetado y se avisó a su autor.'
    : 'El contenido quedó liberado y vuelve a estar visible.'
  await cargar()
}

onMounted(cargar)
</script>

<template>
  <section class="moderacion">
    <PageHeader
      title="Moderación"
      subtitle="Revisa los contenidos reportados y consulta los vetos realizados."
    />
    <div class="moderacion__barra">
      <div class="moderacion__pestanas" role="tablist">
        <BaseButton
          v-for="opcion in PESTANAS"
          :key="opcion.valor"
          :variant="pestana === opcion.valor ? 'primary' : 'outline'"
          role="tab"
          :aria-selected="pestana === opcion.valor"
          :class="`moderacion__pestana-${opcion.valor}`"
          @click="pestana = opcion.valor"
        >
          {{ opcion.etiqueta }}
        </BaseButton>
      </div>
      <label class="moderacion__filtro">
        Tipo
        <select v-model="filtroTipo" class="input moderacion__filtro-tipo">
          <option v-for="opcion in FILTROS_TIPO" :key="opcion.valor" :value="opcion.valor">
            {{ opcion.etiqueta }}
          </option>
        </select>
      </label>
    </div>

    <p v-if="aviso" class="moderacion__aviso" role="status">{{ aviso }}</p>
    <p v-if="cargando" class="moderacion__estado" role="status">Cargando…</p>
    <EmptyState
      v-else-if="error"
      icon="alert"
      title="No fue posible completar la acción"
      :description="error"
    />

    <template v-else-if="pestana === 'reportes'">
      <EmptyState
        v-if="!contenidosFiltrados.length"
        icon="check"
        title="No hay reportes pendientes"
        description="Cuando alguien reporte un Kudo o una réplica, aparecerá aquí."
      />
      <BaseCard
        v-for="contenido in contenidosFiltrados"
        v-else
        :key="contenido.idContenido"
        class="moderacion__item"
      >
        <header class="moderacion__encabezado">
          <strong>{{ nombreTipo(contenido.tipoContenido) }} de {{ contenido.nombreAutor }}</strong>
          <span class="moderacion__etiqueta">{{
            nombreEstadoContenido(contenido.estadoContenido)
          }}</span>
          <span class="moderacion__cantidad">
            {{ contenido.cantidadReportes }}
            {{ contenido.cantidadReportes === 1 ? 'reporte' : 'reportes' }}
          </span>
        </header>
        <p class="moderacion__contenido">{{ contenido.contenido }}</p>
        <ul class="moderacion__reportes">
          <li v-for="reporte in contenido.reportes" :key="reporte.id">
            <strong>{{ nombreMotivo(reporte.motivo) }}</strong> · {{ reporte.nombreReportante }} ·
            {{ formatFechaHora(reporte.fechaReporte) }}
            <span v-if="reporte.descripcion"> — {{ reporte.descripcion }}</span>
          </li>
        </ul>
        <div class="moderacion__acciones">
          <RouterLink
            :to="{ name: 'kudo-detalle', params: { id: contenido.idKudo } }"
            class="moderacion__ver"
          >
            Ver en el Kudo
          </RouterLink>
          <BaseButton
            v-if="contenido.estadoContenido === 'REPORTADO'"
            variant="outline"
            class="moderacion__revisar"
            :loading="iniciando === contenido.idContenido"
            @click="iniciarRevision(contenido)"
          >
            Iniciar revisión
          </BaseButton>
          <BaseButton
            v-if="contenido.estadoContenido === 'EN_REVISION'"
            variant="outline"
            class="moderacion__liberar"
            @click="abrirDecision('liberar', contenido)"
          >
            Liberar
          </BaseButton>
          <BaseButton danger class="moderacion__vetar" @click="abrirDecision('vetar', contenido)">
            Vetar
          </BaseButton>
        </div>
      </BaseCard>
    </template>

    <template v-else>
      <EmptyState v-if="!vetosFiltrados.length" icon="flag" title="Aún no hay vetos" />
      <BaseCard
        v-for="veto in vetosFiltrados"
        v-else
        :key="veto.idModeracion"
        class="moderacion__veto"
      >
        <header class="moderacion__encabezado">
          <strong>{{ nombreTipo(veto.tipoContenido) }} de {{ veto.nombreAutor }}</strong>
          <span class="moderacion__cantidad">{{ formatFechaHora(veto.fechaVeto) }}</span>
        </header>
        <p class="moderacion__contenido moderacion__contenido--original">{{ veto.contenido }}</p>
        <dl class="moderacion__datos">
          <dt>Moderador</dt>
          <dd>{{ veto.nombreModerador }}</dd>
          <dt>Motivo</dt>
          <dd>{{ veto.motivo }}</dd>
          <dt>Reportes resueltos</dt>
          <dd>{{ veto.cantidadReportes }}</dd>
        </dl>
      </BaseCard>
    </template>

    <DecisionModal :decision="decision" @cerrar="decision = null" @decidido="decidido" />
  </section>
</template>

<style scoped>
.moderacion {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.moderacion__barra {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.moderacion__pestanas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.moderacion__filtro {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-label);
}

.moderacion__item,
.moderacion__veto {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.moderacion__encabezado {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-2) var(--space-3);
}

.moderacion__etiqueta {
  padding: 0 var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
}

.moderacion__cantidad,
.moderacion__estado,
.moderacion__reportes,
.moderacion__aviso {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.moderacion__contenido {
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.moderacion__reportes {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding-left: var(--space-4);
  list-style: disc;
}

.moderacion__acciones {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.moderacion__ver {
  margin-right: auto;
  font-weight: 600;
  color: var(--color-primary);
}

.moderacion__datos {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
}

.moderacion__datos dt {
  font-weight: 600;
  color: var(--color-label);
}

.moderacion__datos dd {
  overflow-wrap: anywhere;
}
</style>
