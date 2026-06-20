import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import type {
  User,
  JobPost,
  MatchResult,
  Contract,
  Task,
  CheckIn,
  TaskSubmission,
  Settlement,
  Payout,
  Invoice,
  Dispute,
  TaxDeclaration,
  RiskFlag,
} from '@shared/types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data;
    if (data && typeof data === 'object' && data.success !== undefined && 'data' in data) {
      return data.data;
    }
    return data;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    const message = (error.response?.data as { message?: string })?.message || error.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);

export interface LoginRequest {
  username: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
  [key: string]: unknown;
}

export interface ListResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<unknown, LoginResponse>('/auth/login', data),
  profile: () =>
    api.get<unknown, User>('/auth/profile'),
};

export const jobsApi = {
  list: (params?: ListParams) =>
    api.get<unknown, ListResponse<JobPost>>('/jobs', { params }),
  get: (id: string) =>
    api.get<unknown, JobPost>(`/jobs/${id}`),
  create: (data: Partial<JobPost>) =>
    api.post<unknown, JobPost>('/jobs', data),
  match: (jobId: string) =>
    api.get<unknown, MatchResult[]>(`/jobs/${jobId}/match`),
  apply: (jobId: string) =>
    api.post<unknown, MatchResult>(`/jobs/${jobId}/apply`),
};

export interface ContractSignResult extends Contract {
  signStatus: Contract['status'];
  signedAt?: string;
}

export const contractsApi = {
  list: (params?: ListParams) =>
    api.get<unknown, ListResponse<Contract>>('/contracts', { params }),
  get: (id: string) =>
    api.get<unknown, Contract>(`/contracts/${id}`),
  sign: (id: string, party: 'company' | 'worker' | 'platform') =>
    api.post<unknown, ContractSignResult>(`/contracts/${id}/sign`, { party }),
  verify: (id: string) =>
    api.get<unknown, { valid: boolean; hash: string }>(`/contracts/${id}/verify`),
};

export interface CheckInPayload {
  type: 'checkin' | 'checkout';
  location: { lat: number; lng: number };
  photoUrl?: string;
}

export interface TaskSubmitPayload {
  count: number;
  images: string[];
  description: string;
}

export interface TaskReviewPayload {
  result: 'pass' | 'reject';
  comment: string;
}

export const tasksApi = {
  list: (params?: ListParams) =>
    api.get<unknown, ListResponse<Task>>('/tasks', { params }),
  get: (id: string) =>
    api.get<unknown, Task>(`/tasks/${id}`),
  checkin: (taskId: string, data: CheckInPayload) =>
    api.post<unknown, CheckIn>(`/tasks/${taskId}/checkin`, data),
  submit: (taskId: string, data: TaskSubmitPayload) =>
    api.post<unknown, TaskSubmission>(`/tasks/${taskId}/submit`, data),
  review: (taskId: string, data: TaskReviewPayload) =>
    api.post<unknown, Task>(`/tasks/${taskId}/review`, data),
};

export interface CalculateSettlementParams {
  actualHours?: number;
  pieceCount?: number;
}

export const settlementsApi = {
  list: (params?: ListParams) =>
    api.get<unknown, ListResponse<Settlement>>('/settlements', { params }),
  calculate: (taskId: string, params?: CalculateSettlementParams) =>
    api.get<unknown, Settlement>(`/settlements/calculate/${taskId}`, { params }),
  confirm: (id: string) =>
    api.post<unknown, Settlement>(`/settlements/${id}/confirm`),
};

export interface BatchPayoutPayload {
  settlementIds: string[];
}

export const payoutsApi = {
  list: (params?: ListParams) =>
    api.get<unknown, ListResponse<Payout>>('/payouts', { params }),
  batch: (data: BatchPayoutPayload) =>
    api.post<unknown, Payout[]>('/payouts/batch', data),
  retry: (id: string) =>
    api.post<unknown, Payout>(`/payouts/${id}/retry`),
};

export interface InvoiceDownloadResult {
  downloadUrl: string;
  invoiceNo: string;
}

export const invoicesApi = {
  list: (params?: ListParams) =>
    api.get<unknown, ListResponse<Invoice>>('/invoices', { params }),
  download: (id: string) =>
    api.get<unknown, InvoiceDownloadResult>(`/invoices/${id}/download`),
};

export const taxApi = {
  declarations: (params?: ListParams) =>
    api.get<unknown, ListResponse<TaxDeclaration>>('/tax/declarations', { params }),
  getDeclaration: (id: string) =>
    api.get<unknown, TaxDeclaration>('/tax/declarations/' + id),
};

export interface ReviewWarningPayload {
  action: 'approve' | 'reject' | 'clear';
  comment: string;
  reviewerId?: string;
}

export const riskApi = {
  warnings: (params?: ListParams) =>
    api.get<unknown, ListResponse<RiskFlag>>('/risk/warnings', { params }),
  reviewWarning: (id: string, data: ReviewWarningPayload) =>
    api.post<unknown, RiskFlag>(`/risk/warnings/${id}/review`, data),
};

export interface CreateDisputePayload {
  taskId: string;
  type: string;
  description: string;
  evidence: string[];
}

export interface ResolveDisputePayload {
  resolution: string;
}

export const disputesApi = {
  list: (params?: ListParams) =>
    api.get<unknown, ListResponse<Dispute>>('/disputes', { params }),
  create: (data: CreateDisputePayload) =>
    api.post<unknown, Dispute>('/disputes', data),
  resolve: (id: string, data: ResolveDisputePayload) =>
    api.post<unknown, Dispute>(`/disputes/${id}/resolve`, data),
};

export interface DashboardOverview {
  totalTasks: number;
  pendingTasks: number;
  totalSettlements: number;
  pendingSettlements: number;
  totalPayouts: number;
  pendingPayouts: number;
  riskCount: number;
  disputeCount: number;
}

export interface DashboardMonitor {
  taskTrend: { date: string; count: number }[];
  settlementTrend: { date: string; amount: number }[];
  riskDistribution: { type: string; count: number; level: string }[];
}

export interface DashboardEnterprise {
  topCompanies: { id: string; name: string; taskCount: number; amount: number }[];
  industryDistribution: { industry: string; amount: number; percent: number }[];
  regionalDistribution: { region: string; count: number; amount: number }[];
}

export const dashboardApi = {
  overview: () =>
    api.get<unknown, DashboardOverview>('/dashboard/overview'),
  monitor: () =>
    api.get<unknown, DashboardMonitor>('/dashboard/monitor'),
  enterprise: () =>
    api.get<unknown, DashboardEnterprise>('/dashboard/enterprise'),
};

export const apiClient = {
  auth: authApi,
  jobs: jobsApi,
  contracts: contractsApi,
  tasks: tasksApi,
  settlements: settlementsApi,
  payouts: payoutsApi,
  invoices: invoicesApi,
  tax: taxApi,
  risk: riskApi,
  disputes: disputesApi,
  dashboard: dashboardApi,
};

export default apiClient;
