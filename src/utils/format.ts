/**
 * Formats quantity values for display across screens.
 * Unit of measurement is currently disabled by requirement, but ready for future enablement.
 */
export const UNIT_MEASURE = '' // Set to ' UN' or desired unit when needed in the future

export function formatQuantity(qty: number | undefined | null): string {
  if (qty === undefined || qty === null) return '0'
  return `${qty}${UNIT_MEASURE}`
}
