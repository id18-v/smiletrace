// src/config/procedures.ts

export interface ProcedureItem {
  id: string;
  code: string;
  name: string;
  nameRo?: string; // Romanian name
  category: ProcedureCategory;
  description?: string;
  defaultCost: number; // în RON
  insuranceCost?: number;
  estimatedDurationMinutes: number;
  requiresAnesthesia?: boolean;
  commonlyUsed?: boolean;
  surfaces?: boolean; // dacă procedura poate fi aplicată pe suprafețe
  perTooth?: boolean; // dacă prețul e per dinte
  tags?: string[];
}

export enum ProcedureCategory {
  DIAGNOSTIC = 'DIAGNOSTIC',
  PREVENTIVE = 'PREVENTIVE',
  RESTORATIVE = 'RESTORATIVE',
  ENDODONTICS = 'ENDODONTICS',
  ORAL_SURGERY = 'ORAL_SURGERY',
  PERIODONTICS = 'PERIODONTICS',
  ORTHODONTICS = 'ORTHODONTICS',
  PROSTHODONTICS = 'PROSTHODONTICS',
  COSMETIC = 'COSMETIC',
  EMERGENCY = 'EMERGENCY',
  OTHER = 'OTHER'
}

export const categoryInfo = {
  [ProcedureCategory.DIAGNOSTIC]: {
    label: 'Diagnostic',
    labelRo: 'Diagnostic',
    icon: '🔍',
    color: 'blue',
    description: 'Examinări și investigații'
  },
  [ProcedureCategory.PREVENTIVE]: {
    label: 'Preventive',
    labelRo: 'Preventiv',
    icon: '🛡️',
    color: 'green',
    description: 'Tratamente preventive și profilactice'
  },
  [ProcedureCategory.RESTORATIVE]: {
    label: 'Restorative',
    labelRo: 'Restaurativ',
    icon: '🦷',
    color: 'orange',
    description: 'Obturații și restaurări'
  },
  [ProcedureCategory.ENDODONTICS]: {
    label: 'Endodontics',
    labelRo: 'Endodonție',
    icon: '💉',
    color: 'red',
    description: 'Tratamente de canal'
  },
  [ProcedureCategory.ORAL_SURGERY]: {
    label: 'Oral Surgery',
    labelRo: 'Chirurgie Orală',
    icon: '🔪',
    color: 'purple',
    description: 'Extracții și intervenții chirurgicale'
  },
  [ProcedureCategory.PERIODONTICS]: {
    label: 'Periodontics',
    labelRo: 'Parodontologie',
    icon: '🩺',
    color: 'pink',
    description: 'Tratamente gingivale și parodontale'
  },
  [ProcedureCategory.ORTHODONTICS]: {
    label: 'Orthodontics',
    labelRo: 'Ortodonție',
    icon: '🎯',
    color: 'teal',
    description: 'Aparate dentare și aliniere'
  },
  [ProcedureCategory.PROSTHODONTICS]: {
    label: 'Prosthodontics',
    labelRo: 'Protetică',
    icon: '👑',
    color: 'indigo',
    description: 'Coroane, punți și proteze'
  },
  [ProcedureCategory.COSMETIC]: {
    label: 'Cosmetic',
    labelRo: 'Cosmetic',
    icon: '✨',
    color: 'yellow',
    description: 'Tratamente estetice'
  },
  [ProcedureCategory.EMERGENCY]: {
    label: 'Emergency',
    labelRo: 'Urgență',
    icon: '🚨',
    color: 'red',
    description: 'Tratamente de urgență'
  },
  [ProcedureCategory.OTHER]: {
    label: 'Other',
    labelRo: 'Altele',
    icon: '📋',
    color: 'gray',
    description: 'Alte proceduri'
  }
};

