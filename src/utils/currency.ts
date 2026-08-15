const formatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

export function formatCurrency(value: number): string {
  return formatter.format(value)
}
