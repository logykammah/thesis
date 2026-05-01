export const BRANCHES = [
  {
    id: 'BR-DOKKI',
    shortName: 'Dokki',
    name: 'Dokki Branch',
    address: 'Building 28 Hussien Wassef St., Medan El Messaha, Dokki, Giza',
    area: 'Dokki',
  },
  {
    id: 'BR-ZAYED',
    shortName: 'Sheikh Zayed',
    name: 'Sheikh Zayed Branch',
    address: 'Beverly Hills, Plot B12, El Sheikh Zayed, 6th of October City, Giza',
    area: 'Sheikh Zayed',
  },
];

export const CLINIC = {
  name: 'Clarity Dental Clinic',
  owner: 'Dr Amr Elkammah',
  phones: ['0127 937 9396', '+02333351617'],
  facebook: 'https://www.facebook.com/Claritydentalclinic',
  branches: BRANCHES,
  /** @deprecated use branches */
  address: BRANCHES[0].address,
};

export function branchLabel(id) {
  return BRANCHES.find((b) => b.id === id)?.shortName || id;
}
