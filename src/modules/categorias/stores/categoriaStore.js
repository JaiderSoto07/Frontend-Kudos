import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { categoriaService } from '../services/categoriaService'
import { coincideBusqueda } from '../utils/categoriaValidations'

export const ESTADOS = {
  ACTIVA: 'activa',
  INACTIVA: 'inactiva',
}

const porNombre = (a, b) => a.nombre.localeCompare(b.nombre, 'es')

export const useCategoriaStore = defineStore('categoria', () => {
  const categorias = ref([])
  const filtros = reactive({ texto: '', estado: '' })
  const loading = ref(false)
  const error = ref(null)
  const modal = reactive({ abierto: false, categoria: null })

  const filasFiltradas = computed(() =>
    categorias.value
      .filter(
        (c) =>
          coincideBusqueda(c, filtros.texto) &&
          (!filtros.estado || (filtros.estado === ESTADOS.ACTIVA) === c.activa),
      )
      .toSorted(porNombre),
  )

  const totalActivas = computed(() => categorias.value.filter((c) => c.activa).length)

  async function cargar() {
    loading.value = true
    error.value = null
    try {
      categorias.value = await categoriaService.listarTodas()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function recargar() {
    categorias.value = await categoriaService.listarTodas()
  }

  function setFiltro(campo, valor) {
    filtros[campo] = valor
  }

  function limpiarFiltros() {
    filtros.texto = ''
    filtros.estado = ''
  }

  function abrirCrear() {
    Object.assign(modal, { abierto: true, categoria: null })
  }

  function abrirEditar(categoria) {
    Object.assign(modal, { abierto: true, categoria })
  }

  function cerrarModal() {
    modal.abierto = false
  }

  async function guardar(datos) {
    if (datos.id) await categoriaService.modificar(datos.id, datos)
    else await categoriaService.registrar(datos)
    await recargar()
  }

  async function cambiarEstado(categoria) {
    if (categoria.activa) await categoriaService.desactivar(categoria.id)
    else await categoriaService.activar(categoria.id)
    await recargar()
  }

  return {
    categorias,
    filtros,
    loading,
    error,
    modal,
    filasFiltradas,
    totalActivas,
    cargar,
    setFiltro,
    limpiarFiltros,
    abrirCrear,
    abrirEditar,
    cerrarModal,
    guardar,
    cambiarEstado,
  }
})
