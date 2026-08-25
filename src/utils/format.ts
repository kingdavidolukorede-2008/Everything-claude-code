const NAIRA_FORMATTER = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

export function formatNaira(amount: number): string {
  return NAIRA_FORMATTER.format(amount)
}

/** Every dish's engraved plate lives at /images/<id>.svg */
export function plateFor(id: string): string {
  return `/images/${id}.svg`
}
