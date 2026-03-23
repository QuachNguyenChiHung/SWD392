import { apiService } from './api';

export interface AiHistoryMessage {
  responder: 'ai' | 'user';
  content: string;
  at: string;
}

export interface AiHistoryRequest {
  _id: string;
  user_id: string;
  AiSession_id?: string;
  messages: AiHistoryMessage[];
  type?: string;
  date?: string;
  createdAt?: string;
  contents?: AiNestedContentRecord[];
  [key: string]: unknown;
}

export interface AiSessionResponse {
  _id: string;
  user_id: string;
  ai_model: string;
  total_input_tokens: number;
  total_output_tokens: number;
  estimated_cost_cents: number;
  budget_cents: number;
  last_activity: string;
  created_at: string;
  status: string;
  requests: AiHistoryRequest[];
}

export interface AiNestedContentRecord {
  _id?: string;
  ai_request_id?: string;
  review_status?: string;
  content_type?: string;
  record_json?: {
    response?: string;
    full_response?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface AdminAiHistoryResponse {
  data: AiHistoryRequest[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AiContentRecord {
  _id?: string;
  request_id?: string;
  ai_request_id?: string;
  review_status?: string;
  content_type?: string;
  record_json?: unknown;
  response?: unknown;
  content?: unknown;
  output?: unknown;
  result?: unknown;
  message?: string;
  date?: string;
  createdAt?: string;
  [key: string]: unknown;
}

const normalizeRequestList = (payload: unknown): AiHistoryRequest[] => {
  if (Array.isArray(payload)) {
    return payload as AiHistoryRequest[];
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return ((payload as { data: unknown[] }).data ?? []) as AiHistoryRequest[];
  }

  return [];
};

const normalizeAdminResponse = (payload: unknown): AdminAiHistoryResponse => {
  const fallback: AdminAiHistoryResponse = {
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
  };

  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const response = payload as Partial<AdminAiHistoryResponse>;

  return {
    data: Array.isArray(response.data) ? (response.data as AiHistoryRequest[]) : [],
    total: typeof response.total === 'number' ? response.total : 0,
    page: typeof response.page === 'number' ? response.page : 1,
    pageSize: typeof response.pageSize === 'number' ? response.pageSize : 20,
  };
};

const normalizeContentList = (payload: unknown): AiContentRecord[] => {
  if (Array.isArray(payload)) {
    return payload as AiContentRecord[];
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return ((payload as { data: unknown[] }).data ?? []) as AiContentRecord[];
  }

  return [];
};

export const aiHistoryApi = {
  async getTeacherLatestSession(): Promise<AiSessionResponse | null> {
    const response: any = await apiService.get('/teacher/ai-session');
    return response?.data ?? null;
  },

  async getStudentLatestSession(): Promise<AiSessionResponse | null> {
    const response: any = await apiService.get('/student/ai-session');
    return response?.data ?? null;
  },

  async getTeacherHistory(): Promise<AiHistoryRequest[]> {
    const response = await apiService.get('/teacher/ai-history');
    return normalizeRequestList(response);
  },

  async getStudentHistory(): Promise<AiHistoryRequest[]> {
    const response = await apiService.get('/student/ai-history');
    return normalizeRequestList(response);
  },

  async getAdminHistoryByUser(userId: string, page = 1): Promise<AdminAiHistoryResponse> {
    const response = await apiService.get(`/admin/ai-history/${userId}?page=${page}`);
    return normalizeAdminResponse(response);
  },

  async getAdminRequestContent(requestId: string): Promise<AiContentRecord[]> {
    const response = await apiService.get(`/admin/ai-history/${requestId}/content`);
    return normalizeContentList(response);
  },
};