// Seed data - Common dental procedures in Romania
export const defaultProcedures: ProcedureItem[] = [
  // DIAGNOSTIC
  {
    id: 'proc-001',
    code: 'D0120',
    name: 'Periodic Oral Evaluation',
    nameRo: 'Consultație periodică',
    category: ProcedureCategory.DIAGNOSTIC,
    description: 'Examinare orală periodică pentru pacient existent',
    defaultCost: 100,
    insuranceCost: 50,
    estimatedDurationMinutes: 20,
    commonlyUsed: true,
    tags: ['consultație', 'control']
  },
  {
    id: 'proc-002',
    code: 'D0140',
    name: 'Emergency Oral Evaluation',
    nameRo: 'Consultație de urgență',
    category: ProcedureCategory.DIAGNOSTIC,
    description: 'Evaluare orală de urgență - problemă focalizată',
    defaultCost: 150,
    insuranceCost: 75,
    estimatedDurationMinutes: 30,
    commonlyUsed: true,
    tags: ['urgență', 'durere']
  },
  {
    id: 'proc-003',
    code: 'D0210',
    name: 'Complete X-ray Series',
    nameRo: 'Radiografie panoramică',
    category: ProcedureCategory.DIAGNOSTIC,
    description: 'Serie completă radiografică intraorală',
    defaultCost: 200,
    insuranceCost: 150,
    estimatedDurationMinutes: 15,
    commonlyUsed: true,
    tags: ['radiografie', 'panoramic']
  },
  {
    id: 'proc-004',
    code: 'D0220',
    name: 'Periapical X-ray',
    nameRo: 'Radiografie periapicală',
    category: ProcedureCategory.DIAGNOSTIC,
    description: 'Prima radiografie periapicală',
    defaultCost: 50,
    insuranceCost: 30,
    estimatedDurationMinutes: 5,
    commonlyUsed: true,
    perTooth: true,
    tags: ['radiografie', 'retroalveolar']
  },

  // PREVENTIVE
  {
    id: 'proc-005',
    code: 'D1110',
    name: 'Prophylaxis - Adult',
    nameRo: 'Detartraj și periaj profesional',
    category: ProcedureCategory.PREVENTIVE,
    description: 'Curățare profesională pentru adulți',
    defaultCost: 250,
    insuranceCost: 150,
    estimatedDurationMinutes: 45,
    commonlyUsed: true,
    tags: ['detartraj', 'igienizare', 'profilaxie']
  },
  {
    id: 'proc-006',
    code: 'D1206',
    name: 'Fluoride Varnish',
    nameRo: 'Fluoridare topică',
    category: ProcedureCategory.PREVENTIVE,
    description: 'Aplicare lac cu fluor',
    defaultCost: 100,
    insuranceCost: 50,
    estimatedDurationMinutes: 10,
    tags: ['fluor', 'prevenție']
  },
  {
    id: 'proc-007',
    code: 'D1351',
    name: 'Sealant',
    nameRo: 'Sigilare',
    category: ProcedureCategory.PREVENTIVE,
    description: 'Sigilare șanțuri și fisuri - per dinte',
    defaultCost: 80,
    insuranceCost: 40,
    estimatedDurationMinutes: 15,
    perTooth: true,
    tags: ['sigilare', 'prevenție']
  },

  // RESTORATIVE
  {
    id: 'proc-008',
    code: 'D2330',
    name: 'Composite - One Surface',
    nameRo: 'Obturație compozit - 1 suprafață',
    category: ProcedureCategory.RESTORATIVE,
    description: 'Obturație compozit pe o suprafață',
    defaultCost: 200,
    insuranceCost: 100,
    estimatedDurationMinutes: 30,
    requiresAnesthesia: true,
    commonlyUsed: true,
    surfaces: true,
    perTooth: true,
    tags: ['obturație', 'plombă', 'compozit']
  },
  {
    id: 'proc-009',
    code: 'D2331',
    name: 'Composite - Two Surfaces',
    nameRo: 'Obturație compozit - 2 suprafețe',
    category: ProcedureCategory.RESTORATIVE,
    description: 'Obturație compozit pe două suprafețe',
    defaultCost: 250,
    insuranceCost: 125,
    estimatedDurationMinutes: 40,
    requiresAnesthesia: true,
    commonlyUsed: true,
    surfaces: true,
    perTooth: true,
    tags: ['obturație', 'plombă', 'compozit']
  },
  {
    id: 'proc-010',
    code: 'D2332',
    name: 'Composite - Three Surfaces',
    nameRo: 'Obturație compozit - 3 suprafețe',
    category: ProcedureCategory.RESTORATIVE,
    description: 'Obturație compozit pe trei suprafețe',
    defaultCost: 300,
    insuranceCost: 150,
    estimatedDurationMinutes: 50,
    requiresAnesthesia: true,
    commonlyUsed: true,
    surfaces: true,
    perTooth: true,
    tags: ['obturație', 'plombă', 'compozit']
  },
  {
    id: 'proc-011',
    code: 'D2335',
    name: 'Composite - Four+ Surfaces',
    nameRo: 'Obturație compozit - 4+ suprafețe',
    category: ProcedureCategory.RESTORATIVE,
    description: 'Obturație compozit pe patru sau mai multe suprafețe',
    defaultCost: 350,
    insuranceCost: 175,
    estimatedDurationMinutes: 60,
    requiresAnesthesia: true,
    surfaces: true,
    perTooth: true,
    tags: ['obturație', 'plombă', 'compozit', 'reconstrucție']
  },

  // ENDODONTICS
  {
    id: 'proc-012',
    code: 'D3310',
    name: 'Root Canal - Anterior',
    nameRo: 'Tratament endodontic - dinte anterior',
    category: ProcedureCategory.ENDODONTICS,
    description: 'Tratament de canal pentru dinte anterior (incisiv/canin)',
    defaultCost: 800,
    insuranceCost: 400,
    estimatedDurationMinutes: 60,
    requiresAnesthesia: true,
    commonlyUsed: true,
    perTooth: true,
    tags: ['canal', 'endodonție', 'devitalizare']
  },
  {
    id: 'proc-013',
    code: 'D3320',
    name: 'Root Canal - Premolar',
    nameRo: 'Tratament endodontic - premolar',
    category: ProcedureCategory.ENDODONTICS,
    description: 'Tratament de canal pentru premolar',
    defaultCost: 1000,
    insuranceCost: 500,
    estimatedDurationMinutes: 90,
    requiresAnesthesia: true,
    commonlyUsed: true,
    perTooth: true,
    tags: ['canal', 'endodonție', 'devitalizare']
  },
  {
    id: 'proc-014',
    code: 'D3330',
    name: 'Root Canal - Molar',
    nameRo: 'Tratament endodontic - molar',
    category: ProcedureCategory.ENDODONTICS,
    description: 'Tratament de canal pentru molar',
    defaultCost: 1200,
    insuranceCost: 600,
    estimatedDurationMinutes: 120,
    requiresAnesthesia: true,
    commonlyUsed: true,
    perTooth: true,
    tags: ['canal', 'endodonție', 'devitalizare']
  },

  // ORAL SURGERY
  {
    id: 'proc-015',
    code: 'D7140',
    name: 'Simple Extraction',
    nameRo: 'Extracție simplă',
    category: ProcedureCategory.ORAL_SURGERY,
    description: 'Extracție dinte erupt',
    defaultCost: 200,
    insuranceCost: 100,
    estimatedDurationMinutes: 30,
    requiresAnesthesia: true,
    commonlyUsed: true,
    perTooth: true,
    tags: ['extracție', 'scoatere']
  },
  {
    id: 'proc-016',
    code: 'D7210',
    name: 'Surgical Extraction',
    nameRo: 'Extracție chirurgicală',
    category: ProcedureCategory.ORAL_SURGERY,
    description: 'Extracție chirurgicală cu lambou',
    defaultCost: 400,
    insuranceCost: 200,
    estimatedDurationMinutes: 45,
    requiresAnesthesia: true,
    perTooth: true,
    tags: ['extracție', 'chirurgie']
  },
  {
    id: 'proc-017',
    code: 'D7240',
    name: 'Wisdom Tooth Extraction',
    nameRo: 'Extracție molari de minte',
    category: ProcedureCategory.ORAL_SURGERY,
    description: 'Extracție molar de minte inclus',
    defaultCost: 500,
    insuranceCost: 250,
    estimatedDurationMinutes: 60,
    requiresAnesthesia: true,
    commonlyUsed: true,
    perTooth: true,
    tags: ['molar', 'minte', 'extracție']
  },

  // PERIODONTICS
  {
    id: 'proc-018',
    code: 'D4341',
    name: 'Scaling and Root Planing',
    nameRo: 'Chiuretaj și surfasaj radicular',
    category: ProcedureCategory.PERIODONTICS,
    description: 'Chiuretaj subgingival per cadran',
    defaultCost: 300,
    insuranceCost: 150,
    estimatedDurationMinutes: 45,
    requiresAnesthesia: true,
    tags: ['parodontologie', 'chiuretaj']
  },
  {
    id: 'proc-019',
    code: 'D4910',
    name: 'Periodontal Maintenance',
    nameRo: 'Întreținere parodontală',
    category: ProcedureCategory.PERIODONTICS,
    description: 'Proceduri de întreținere parodontală',
    defaultCost: 250,
    insuranceCost: 125,
    estimatedDurationMinutes: 60,
    tags: ['parodontologie', 'întreținere']
  },

  // PROSTHODONTICS
  {
    id: 'proc-020',
    code: 'D2740',
    name: 'Porcelain Crown',
    nameRo: 'Coroană ceramică',
    category: ProcedureCategory.PROSTHODONTICS,
    description: 'Coroană integral ceramică',
    defaultCost: 1500,
    insuranceCost: 750,
    estimatedDurationMinutes: 60,
    commonlyUsed: true,
    perTooth: true,
    tags: ['coroană', 'ceramică', 'protetică']
  },
  {
    id: 'proc-021',
    code: 'D2750',
    name: 'PFM Crown',
    nameRo: 'Coroană metalo-ceramică',
    category: ProcedureCategory.PROSTHODONTICS,
    description: 'Coroană metalo-ceramică',
    defaultCost: 1200,
    insuranceCost: 600,
    estimatedDurationMinutes: 60,
    commonlyUsed: true,
    perTooth: true,
    tags: ['coroană', 'metalo-ceramică', 'protetică']
  },
  {
    id: 'proc-022',
    code: 'D2950',
    name: 'Core Buildup',
    nameRo: 'Reconstituire pivot',
    category: ProcedureCategory.PROSTHODONTICS,
    description: 'Reconstituire de bont cu pivot',
    defaultCost: 300,
    insuranceCost: 150,
    estimatedDurationMinutes: 30,
    perTooth: true,
    tags: ['pivot', 'reconstituire']
  },
  {
    id: 'proc-023',
    code: 'D6010',
    name: 'Implant',
    nameRo: 'Implant dentar',
    category: ProcedureCategory.PROSTHODONTICS,
    description: 'Inserare implant dentar endosos',
    defaultCost: 3000,
    insuranceCost: 0,
    estimatedDurationMinutes: 90,
    commonlyUsed: true,
    perTooth: true,
    tags: ['implant', 'chirurgie', 'protetică']
  },
  {
    id: 'proc-024',
    code: 'D6066',
    name: 'Implant Crown',
    nameRo: 'Coroană pe implant',
    category: ProcedureCategory.PROSTHODONTICS,
    description: 'Coroană ceramică pe implant',
    defaultCost: 1800,
    insuranceCost: 0,
    estimatedDurationMinutes: 45,
    perTooth: true,
    tags: ['coroană', 'implant', 'protetică']
  },
  {
    id: 'proc-025',
    code: 'D6240',
    name: 'Fixed Bridge',
    nameRo: 'Punte fixă',
    category: ProcedureCategory.PROSTHODONTICS,
    description: 'Element de punte ceramică',
    defaultCost: 1200,
    insuranceCost: 600,
    estimatedDurationMinutes: 60,
    perTooth: true,
    tags: ['punte', 'protetică']
  },

  // COSMETIC
  {
    id: 'proc-026',
    code: 'D9972',
    name: 'Teeth Whitening',
    nameRo: 'Albire dentară profesională',
    category: ProcedureCategory.COSMETIC,
    description: 'Albire dentară în cabinet',
    defaultCost: 800,
    insuranceCost: 0,
    estimatedDurationMinutes: 90,
    commonlyUsed: true,
    tags: ['albire', 'estetic', 'cosmetic']
  },
  {
    id: 'proc-027',
    code: 'D2962',
    name: 'Veneer',
    nameRo: 'Fațetă ceramică',
    category: ProcedureCategory.COSMETIC,
    description: 'Fațetă ceramică estetică',
    defaultCost: 1800,
    insuranceCost: 0,
    estimatedDurationMinutes: 60,
    perTooth: true,
    tags: ['fațetă', 'estetic', 'cosmetic']
  },

  // ORTHODONTICS
  {
    id: 'proc-028',
    code: 'D8070',
    name: 'Comprehensive Orthodontic Treatment',
    nameRo: 'Aparat dentar fix',
    category: ProcedureCategory.ORTHODONTICS,
    description: 'Tratament ortodontic complet cu aparat fix',
    defaultCost: 5000,
    insuranceCost: 2500,
    estimatedDurationMinutes: 60,
    tags: ['ortodonție', 'aparat', 'bretele']
  },
  {
    id: 'proc-029',
    code: 'D8090',
    name: 'Invisalign Treatment',
    nameRo: 'Tratament Invisalign',
    category: ProcedureCategory.ORTHODONTICS,
    description: 'Tratament cu gutiere transparente',
    defaultCost: 8000,
    insuranceCost: 0,
    estimatedDurationMinutes: 30,
    tags: ['ortodonție', 'invisalign', 'gutiere']
  },

  // EMERGENCY
  {
    id: 'proc-030',
    code: 'D9110',
    name: 'Emergency Treatment',
    nameRo: 'Tratament de urgență durere',
    category: ProcedureCategory.EMERGENCY,
    description: 'Tratament paliativ pentru durere',
    defaultCost: 150,
    insuranceCost: 75,
    estimatedDurationMinutes: 30,
    commonlyUsed: true,
    tags: ['urgență', 'durere']
  },
  {
    id: 'proc-031',
    code: 'D9230',
    name: 'Anesthesia',
    nameRo: 'Anestezie locală',
    category: ProcedureCategory.OTHER,
    description: 'Anestezie locală cu xilaină',
    defaultCost: 50,
    insuranceCost: 25,
    estimatedDurationMinutes: 5,
    tags: ['anestezie']
  }
];

