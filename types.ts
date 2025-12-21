
export enum AppView {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ADMIN_CONFIG = 'ADMIN_CONFIG',
  SERVICE_DETAIL = 'SERVICE_DETAIL',
  TASKS = 'TASKS',
  FINANCIALS = 'FINANCIALS',
  GUIDE_CONTENT = 'GUIDE_CONTENT',
  MARKETING = 'MARKETING',
  STRESS_TEST = 'STRESS_TEST',
  RADIO_OPS = 'RADIO_OPS'
}

export type UserRole = 'ADMIN' | 'GUIDE' | 'STAFF';

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  commissionRate: number;
  photoUrl?: string;
}

export interface DamStatus {
  name: string;
  dischargeRate: string;
  status: 'NORMAL' | 'ELEVADO' | 'CRÍTICO';
  prediction6h?: string;
}

export interface WeatherConditions {
  temp: number;
  windSpeed: number;
  windDirection?: string;
  condition: string;
  visibility: string;
  riverFlow?: string;
  tideHeight?: string;
  tideTrend?: 'SUBIR' | 'DESCER' | 'ESTAVEL';
  dams?: DamStatus[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  predictiveAlert?: string;
  lastUpdated: string;
}

// --- NOVO SISTEMA LOGÍSTICO GRANULAR ---
export type LogisticsTaskType = 'PREP_BARCO' | 'DEGUSTACAO' | 'ABASTECER_COMB' | 'ABASTECER_AGUA' | 'FECHO_COMPLETO';

export interface LogisticsTaskEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: LogisticsTaskType;
  boatId: string;
  staffId: string;
  status: 'PENDING' | 'DONE';
  completedAt?: string;
  // Evidence fields (principalmente para FECHO_COMPLETO)
  fuelPhoto?: string;
  waterPhoto?: string;
  champagneStock?: number;
  notes?: string;
}
// ----------------------------------------

export interface Boat {
  id: string;
  name: string;
  cap: number;
  photoUrl?: string;
  videoUrl?: string;
  tiktokUrl?: string;
  info?: string;
}

export interface ChecklistStep {
  id: string;
  label: string;
  category: 'CLEANING' | 'SAFETY' | 'MAINTENANCE';
}

export interface ServiceTask {
  id: string;
  date?: string;
  time: string;
  clientName: string;
  partnerName?: string;
  isPrivate: boolean;
  boat: string;
  boatId?: string;
  pax: number;
  assignedGuides: string[];
  type: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  notes?: string;
  estimatedValue: number;
  collectedTips?: number;
  notifiedSoon?: boolean;
  crew?: {
    condutor: string;
    assistente: string;
    guia: string;
  };
  // Campos de contexto para fecho na Service Detail
  fuelLevel?: number;
  fuelPhotoTaken?: boolean;
  waterLevelOk?: boolean;
  waterPhotoTaken?: boolean;
  completedSteps?: string[];
}

export interface KnowledgeArticle {
  id: string;
  category: 'LEGISLAÇÃO' | 'SEGURANÇA' | 'QUINTAS' | 'RESTAURANTES' | 'HISTÓRIA' | 'MIRADOUROS' | 'CURIOSIDADES' | 'LOGÍSTICA' | 'ATIVIDADES' | 'ALDEIAS' | 'COMERCIO' | 'SAZONALIDADE';
  title: string;
  content: string;
  imageUrls: string[];
  phone?: string;
  website?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
  uploadedBy: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: { title: string; uri: string }[];
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  active: boolean;
  email?: string;
  phone?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  type: 'EMERGENCY' | 'SECURITY' | 'OPS';
}

export interface DocumentResource {
  id: string;
  title: string;
  url: string;
  category: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'SUCCESS';
  timestamp: Date;
}

export interface OperationalEntry {
  id: string;
  boatName: string;
  guideName: string;
  paxCount: number;
  timestamp: string;
  route: string;
  commission: number;
  status: 'VALIDATED' | 'FLAGGED' | 'PENDING';
}

export interface DailyActivity {
  date: string;
  isWorked: boolean;
  baseWage: number;
  tips: number;
}
