/** @file Re-exports clinic constants and seed factory for backwards compatibility */

export { CLINIC, BRANCHES, branchLabel } from './clinicMeta';
export { SERVICE_RATES, SLOT_TIMES, SPECIALTIES, SERVICE_CATEGORY_ORDER } from './serviceCatalog';
export { createInitialState } from './createSeedState';