// Helper functions
export function getProceduresByCategory(category: ProcedureCategory): ProcedureItem[] {
  return defaultProcedures.filter(proc => proc.category === category);
}

export function getCommonlyUsedProcedures(): ProcedureItem[] {
  return defaultProcedures.filter(proc => proc.commonlyUsed);
}

export function searchProcedures(query: string): ProcedureItem[] {
  const searchTerm = query.toLowerCase();
  return defaultProcedures.filter(proc => 
    proc.name.toLowerCase().includes(searchTerm) ||
    proc.nameRo?.toLowerCase().includes(searchTerm) ||
    proc.code.toLowerCase().includes(searchTerm) ||
    proc.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
  );
}

export function calculateTotalCost(procedureIds: string[], useInsurancePrice = false): number {
  return procedureIds.reduce((total, id) => {
    const procedure = defaultProcedures.find(p => p.id === id);
    if (procedure) {
      const cost = useInsurancePrice && procedure.insuranceCost 
        ? procedure.insuranceCost 
        : procedure.defaultCost;
      return total + cost;
    }
    return total;
  }, 0);
}

export function calculateTotalDuration(procedureIds: string[]): number {
  return procedureIds.reduce((total, id) => {
    const procedure = defaultProcedures.find(p => p.id === id);
    return total + (procedure?.estimatedDurationMinutes || 0);
  }, 0);
}