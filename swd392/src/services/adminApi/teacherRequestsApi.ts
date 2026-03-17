import { apiService } from '../api';
import type {
  AdminTeacherRequest,
  ProcessTeacherRequestPayload,
  ProcessTeacherRequestResponse,
  TeacherRequestsParams,
  TeacherRequestsResponse,
} from '../../types/adminType';

export const adminTeacherRequestsApi = {
  getTeacherRequests: async (params: TeacherRequestsParams = {}): Promise<TeacherRequestsResponse> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.status) searchParams.set('status', params.status);
    if (params.q) searchParams.set('q', params.q);

    const queryString = searchParams.toString();
    const response = await apiService.get(`/admin/teacher-requests${queryString ? `?${queryString}` : ''}`);
    return response;
  },

  getTeacherRequestById: async (requestId: string): Promise<AdminTeacherRequest> => {
    const response = await apiService.get(`/admin/teacher-requests/${requestId}`);
    return response;
  },

  processTeacherRequest: async (
    requestId: string,
    payload: ProcessTeacherRequestPayload,
  ): Promise<ProcessTeacherRequestResponse> => {
    const response = await apiService.patch(`/admin/teacher-requests/${requestId}`, payload);
    return response;
  },
};