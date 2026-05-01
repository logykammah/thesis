export function branchNameFromState(state, branchId) {
  return state?.branches?.find((b) => b.id === branchId)?.shortName || branchId || '—';
}
