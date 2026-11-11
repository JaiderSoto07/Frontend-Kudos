import {
  ROLES_APROBADORES,
  ROLES_CONSULTAN_AUDITORIA,
  ROLES_CONSULTAN_ORGANIZACION,
  ROLES_GESTORES_CATEGORIAS,
  ROLES_MODERADORES,
  ROLES_QUE_REGISTRAN_AUTORIDADES,
} from '@/shared/domain/cuenta'

export const GRUPOS_MENU = [
  [
    { label: 'Inicio', icon: 'home', to: '/inicio' },
    { label: 'Mis Kudos', icon: 'star', to: '/mis-kudos' },
    { label: 'Mis reportes', icon: 'flag', to: '/mis-reportes' },
  ],
  [
    { label: 'Solicitudes', icon: 'users', to: '/solicitudes', roles: ROLES_APROBADORES },
    {
      label: 'Registrar autoridad',
      icon: 'building',
      to: '/autoridades',
      roles: ROLES_QUE_REGISTRAN_AUTORIDADES,
    },
    { label: 'Categorías', icon: 'tag', to: '/categorias', roles: ROLES_GESTORES_CATEGORIAS },
    { label: 'Moderación', icon: 'flag', to: '/moderacion', roles: ROLES_MODERADORES },
    { label: 'Auditoría', icon: 'list', to: '/auditoria', roles: ROLES_CONSULTAN_AUDITORIA },
  ],
  [
    { label: 'Estructura', icon: 'building', to: '/estructura' },
    {
      label: 'Facultades',
      icon: 'building',
      to: '/facultades',
      roles: ROLES_CONSULTAN_ORGANIZACION,
    },
    { label: 'Programas', icon: 'list', to: '/programas', roles: ROLES_CONSULTAN_ORGANIZACION },
  ],
  [{ label: 'Mi cuenta', icon: 'user', to: '/mi-cuenta' }],
]

export function menuSegunRol(tieneRol) {
  return GRUPOS_MENU.map((grupo) => grupo.filter((item) => tieneRol(item.roles))).filter(
    (grupo) => grupo.length,
  )
}
