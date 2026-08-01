export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
  isError?: boolean;
}

export interface ChatRequest {
  message: string;
  history: { role: string; content: string }[];
}

export interface ChatResponse {
  reply: string;
  userId: string;
}

export interface DrugInfoResult {
  drugName: string;
  arabicName?: string;
  genericName: string;
  category: string;
  description: string;
  indications: string;
  contraindications: string;
  sideEffects: string;
  dosage: string;
  storageInstructions: string;
  requiresPrescription: boolean;
  isAvailableInSystem: boolean;
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'None' | 'Minor' | 'Moderate' | 'Severe' | 'Contraindicated';
  description: string;
  recommendation: string;
}

export interface InteractionCheckResult {
  checkedDrugs: string[];
  interactions: DrugInteraction[];
  hasSevereInteractions: boolean;
  summary: string;
}
