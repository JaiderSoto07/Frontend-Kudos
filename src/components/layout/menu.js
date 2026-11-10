export const GRUPOS_MENU = [[{ label: 'Inicio', icon: 'home', to: '/inicio' }]]

export function menuSegunRol(tieneRol) {
  return GRUPOS_MENU.map((grupo) => grupo.filter((item) => tieneRol(item.roles))).filter(
    (grupo) => grupo.length,
  )
}
