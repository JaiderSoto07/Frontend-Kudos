import {
  ROLES_APROBADORES,
  ROLES_GESTORES_CATEGORIAS,
  ROLES_QUE_REGISTRAN_AUTORIDADES,
} from '@/shared/domain/cuenta'

export const GRUPOS_MENU = [
  [{ label: 'Inicio', icon: 'home', to: '/inicio' }],
  [
    { label: 'Solicitudes', icon: 'users', to: '/solicitudes', roles: ROLES_APROBADORES },
    {
      label: 'Registrar autoridad',
      icon: 'building',
      to: '/autoridades',
      roles: ROLES_QUE_REGISTRAN_AUTORIDADES,
    },
    { label: 'Categorías', icon: 'tag', to: '/categorias', roles: ROLES_GESTORES_CATEGORIAS },
  ],
  [{ label: 'Mi cuenta', icon: 'user', to: '/mi-cuenta' }],
]

export function menuSegunRol(tieneRol) {
  return GRUPOS_MENU.map((grupo) => grupo.filter((item) => tieneRol(item.roles))).filter(
    (grupo) => grupo.length,
  )
}
