import { ROLES_GESTORES_CATEGORIAS } from '@/shared/domain/cuenta'

export const GRUPOS_MENU = [
  [{ label: 'Inicio', icon: 'home', to: '/inicio' }],
  [{ label: 'Categorías', icon: 'tag', to: '/categorias', roles: ROLES_GESTORES_CATEGORIAS }],
]

export function menuSegunRol(tieneRol) {
  return GRUPOS_MENU.map((grupo) => grupo.filter((item) => tieneRol(item.roles))).filter(
    (grupo) => grupo.length,
  )
}
