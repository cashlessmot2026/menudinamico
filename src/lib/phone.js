export function normalizarTelefono(s = '') {
  const d = String(s).replace(/\D/g, '')
  return d.length === 12 && d.startsWith('57') ? d.slice(2) : d
}
