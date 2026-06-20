export type UserRole = 'worker' | 'hr' | 'finance' | 'admin';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  phone: string;
  idCard: string;
  avatar: string;
  companyId?: string;
  verified: boolean;
  skills: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  rating: number;
  acceptRate: number;
  bankAccount: string;
  bankName: string;
}

export interface Company {
  id: string;
  name: string;
  licenseNo: string;
  contact: string;
  status: string;
  balance: number;
}

export interface JobPost {
  id: string;
  companyId: string;
  title: string;
  type: 'hourly' | 'piecework';
  content: string;
  startDate: string;
  endDate: string;
  hourlyRate?: number;
  pieceRate?: number;
  workLocation: {
    lat: number;
    lng: number;
    address: string;
    radius: number;
  };
  skills: string[];
  requirements: string[];
  acceptanceCriteria: string[];
  status: 'draft' | 'published' | 'matched' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface MatchResult {
  id: string;
  jobId: string;
  workerId: string;
  worker?: User;
  skillMatchScore: number;
  distanceKm: number;
  ratingScore: number;
  acceptRateScore: number;
  totalScore: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Contract {
  id: string;
  jobId: string;
  companyId: string;
  workerId: string;
  content: string;
  templateVersion: string;
  companySigned: boolean;
  workerSigned: boolean;
  platformSigned: boolean;
  signedAt?: string;
  blockchainHash?: string;
  depositNo?: string;
  status: 'draft' | 'signing' | 'signed' | 'deposited';
}

export interface CheckIn {
  id: string;
  taskId: string;
  workerId: string;
  type: 'checkin' | 'checkout';
  timestamp: string;
  location: {
    lat: number;
    lng: number;
  };
  locationValid: boolean;
  photoUrl?: string;
  photoValid?: boolean;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  count: number;
  images: string[];
  description: string;
  submittedAt: string;
}

export interface Task {
  id: string;
  jobId: string;
  workerId: string;
  contractId: string;
  status: 'pending' | 'in_progress' | 'pending_review' | 'completed' | 'abnormal';
  actualHours?: number;
  pieceCount?: number;
  checkIns: CheckIn[];
  submissions?: TaskSubmission[];
  reviewResult?: 'pass' | 'reject';
  reviewComment?: string;
  riskFlags: string[];
}

export interface SettlementItem {
  id: string;
  name: string;
  amount: number;
  remark: string;
}

export interface Settlement {
  id: string;
  taskId: string;
  workerId: string;
  companyId: string;
  baseAmount: number;
  deductions: SettlementItem[];
  bonuses: SettlementItem[];
  totalBeforeTax: number;
  taxAmount: number;
  netAmount: number;
  taxBracket: string;
  status: 'pending' | 'confirmed' | 'paid' | 'failed';
  confirmedAt?: string;
  paidAt?: string;
}

export interface RiskFlag {
  id: string;
  taskId?: string;
  workerId?: string;
  type: string;
  level: 'low' | 'medium' | 'high';
  description: string;
  triggeredAt: string;
  status: 'pending' | 'reviewing' | 'reviewed' | 'cleared';
  reviewerId?: string;
  reviewComment?: string;
}

export interface Payout {
  id: string;
  settlementId: string;
  amount: number;
  bankAccount: string;
  bankName: string;
  accountName: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  retryCount: number;
  failReason?: string;
  paidAt?: string;
  transactionNo?: string;
}

export interface Invoice {
  id: string;
  settlementId: string;
  invoiceNo: string;
  amount: number;
  taxAmount: number;
  project: string;
  issuedAt: string;
  pdfUrl: string;
}

export interface Dispute {
  id: string;
  initiatorId: string;
  taskId: string;
  type: string;
  description: string;
  evidence: string[];
  status: 'pending' | 'reviewing' | 'resolved' | 'closed';
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface TaxDeclaration {
  id: string;
  period: string;
  companyId: string;
  workerId: string;
  settlementId: string;
  taxableIncome: number;
  taxAmount: number;
  declaredAt: string;
  status: string;
}
