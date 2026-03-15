import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import type { AdminTeacherRequest, AdminTeacherRequestStatus } from '../../types/adminType';
import { adminTeacherRequestsApi } from '../../services/adminApi';

const tabStatuses: Array<AdminTeacherRequestStatus | 'all'> = ['pending', 'approved', 'rejected', 'all'];

const AdminTeacherRequests = () => {
  const [tabValue, setTabValue] = useState(0);
  const [requests, setRequests] = useState<AdminTeacherRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AdminTeacherRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminTeacherRequestsApi.getTeacherRequests({
        page: 1,
        limit: 50,
        status: tabStatuses[tabValue],
        q: searchQuery.trim() || undefined,
      });
      setRequests(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teacher requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchRequests();
    }, 300);

    return () => clearTimeout(timeout);
  }, [tabValue, searchQuery]);

  const handleViewRequest = async (requestId: string) => {
    try {
      const detail = await adminTeacherRequestsApi.getTeacherRequestById(requestId);
      setSelectedRequest(detail);
      setOpenViewDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load request detail');
    }
  };

  const handleProcessRequest = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      await adminTeacherRequestsApi.processTeacherRequest(selectedRequest._id, {
        action,
        reason: action === 'reject' ? rejectReason || undefined : undefined,
      });
      setOpenApproveDialog(false);
      setOpenRejectDialog(false);
      setOpenViewDialog(false);
      setSelectedRequest(null);
      setRejectReason('');
      await fetchRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process request');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: AdminTeacherRequestStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: AdminTeacherRequestStatus) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Duyệt yêu cầu trở thành giáo viên
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dùng các API `/api/admin/teacher-requests` để xem, tra cứu và xử lý yêu cầu
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Tìm theo họ tên hoặc email"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </Paper>

      <Paper>
        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
          <Tab label="Chờ duyệt" />
          <Tab label="Đã duyệt" />
          <Tab label="Từ chối" />
          <Tab label="Tất cả" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Họ tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Người xử lý</TableCell>
                <TableCell>Ngày xử lý</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request._id} hover>
                    <TableCell>{request.full_name}</TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <Chip label={getStatusLabel(request.status)} size="small" color={getStatusColor(request.status) as any} />
                    </TableCell>
                    <TableCell>{request.processed_by || '-'}</TableCell>
                    <TableCell>{request.processed_at ? new Date(request.processed_at).toLocaleDateString('vi-VN') : '-'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<Visibility />} onClick={() => handleViewRequest(request._id)}>
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      Không có yêu cầu phù hợp
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết yêu cầu</DialogTitle>
        <DialogContent>
          {selectedRequest ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography><strong>Họ tên:</strong> {selectedRequest.full_name}</Typography>
              <Typography><strong>Email:</strong> {selectedRequest.email}</Typography>
              <Typography><strong>Ngày tạo:</strong> {new Date(selectedRequest.created_at).toLocaleString('vi-VN')}</Typography>
              <Typography><strong>Trạng thái:</strong> {getStatusLabel(selectedRequest.status)}</Typography>
              <Typography><strong>Credential:</strong> {selectedRequest.credential || '-'}</Typography>
              <Typography><strong>Lý do / ghi chú:</strong> {selectedRequest.reason || '-'}</Typography>
              <TextField
                label="Attachments"
                value={(selectedRequest.attachments || []).join('\n')}
                multiline
                minRows={4}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Đóng</Button>
          {selectedRequest?.status === 'pending' && (
            <>
              <Button color="error" onClick={() => setOpenRejectDialog(true)}>
                Từ chối
              </Button>
              <Button variant="contained" color="success" onClick={() => setOpenApproveDialog(true)}>
                Phê duyệt
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)}>
        <DialogTitle>Phê duyệt yêu cầu</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Hệ thống sẽ cập nhật role của user sang `teacher` nếu yêu cầu còn ở trạng thái pending.
          </Alert>
          <Typography>
            Xác nhận phê duyệt yêu cầu của <strong>{selectedRequest?.full_name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApproveDialog(false)}>Hủy</Button>
          <Button variant="contained" color="success" onClick={() => handleProcessRequest('approve')} disabled={actionLoading}>
            Phê duyệt
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Từ chối yêu cầu</DialogTitle>
        <DialogContent>
          <TextField
            label="Lý do từ chối"
            fullWidth
            multiline
            minRows={4}
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={() => handleProcessRequest('reject')} disabled={actionLoading}>
            Từ chối
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTeacherRequests;
