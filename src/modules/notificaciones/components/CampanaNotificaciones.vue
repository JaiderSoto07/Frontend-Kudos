<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/icons/AppIcon.vue'
import { formatFechaHora } from '@/modules/kudos/utils/kudoUtils'
import { useNotificacionStore } from '../stores/notificacionStore'
import { destinoDe, textoContador } from '../utils/notificacionUtils'

const store = useNotificacionStore()
const route = useRoute()
const router = useRouter()
const abierta = ref(false)
const errorAccion = ref('')

watch(() => route.fullPath, store.cargar, { immediate: true })

async function alternar() {
  abierta.value = !abierta.value
  errorAccion.value = ''
  if (abierta.value) await store.cargar()
}

async function abrir(notificacion) {
  errorAccion.value = ''
  try {
    await store.marcarLeida(notificacion)
    abierta.value = false
    await router.push(destinoDe(notificacion))
  } catch (e) {
    errorAccion.value = e.message
  }
}

async function marcarTodas() {
  errorAccion.value = ''
  try {
    await store.marcarTodas()
  } catch (e) {
    errorAccion.value = e.message
  }
}
</script>

<template>
  <div class="campana" @keydown.esc="abierta = false">
    <button
      type="button"
      class="campana__boton"
      :aria-label="`Notificaciones: ${store.noLeidas} sin leer`"
      aria-haspopup="true"
      :aria-expanded="abierta"
      @click="alternar"
    >
      <AppIcon name="bell" :size="22" />
      <span v-if="store.noLeidas" class="campana__contador">{{
        textoContador(store.noLeidas)
      }}</span>
    </button>

    <div v-if="abierta" class="campana__overlay" @click="abierta = false" />
    <div v-if="abierta" class="campana__panel" role="region" aria-label="Notificaciones">
      <header class="campana__encabezado">
        <strong>Notificaciones</strong>
        <button v-if="store.noLeidas" type="button" class="campana__todas" @click="marcarTodas">
          Marcar todas como leídas
        </button>
      </header>
      <p v-if="store.error || errorAccion" class="campana__error" role="alert">
        {{ errorAccion || store.error }}
      </p>
      <p v-else-if="!store.notificaciones.length" class="campana__vacia">
        No tienes notificaciones.
      </p>
      <ul v-else class="campana__lista">
        <li v-for="notificacion in store.notificaciones" :key="notificacion.id">
          <button
            type="button"
            class="campana__item"
            :class="{ 'campana__item--nueva': !notificacion.leida }"
            @click="abrir(notificacion)"
          >
            <span class="campana__mensaje">{{ notificacion.mensaje }}</span>
            <span class="campana__fecha">{{ formatFechaHora(notificacion.fechaCreacion) }}</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.campana {
  position: relative;
}

.campana__boton {
  position: relative;
  display: flex;
  padding: var(--space-2);
  color: var(--color-text-strong);
  background: none;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
}

.campana__boton:hover {
  background: var(--color-table-head);
}

.campana__contador {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 18px;
  padding: 0 4px;
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  color: #fff;
  text-align: center;
  background: var(--color-danger);
  border-radius: 9px;
}

.campana__overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
}

.campana__panel {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  width: min(360px, 90vw);
  max-height: 70vh;
  overflow: hidden;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.campana__encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.campana__todas {
  padding: 0;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
}

.campana__lista {
  overflow-y: auto;
}

.campana__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
  padding: var(--space-3);
  text-align: left;
  color: var(--color-text);
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
}

.campana__item:hover {
  background: var(--color-table-head);
}

.campana__item--nueva {
  font-weight: 600;
  border-left: 3px solid var(--color-primary);
}

.campana__mensaje {
  overflow-wrap: anywhere;
}

.campana__fecha,
.campana__vacia {
  font-size: var(--text-sm);
  font-weight: 400;
  color: var(--color-text-muted);
}

.campana__vacia,
.campana__error {
  padding: var(--space-3);
}

.campana__error {
  font-size: var(--text-sm);
  color: var(--color-danger);
}
</style>
